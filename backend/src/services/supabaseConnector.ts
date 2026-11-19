/**
 * Supabase Persistence Connector
 * Single source of all @supabase/supabase-js calls in the backend.
 * No business logic — typed DB writes and audit logging only.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '../config.js';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !key) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, key);
  }
  return client;
}

export function isConnected(): boolean {
  return Boolean(SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY));
}

async function resolveStudent(studentCode: string) {
  const db = getClient();
  if (!db) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentCode);
  let query = db.from('students').select('id, college_id, student_code, first_name');
  if (isUuid) {
    query = query.or(`student_code.eq.${studentCode},id.eq.${studentCode}`);
  } else {
    query = query.eq('student_code', studentCode);
  }
  const { data } = await query.maybeSingle();
  return data;
}

// ─── Wallet Top-Up ────────────────────────────────────────────────────────────

export async function persistWalletTopUp(params: {
  studentCode: string;
  amountPaise: number;
  method: string;
  txnRef: string;
}): Promise<{ newBalancePaise: number } | null> {
  const db = getClient();
  if (!db) return null;
  try {
    const student = await resolveStudent(params.studentCode);
    if (!student) return null;

    const { data: wallet } = await db
      .from('wallets')
      .select('id, balance_paise')
      .eq('student_id', student.id)
      .maybeSingle();
    if (!wallet) return null;

    const prevBal = Number(wallet.balance_paise || 0);
    const newBalance = prevBal + params.amountPaise;

    await db
      .from('wallets')
      .update({ balance_paise: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    await db.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      student_id: student.id,
      transaction_type: 'CREDIT',
      amount_paise: params.amountPaise,
      direction: 'credit',
      previous_balance_paise: prevBal,
      new_balance_paise: newBalance,
      balance_after_paise: newBalance,
      status: 'completed',
      reference: params.txnRef,
      reference_id: params.txnRef,
      reference_type: 'PARENT_FUNDING',
      description: `Wallet top-up via ${params.method}`,
    });

    return { newBalancePaise: newBalance };
  } catch (err) {
    console.warn('[Supabase] persistWalletTopUp error:', err);
    return null;
  }
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function persistCheckout(params: {
  studentCode: string;
  items: { product_id: string; name: string; quantity: number; unit_price_paise: number }[];
  totalPaise: number;
  fulfilmentMethod: string;
  collectionPoint: string;
  idempotencyKey: string;
  txnRef: string;
  orderRef: string;
}): Promise<{ orderId: string } | null> {
  const db = getClient();
  if (!db) return null;
  try {
    const student = await resolveStudent(params.studentCode);
    if (!student) return null;

    const collegeId = student.college_id || 'c0000000-0000-0000-0000-000000000001';

    const { data: order, error: ordErr } = await db
      .from('orders')
      .insert({
        student_id: student.id,
        college_id: collegeId,
        total_amount_paise: params.totalPaise,
        payment_status: 'paid',
        fulfilment_status: 'Order Placed',
        fulfilment_method: params.fulfilmentMethod,
        collection_point: params.collectionPoint,
        idempotency_key: params.idempotencyKey,
      })
      .select('id')
      .single();

    if (ordErr || !order) {
      console.warn('[Supabase] persistCheckout: order insert failed', ordErr?.message);
      return null;
    }

    // Resolve products for foreign key and snapshot insertion
    const { data: dbProducts } = await db.from('products').select('id, name, stock_quantity');

    for (const item of params.items) {
      const matched = (dbProducts || []).find(
        (p: any) => p.id === item.product_id || p.name.toLowerCase() === item.name.toLowerCase()
      );
      const prdId = matched ? matched.id : item.product_id;
      const curStock = matched ? matched.stock_quantity : 50;

      await db.from('order_items').insert({
        order_id: order.id,
        product_id: prdId,
        product_name_snapshot: item.name,
        category_snapshot: 'General',
        quantity: item.quantity,
        unit_price_paise: item.unit_price_paise,
        subtotal_paise: item.unit_price_paise * item.quantity,
      });

      if (matched) {
        await db
          .from('products')
          .update({ stock_quantity: Math.max(0, curStock - item.quantity) })
          .eq('id', matched.id);
      }
    }

    const { data: wallet } = await db
      .from('wallets')
      .select('id, balance_paise')
      .eq('student_id', student.id)
      .maybeSingle();

    if (wallet) {
      const prevBal = Number(wallet.balance_paise || 0);
      const newBal = Math.max(0, prevBal - params.totalPaise);
      await db.from('wallets').update({ balance_paise: newBal, updated_at: new Date().toISOString() }).eq('id', wallet.id);
      await db.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        student_id: student.id,
        transaction_type: 'DEBIT',
        amount_paise: params.totalPaise,
        direction: 'debit',
        previous_balance_paise: prevBal,
        new_balance_paise: newBal,
        balance_after_paise: newBal,
        status: 'completed',
        reference: params.txnRef,
        reference_id: params.txnRef,
        reference_type: 'STUDENT_PURCHASE',
        description: `Order ${params.orderRef}`,
        related_order_id: order.id,
      });
    }

    return { orderId: order.id };
  } catch (err) {
    console.warn('[Supabase] persistCheckout error:', err);
    return null;
  }
}

// ─── Spending Controls ────────────────────────────────────────────────────────

export async function persistSpendingControls(params: {
  studentCode: string;
  dailyLimitPaise?: number;
  weeklyLimitPaise?: number;
  monthlyLimitPaise?: number;
  restrictedCategories?: string[];
  lowBalanceThresholdPaise?: number;
  instantTxnNotification?: boolean;
  spendingAlertsEnabled?: boolean;
}): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  try {
    const student = await resolveStudent(params.studentCode);
    if (!student) return false;

    const { error: upsErr } = await db.from('spending_controls').upsert(
      {
        student_id: student.id,
        daily_limit_paise: params.dailyLimitPaise,
        weekly_limit_paise: params.weeklyLimitPaise,
        monthly_limit_paise: params.monthlyLimitPaise,
        restricted_categories: params.restrictedCategories || [],
        low_balance_threshold_paise: params.lowBalanceThresholdPaise,
        instant_txn_notification: params.instantTxnNotification ?? true,
        spending_alerts_enabled: params.spendingAlertsEnabled ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id' }
    );
    if (upsErr) {
      console.warn('[Supabase] persistSpendingControls: upsert failed', upsErr.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] persistSpendingControls error:', err);
    return false;
  }
}

// ─── Notification ─────────────────────────────────────────────────────────────

export async function persistNotification(params: {
  studentCode: string;
  title: string;
  message: string;
  type: string;
}): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  try {
    const student = await resolveStudent(params.studentCode);
    if (!student) return false;

    const dbType = ['wallet', 'order', 'budget', 'security', 'system'].includes(params.type)
      ? params.type
      : params.type === 'funding'
      ? 'wallet'
      : params.type === 'spend'
      ? 'order'
      : 'system';

    const { error: insErr } = await db.from('notifications').insert({
      student_id: student.id,
      title: params.title,
      message: params.message,
      type: dbType,
      is_read: false,
    });
    if (insErr) {
      console.warn('[Supabase] persistNotification: insert failed', insErr.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] persistNotification error:', err);
    return false;
  }
}

// ─── Manual Adjustment ────────────────────────────────────────────────────────

export async function persistManualAdjustment(params: {
  studentCode: string;
  amountPaise: number;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
  operator: string;
  txnRef: string;
}): Promise<{ newBalancePaise: number } | null> {
  const db = getClient();
  if (!db) return null;
  try {
    const student = await resolveStudent(params.studentCode);
    if (!student) return null;

    const { data: wallet } = await db
      .from('wallets')
      .select('id, balance_paise')
      .eq('student_id', student.id)
      .maybeSingle();
    if (!wallet) return null;

    const prevBal = Number(wallet.balance_paise || 0);
    const newBal =
      params.type === 'CREDIT'
        ? prevBal + params.amountPaise
        : Math.max(0, prevBal - params.amountPaise);

    await db.from('wallets').update({ balance_paise: newBal, updated_at: new Date().toISOString() }).eq('id', wallet.id);
    await db.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      student_id: student.id,
      transaction_type: params.type,
      amount_paise: params.amountPaise,
      direction: params.type === 'CREDIT' ? 'credit' : 'debit',
      previous_balance_paise: prevBal,
      new_balance_paise: newBal,
      balance_after_paise: newBal,
      status: 'completed',
      reference: params.txnRef,
      reference_id: params.txnRef,
      reference_type: 'OPERATIONS_ADJUSTMENT',
      description: `[AUDIT] ${params.reason} (by ${params.operator})`,
    });

    return { newBalancePaise: newBal };
  } catch (err) {
    console.warn('[Supabase] persistManualAdjustment error:', err);
    return null;
  }
}

// ─── Order Status Update ───────────────────────────────────────────────────────

export async function persistOrderStatusUpdate(params: {
  orderRef: string;
  status: string;
}): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.orderRef);
    let query = db
      .from('orders')
      .update({ fulfilment_status: params.status, updated_at: new Date().toISOString() });

    if (isUuid) {
      query = query.eq('id', params.orderRef);
    } else {
      query = query.eq('idempotency_key', params.orderRef);
    }

    const { error } = await query;
    if (error) {
      console.warn('[Supabase] persistOrderStatusUpdate failed', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] persistOrderStatusUpdate error:', err);
    return false;
  }
}
