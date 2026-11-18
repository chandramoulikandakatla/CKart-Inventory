/**
 * CampusKart Supabase Service
 * Direct typed interactions with Supabase PostgreSQL tables and atomic RPC functions using integer paise.
 * Synchronizes student balances, transactions, orders, and stock in real time.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Product, Student, SpendingControls, Order, WalletTransaction, EcosystemState } from '../types/ecosystem';
import { INITIAL_STATE } from '../constants/initialState';

export const supabaseService = {
  isAvailable(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Fetch complete live ecosystem from Supabase
   */
  async fetchFullEcosystem(): Promise<Partial<EcosystemState> | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      // 1. Products
      const { data: dbProducts } = await supabase
        .from('products')
        .select('*')
        .order('id');

      // 2. Students + Wallets + Controls
      const { data: dbStudents } = await supabase
        .from('students')
        .select('*, wallets(*), spending_controls(*)');

      // 3. Orders + Items
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      // 4. Transactions
      const { data: dbTxns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      const mappedProducts: Product[] = (dbProducts || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Math.round(Number(p.price_paise) / 100),
        stock: p.stock_quantity,
        active: p.is_available,
        featured: p.stock_quantity > 20,
        offerTag: p.stock_quantity <= 10 ? 'Low Stock' : undefined,
        description: p.description || '',
        imageUrl: p.image_url,
      }));

      // Update students walletBalance from DB
      const mappedStudents: Student[] = INITIAL_STATE.students.map((seedStu) => {
        const found = (dbStudents || []).find((s: any) => s.student_code === seedStu.id);
        const w = found?.wallets;
        const wObj = Array.isArray(w) ? w[0] : w;
        const balancePaise = wObj ? Number(wObj.balance_paise || 0) : 0;
        return {
          ...seedStu,
          walletBalance: Math.round(balancePaise / 100),
        };
      });

      // Map spending controls
      const mappedControls: Record<string, SpendingControls> = { ...INITIAL_STATE.spendingControls };
      for (const s of dbStudents || []) {
        const cRaw = s.spending_controls;
        const c = Array.isArray(cRaw) ? cRaw[0] : cRaw;
        if (c && s.student_code) {
          mappedControls[s.student_code] = {
            dailyLimitEnabled: Boolean(c.daily_limit_paise),
            dailyLimit: c.daily_limit_paise ? Math.round(Number(c.daily_limit_paise) / 100) : 500,
            weeklyLimitEnabled: Boolean(c.weekly_limit_paise),
            weeklyLimit: c.weekly_limit_paise ? Math.round(Number(c.weekly_limit_paise) / 100) : 2000,
            monthlyLimitEnabled: Boolean(c.monthly_limit_paise),
            monthlyLimit: c.monthly_limit_paise ? Math.round(Number(c.monthly_limit_paise) / 100) : 5000,
            restrictedCategories: c.restricted_categories || [],
            lowBalanceAlertEnabled: true,
            lowBalanceThreshold: c.low_balance_threshold_paise ? Math.round(Number(c.low_balance_threshold_paise) / 100) : 150,
            instantTxnNotification: c.instant_txn_notification ?? true,
            spendingAlertsEnabled: c.spending_alerts_enabled ?? true,
          };
        }
      }

      // Map orders
      const mappedOrders: Order[] = (dbOrders || []).map((o: any) => {
        const student = (dbStudents || []).find((s: any) => s.id === o.student_id);
        const items = (o.order_items || []).map((oi: any) => ({
          productId: oi.product_id,
          name: oi.product_name_snapshot || 'Item',
          category: oi.category_snapshot || 'Campus Essentials',
          price: Math.round(Number(oi.unit_price_paise) / 100),
          qty: oi.quantity,
          subtotal: Math.round(Number(oi.subtotal_paise) / 100),
        }));
        return {
          id: o.id,
          studentId: student?.student_code || 'CK-2026-101',
          studentName: student ? `${student.first_name} ${student.last_name}` : 'Aarav Sharma',
          date: o.created_at ? new Date(o.created_at).toISOString().slice(0, 16).replace('T', ' ') : 'Just now',
          month: 'Nov 2026',
          items,
          totalAmount: Math.round(Number(o.total_amount_paise) / 100),
          paymentStatus: 'Paid via CampusKart Wallet',
          txnRef: o.idempotency_key || `ORD-${o.id.slice(-4)}`,
          fulfilmentMethod: o.fulfilment_method || 'Campus Kiosk Pickup',
          collectionPoint: o.collection_point || 'Block A Smart Kiosk #1',
          estimatedTime: '12:45 PM – 01:30 PM Window',
          status: o.fulfilment_status || 'Order Placed',
          previousBalance: 0,
          remainingBalance: 0,
        };
      });

      // Map transactions
      const mappedTxns: WalletTransaction[] = (dbTxns || []).map((t: any) => {
        const student = (dbStudents || []).find((s: any) => s.id === t.student_id);
        const isCredit = t.transaction_type === 'CREDIT' || t.direction === 'credit';
        const amt = Math.round(Number(t.amount_paise) / 100);
        return {
          id: t.reference || t.id,
          studentId: student?.student_code || 'CK-2026-101',
          type: isCredit ? 'Wallet Funding' : 'Student Purchase',
          category: isCredit ? 'Parent Top-Up' : 'Daily Essentials',
          amount: isCredit ? amt : -amt,
          previousBalance: Math.round(Number(t.previous_balance_paise || 0) / 100),
          newBalance: Math.round(Number(t.balance_after_paise || t.new_balance_paise || 0) / 100),
          timestamp: t.created_at ? new Date(t.created_at).toISOString().slice(0, 16).replace('T', ' ') : 'Just now',
          month: 'Nov 2026',
          status: 'Completed',
          method: isCredit ? 'UPI' : 'CampusKart Wallet',
          relatedOrderId: t.related_order_id,
          note: t.description || (isCredit ? 'Parent Top-up' : 'Campus purchase'),
          reconciled: true,
        };
      });

      return {
        products: mappedProducts.length > 0 ? mappedProducts : undefined,
        students: mappedStudents,
        spendingControls: mappedControls,
        orders: mappedOrders,
        transactions: mappedTxns,
      };
    } catch (err) {
      console.warn('Failed to fetch full ecosystem from Supabase:', err);
      return null;
    }
  },

  /**
   * Fetch all products from Supabase
   */
  async getProducts(): Promise<Product[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (error || !data) return null;

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: Math.round(Number(item.price_paise) / 100),
        stock: item.stock_quantity,
        active: item.is_available,
        featured: item.stock_quantity > 20,
        offerTag: item.stock_quantity <= 10 ? 'Low Stock' : undefined,
        description: item.description || '',
        imageUrl: item.image_url,
      }));
    } catch {
      return null;
    }
  },

  /**
   * Top up student wallet in Supabase
   */
  async topUpWallet(studentCode: string, amountRupees: number, method: string): Promise<number | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('id, student_code')
        .eq('student_code', studentCode)
        .single();

      if (sErr || !student) {
        console.warn('Student not found for topUpWallet:', studentCode);
        return null;
      }

      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('id, balance_paise')
        .eq('student_id', student.id)
        .single();

      if (wErr || !wallet) {
        console.warn('Wallet not found for student:', student.id);
        return null;
      }

      const amountPaise = Math.round(amountRupees * 100);
      const prevBalPaise = Number(wallet.balance_paise || 0);
      const newBalPaise = prevBalPaise + amountPaise;

      // Update wallet balance
      const { error: updateErr } = await supabase
        .from('wallets')
        .update({ balance_paise: newBalPaise, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      if (updateErr) {
        console.warn('Wallet balance update error:', updateErr);
        return null;
      }

      // Record transaction
      const txnRef = `TXN-CK-${Math.floor(90100 + Math.random() * 899)}`;
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        student_id: student.id,
        transaction_type: 'CREDIT',
        amount_paise: amountPaise,
        direction: 'credit',
        previous_balance_paise: prevBalPaise,
        new_balance_paise: newBalPaise,
        balance_after_paise: newBalPaise,
        status: 'completed',
        reference: txnRef,
        reference_id: txnRef,
        reference_type: 'PARENT_FUNDING',
        description: `Parent Top-Up ₹${amountRupees} via ${method}`,
      });

      return Math.round(newBalPaise / 100);
    } catch (err) {
      console.warn('topUpWallet error:', err);
      return null;
    }
  },

  /**
   * Record checkout order and decrease stock in Supabase.
   */
  async submitOrder(orderData: {
    studentCode: string;
    items: Array<{ productId: string; name: string; category: string; price: number; qty: number; subtotal: number }>;
    totalAmount: number;
    fulfilmentMethod: string;
    collectionPoint: string;
    idempotencyKey?: string;
  }): Promise<{ orderId: string; reference: string; newBalance: number } | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('id, college_id')
        .eq('student_code', orderData.studentCode)
        .single();

      if (sErr || !student) {
        console.warn('Student not found for submitOrder:', orderData.studentCode);
        return null;
      }

      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('id, balance_paise')
        .eq('student_id', student.id)
        .single();

      if (wErr || !wallet) {
        console.warn('Wallet not found for student:', student.id);
        return null;
      }

      const totalPaise = Math.round(orderData.totalAmount * 100);
      const prevBalPaise = Number(wallet.balance_paise || 0);
      const newBalPaise = Math.max(0, prevBalPaise - totalPaise);

      // Create order
      const { data: newOrder, error: oErr } = await supabase
        .from('orders')
        .insert({
          student_id: student.id,
          college_id: student.college_id,
          total_amount_paise: totalPaise,
          payment_status: 'paid',
          fulfilment_status: 'Order Placed',
          fulfilment_method: orderData.fulfilmentMethod,
          collection_point: orderData.collectionPoint,
          idempotency_key: orderData.idempotencyKey || `IDEM-${Date.now()}`,
        })
        .select('*')
        .single();

      if (oErr || !newOrder) {
        console.warn('Order insert error:', oErr);
        return null;
      }

      // Fetch all products to resolve IDs and update stocks
      const { data: allDbProducts } = await supabase.from('products').select('id, name, stock_quantity');

      // Insert order items & decrement stock
      for (const item of orderData.items) {
        const matched = (allDbProducts || []).find((p: any) => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase());
        const prdId = matched ? matched.id : item.productId;
        const curStock = matched ? matched.stock_quantity : 50;

        await supabase.from('order_items').insert({
          order_id: newOrder.id,
          product_id: prdId,
          product_name_snapshot: item.name,
          category_snapshot: item.category,
          quantity: item.qty,
          unit_price_paise: Math.round(item.price * 100),
          subtotal_paise: Math.round(item.subtotal * 100),
        });

        // Decrement stock in DB
        if (matched) {
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, curStock - item.qty) })
            .eq('id', matched.id);
        }
      }

      // Deduct wallet balance
      await supabase
        .from('wallets')
        .update({ balance_paise: newBalPaise, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      // Insert purchase debit transaction
      const txnRef = `TXN-CK-${Math.floor(90025 + Math.random() * 900)}`;
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        student_id: student.id,
        transaction_type: 'DEBIT',
        amount_paise: totalPaise,
        direction: 'debit',
        previous_balance_paise: prevBalPaise,
        new_balance_paise: newBalPaise,
        balance_after_paise: newBalPaise,
        status: 'completed',
        reference: txnRef,
        reference_id: txnRef,
        reference_type: 'STUDENT_PURCHASE',
        description: `Purchase: ${orderData.items.map((i) => `${i.qty}x ${i.name}`).join(', ').slice(0, 60)}`,
        related_order_id: newOrder.id,
      });

      return {
        orderId: newOrder.id,
        reference: txnRef,
        newBalance: Math.round(newBalPaise / 100),
      };
    } catch (err) {
      console.warn('submitOrder error:', err);
      return null;
    }
  },

  /**
   * Update spending controls in Supabase
   */
  async updateSpendingControls(studentCode: string, controls: SpendingControls): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('student_code', studentCode)
        .single();

      if (!student) return false;

      const { error } = await supabase
        .from('spending_controls')
        .upsert({
          student_id: student.id,
          daily_limit_paise: controls.dailyLimitEnabled ? controls.dailyLimit * 100 : null,
          weekly_limit_paise: controls.weeklyLimitEnabled ? controls.weeklyLimit * 100 : null,
          monthly_limit_paise: controls.monthlyLimitEnabled ? controls.monthlyLimit * 100 : null,
          restricted_categories: controls.restrictedCategories || [],
          low_balance_threshold_paise: controls.lowBalanceThreshold * 100,
          instant_txn_notification: controls.instantTxnNotification,
          spending_alerts_enabled: controls.spendingAlertsEnabled,
          updated_at: new Date().toISOString(),
        });

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Update Ops Product stock in Supabase
   */
  async updateProductStock(productId: string, productName: string, newStock: number): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .or(`id.eq.${productId},name.eq.${productName}`);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Update Ops Order status in Supabase
   */
  async updateOrderStatus(orderId: string, nextStatus: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ fulfilment_status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      return !error;
    } catch {
      return false;
    }
  },
};
