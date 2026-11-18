/**
 * Supabase Ecosystem Orchestration Service
 * Hydrates complete live ecosystem state on app load.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Order, WalletTransaction, SpendingControls, EcosystemState } from '../../types/ecosystem';
import { INITIAL_STATE } from '../../constants/initialState';
import { productService } from './productService';
import { studentService } from './studentService';
import { notificationService } from './notificationService';
import { DbStudent, DbOrder, DbTransaction, extractRelation } from './types';

export const ecosystemService = {
  /**
   * Fetch complete live ecosystem from Supabase
   */
  async fetchFullEcosystem(): Promise<Partial<EcosystemState> | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      // 1. Products
      const products = await productService.getProducts();

      // 2. Students & Wallets
      const studentResult = await studentService.getStudents();
      const dbStudents = studentResult?.dbStudents || [];
      const students = studentResult?.students;

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

      // 5. Notifications
      const notifications = await notificationService.fetchNotifications(dbStudents);

      // Map spending controls
      const mappedControls: Record<string, SpendingControls> = { ...INITIAL_STATE.spendingControls };
      for (const s of dbStudents) {
        const c = extractRelation(s.spending_controls);
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
      const mappedOrders: Order[] = (dbOrders || []).map((o: DbOrder) => {
        const student = dbStudents.find((s: DbStudent) => s.id === o.student_id);
        const items = (o.order_items || []).map((oi) => ({
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
      const mappedTxns: WalletTransaction[] = (dbTxns || []).map((t: DbTransaction) => {
        const student = dbStudents.find((s: DbStudent) => s.id === t.student_id);
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
        products: products && products.length > 0 ? products : undefined,
        students,
        spendingControls: mappedControls,
        orders: mappedOrders,
        transactions: mappedTxns,
        notifications: notifications.length > 0 ? notifications : undefined,
      };
    } catch (err) {
      console.warn('fetchFullEcosystem error:', err);
      return null;
    }
  },
};
