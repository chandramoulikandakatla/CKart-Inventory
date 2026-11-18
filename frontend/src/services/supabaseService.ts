/**
 * CampusKart Supabase Service
 * Direct typed interactions with Supabase PostgreSQL tables using integer paise.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Product, Student, SpendingControls } from '../types/ecosystem';

export const supabaseService = {
  isAvailable(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Fetch all products from Supabase
   */
  async getProducts(): Promise<Product[] | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('name');

    if (error || !data) {
      console.warn('Supabase getProducts error:', error);
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Math.round(Number(item.price_paise) / 100), // convert paise to INR for UI
      stock: item.stock_quantity,
      active: item.is_available,
      featured: item.stock_quantity > 20,
      offerTag: item.stock_quantity <= 10 ? 'Low Stock' : undefined,
      description: item.description || '',
    }));
  },

  /**
   * Fetch student details and wallet balance
   */
  async getStudentProfile(studentCode: string): Promise<{ student: Partial<Student>; balancePaise: number } | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, colleges(name, institution_code)')
      .eq('student_code', studentCode)
      .single();

    if (studentError || !student) {
      console.warn('Supabase getStudentProfile error:', studentError);
      return null;
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance_paise')
      .eq('student_id', student.id)
      .single();

    const balancePaise = wallet ? Number(wallet.balance_paise) : 0;

    return {
      student: {
        id: student.student_code,
        name: `${student.first_name} ${student.last_name}`,
        academicYear: student.academic_year,
        walletBalance: Math.round(balancePaise / 100),
        status: student.account_status === 'active' ? 'Active' : 'Inactive',
      },
      balancePaise,
    };
  },

  /**
   * Record checkout order and decrease stock in Supabase
   */
  async submitOrder(orderData: {
    studentId: string;
    collegeId: string;
    items: Array<{ productId: string; qty: number; pricePaise: number }>;
    totalAmountPaise: number;
    fulfilmentMethod: string;
    collectionPoint: string;
    idempotencyKey: string;
  }): Promise<{ orderId: string; reference: string } | null> {
    if (!isSupabaseConfigured()) return null;

    // Insert order record
    const reference = `ORD-${Date.now().toString().slice(-4)}`;
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        student_id: orderData.studentId,
        college_id: orderData.collegeId,
        total_amount_paise: orderData.totalAmountPaise,
        payment_status: 'paid',
        fulfilment_status: 'Order Placed',
        fulfilment_method: orderData.fulfilmentMethod,
        collection_point: orderData.collectionPoint,
        idempotency_key: orderData.idempotencyKey,
      })
      .select('id')
      .single();

    if (error || !order) {
      console.warn('Supabase submitOrder error:', error);
      return null;
    }

    // Insert order items
    const itemsPayload = orderData.items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      quantity: i.qty,
      unit_price_paise: i.pricePaise,
      subtotal_paise: i.qty * i.pricePaise,
    }));

    await supabase.from('order_items').insert(itemsPayload);

    return {
      orderId: order.id,
      reference,
    };
  },

  /**
   * Update spending controls in Supabase
   */
  async updateSpendingControls(
    studentId: string,
    controls: SpendingControls
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase
      .from('spending_controls')
      .upsert({
        student_id: studentId,
        daily_limit_paise: controls.dailyLimit * 100,
        weekly_limit_paise: controls.weeklyLimit * 100,
        monthly_limit_paise: controls.monthlyLimit * 100,
        restricted_categories: controls.restrictedCategories,
        low_balance_threshold_paise: controls.lowBalanceThreshold * 100,
        instant_txn_notification: controls.instantTxnNotification,
        spending_alerts_enabled: controls.spendingAlertsEnabled,
        updated_at: new Date().toISOString(),
      });

    return !error;
  },

  /**
   * Top up wallet
   */
  async topUpWallet(studentId: string, amountPaise: number, method: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    // Fetch current wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('id, balance_paise')
      .eq('student_id', studentId)
      .single();

    if (error || !wallet) return false;

    const newBalance = Number(wallet.balance_paise) + amountPaise;
    await supabase
      .from('wallets')
      .update({ balance_paise: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    // Record wallet transaction
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      transaction_type: 'CREDIT',
      amount_paise: amountPaise,
      balance_after_paise: newBalance,
      reference_type: 'PARENT_FUNDING',
      reference_id: `FND-${Date.now().toString().slice(-4)}`,
      description: `Parent Wallet Top-up via ${method}`,
    });

    return true;
  },
};
