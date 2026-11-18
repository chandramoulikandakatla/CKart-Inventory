/**
 * Operations Management Service
 */

import { store, saveStore } from '../store/index.js';
import { verifyToken, hashSecret } from '../security/index.js';

export const opsService = {
  getDashboard(token: string | null) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return { status: 403, error: 'Unauthorized: Operations access only' };
    }

    return {
      status: 200,
      data: {
        products: store.products,
        orders: store.orders,
        students: store.students.map((s) => {
          const w = store.wallets.get(s.id);
          return {
            id: s.id,
            student_code: s.student_code,
            name: `${s.first_name} ${s.last_name}`,
            academic_year: s.academic_year,
            account_status: s.account_status,
            wallet_balance_paise: w ? w.balance_paise : 0,
          };
        }),
        students_count: store.students.length,
      },
    };
  },

  updateOrderStatus(token: string | null, body: { order_id?: string; status?: string }) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return { status: 403, error: 'Unauthorized: Operations staff access only' };
    }

    const { order_id, status } = body;
    if (!order_id || !status) return { status: 400, error: 'Missing order_id or status' };

    const order = store.orders.find((o) => o.id === order_id || o.reference === order_id);
    if (!order) return { status: 404, error: 'Order not found' };

    order.fulfilment_status = status;

    // Add student notification
    store.notifications.unshift({
      id: `NTF-${Date.now()}`,
      student_id: order.student_id,
      title: `Order ${order.reference} Status Updated`,
      message: `Your order is now: ${status}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    saveStore(store);

    return { status: 200, data: { success: true, order_id: order.id, status } };
  },

  enrollStudent(token: string | null, body: any) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return { status: 403, error: 'Unauthorized: Operations staff access only' };
    }

    const { name, academic_year, parent_name, initial_wallet_paise, parent_mobile, pin, password } = body;
    if (!name || !name.trim()) return { status: 400, error: 'Student name is required' };

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Student';

    const nextIndex = 100 + store.students.length + 1;
    const studentCode = `CK-2026-${nextIndex}`;
    const studentId = `STU-${nextIndex}`;
    const parentId = `PAR-${nextIndex + 400}`;

    // Create Parent Record
    store.parents.push({
      id: parentId,
      mobile: parent_mobile || `98765${nextIndex.toString().padStart(5, '0')}`,
      password_hash: hashSecret('parent123'),
      name: parent_name || 'Guardian',
    });

    // Create Student Record
    const student = {
      id: studentId,
      student_code: studentCode,
      first_name: firstName,
      last_name: lastName,
      academic_year: academic_year || 'Grade 11 - MPC',
      college_id: 'COL-001',
      account_status: 'active',
      password_hash: hashSecret(password || `PASS${nextIndex}`),
      pin_hash: hashSecret(pin || '2026'),
      parent_account_id: parentId,
    };
    store.students.push(student);

    // Create Initial Wallet
    const initialBalance = Number(initial_wallet_paise) || 0;
    store.wallets.set(studentId, {
      student_id: studentId,
      balance_paise: initialBalance,
      status: 'active',
    });

    // Default Spending Controls
    store.spending_controls.set(studentId, {
      daily_limit_paise: 50000,
      single_txn_limit_paise: 25000,
      allowed_categories: ['All', 'Stationery', 'Meals & Snacks', 'Beverages', 'Academic Tools', 'Uniform & Lab Kits'],
      card_locked: false,
    });

    // Initial Ledger Transaction
    if (initialBalance > 0) {
      store.transactions.unshift({
        id: `TXN-${Date.now()}`,
        wallet_id: `WLT-${studentId}`,
        student_id: studentId,
        type: 'CREDIT',
        amount_paise: initialBalance,
        balance_after_paise: initialBalance,
        reference: `FND-INIT-${studentCode}`,
        description: 'Enrollment Initial Balance',
        created_at: new Date().toISOString(),
      });
    }

    saveStore(store);

    return {
      status: 201,
      data: {
        success: true,
        student: {
          id: student.id,
          student_code: student.student_code,
          name: `${student.first_name} ${student.last_name}`,
          academic_year: student.academic_year,
          account_status: student.account_status,
          wallet_balance_paise: initialBalance,
        },
      },
    };
  },

  toggleStudentStatus(token: string | null, body: { student_id?: string; status?: string }) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return { status: 403, error: 'Unauthorized: Operations staff access only' };
    }

    const { student_id, status } = body;
    const student = store.students.find((s) => s.id === student_id || s.student_code === student_id);
    if (!student) return { status: 404, error: 'Student not found' };

    student.account_status = status || (student.account_status === 'active' ? 'inactive' : 'active');
    saveStore(store);

    return {
      status: 200,
      data: {
        success: true,
        student_id: student.id,
        student_code: student.student_code,
        account_status: student.account_status,
      },
    };
  },

  updateProduct(token: string | null, body: any) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return { status: 403, error: 'Unauthorized: Operations staff access only' };
    }

    const { id, name, category, price_paise, stock_quantity, description, is_available } = body;
    if (id) {
      const product = store.products.find((p) => p.id === id);
      if (!product) return { status: 404, error: 'Product not found' };
      if (price_paise !== undefined) product.price_paise = price_paise;
      if (stock_quantity !== undefined) product.stock_quantity = stock_quantity;
      if (is_available !== undefined) product.is_available = is_available;
      if (description !== undefined) product.description = description;

      saveStore(store);
      return { status: 200, data: { success: true, product } };
    }

    const newProduct = {
      id: `PRD-${Date.now().toString().slice(-4)}`,
      college_id: 'COL-001',
      name: name || 'New Item',
      category: category || 'General',
      price_paise: price_paise || 1000,
      stock_quantity: stock_quantity || 10,
      is_available: is_available !== undefined ? is_available : true,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
      description: description || 'Campus store item',
    };
    store.products.push(newProduct);

    saveStore(store);
    return { status: 201, data: { success: true, product: newProduct } };
  },
};
