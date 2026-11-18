/**
 * Order Processing & Atomic Checkout Service
 */

import { store, saveStore } from '../store/index.js';
import { verifyToken } from '../security/index.js';

export const orderService = {
  checkout(token: string | null, body: any) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'student') {
      return { status: 403, error: 'Unauthorized: Student access only' };
    }

    const { items, fulfilment_method, collection_point, idempotency_key, simulate_failure } = body;

    if (simulate_failure) {
      return { status: 500, error: 'Simulated payment processing failure' };
    }

    // Check idempotency replay
    if (idempotency_key) {
      const existingOrder = store.orders.find((o) => o.idempotency_key === idempotency_key);
      if (existingOrder) {
        const wallet = store.wallets.get(session.entityId);
        return {
          status: 200,
          data: {
            order_id: existingOrder.id,
            reference: existingOrder.reference,
            total_amount_paise: existingOrder.total_amount_paise,
            previous_balance_paise: (wallet?.balance_paise || 0) + existingOrder.total_amount_paise,
            new_balance_paise: wallet?.balance_paise || 0,
            simulated: false,
          },
        };
      }
    }

    const studentId = session.entityId;
    const student = store.students.find((s) => s.id === studentId);
    if (student && student.account_status !== 'active') {
      return { status: 403, error: `Account is ${student.account_status}. Orders blocked.` };
    }

    const wallet = store.wallets.get(studentId);
    if (!wallet) return { status: 404, error: 'Wallet not found' };

    // Check card locked
    const controls = store.spending_controls.get(studentId);
    if (controls?.card_locked) {
      return { status: 403, error: 'Student card/wallet is locked by parent' };
    }

    // Calculate total and verify stock
    let totalPaise = 0;
    const orderItems = [];

    for (const item of items) {
      const product = store.products.find((p) => p.id === item.product_id);
      if (!product) return { status: 404, error: `Product ${item.product_id} not found` };
      if (product.stock_quantity < item.quantity) {
        return { status: 400, error: `Insufficient stock for ${product.name}` };
      }

      // Category restrictions check
      if (
        controls &&
        controls.allowed_categories &&
        controls.allowed_categories.length > 0 &&
        !controls.allowed_categories.includes('All')
      ) {
        if (!controls.allowed_categories.includes(product.category)) {
          return { status: 403, error: `Purchase of ${product.category} items is restricted by parent controls` };
        }
      }

      totalPaise += product.price_paise * item.quantity;
      orderItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price_paise: product.price_paise,
      });
    }

    // Check single transaction limit
    if (controls && totalPaise > controls.single_txn_limit_paise) {
      return { status: 403, error: 'Order exceeds single transaction limit' };
    }

    // Check daily limit
    const todayDate = new Date().toISOString().slice(0, 10);
    const todaySpentPaise = store.orders
      .filter((o) => o.student_id === studentId && o.created_at.startsWith(todayDate) && o.payment_status === 'paid')
      .reduce((acc, o) => acc + o.total_amount_paise, 0);

    if (controls && todaySpentPaise + totalPaise > controls.daily_limit_paise) {
      return { status: 403, error: 'Order exceeds student daily spending limit' };
    }

    // Check balance
    if (wallet.balance_paise < totalPaise) {
      return { status: 400, error: 'Insufficient wallet balance' };
    }

    // Atomically decrement stock
    for (const item of items) {
      const product = store.products.find((p) => p.id === item.product_id);
      if (product) product.stock_quantity -= item.quantity;
    }

    // Decrement wallet balance
    const previousBalance = wallet.balance_paise;
    wallet.balance_paise -= totalPaise;

    const orderId = `ORD-${Date.now()}`;
    const reference = `ORD-2026-${Date.now().toString().slice(-4)}`;

    const newOrder = {
      id: orderId,
      reference,
      student_id: studentId,
      college_id: 'COL-001',
      total_amount_paise: totalPaise,
      payment_status: 'paid',
      fulfilment_status: 'Order Placed',
      fulfilment_method: fulfilment_method || 'Campus Kiosk Pickup',
      collection_point: collection_point || 'Main Canteen Counter 1',
      idempotency_key: idempotency_key || `idemp-${Date.now()}`,
      created_at: new Date().toISOString(),
      items: orderItems,
    };
    store.orders.unshift(newOrder);

    // Record transaction
    store.transactions.unshift({
      id: `TXN-${Date.now()}`,
      wallet_id: `WLT-${studentId}`,
      student_id: studentId,
      type: 'DEBIT',
      amount_paise: totalPaise,
      balance_after_paise: wallet.balance_paise,
      reference,
      description: `Order ${reference}`,
      created_at: new Date().toISOString(),
    });

    saveStore(store);

    return {
      status: 200,
      data: {
        order_id: orderId,
        reference,
        total_amount_paise: totalPaise,
        previous_balance_paise: previousBalance,
        new_balance_paise: wallet.balance_paise,
        simulated: false,
      },
    };
  },

  markNotificationsRead(token: string | null) {
    const session = token ? verifyToken(token) : null;
    if (session && session.role === 'student') {
      store.notifications
        .filter((n) => n.student_id === session.entityId)
        .forEach((n) => (n.is_read = true));
      saveStore(store);
    }
    return { status: 200, data: { ok: true } };
  },
};
