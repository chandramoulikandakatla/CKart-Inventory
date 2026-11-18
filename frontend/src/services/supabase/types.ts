/**
 * Supabase Data Transfer & Mapping Types
 */

import type { Notification } from '../../types/ecosystem';

export interface DbStudent {
  id: string;
  college_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  academic_year: string;
  account_status: string;
  wallets?: Array<{ id: string; balance_paise: number; status: string }> | { id: string; balance_paise: number; status: string };
  spending_controls?: Array<any> | any;
}

export interface DbProduct {
  id: string;
  college_id?: string;
  name: string;
  description?: string;
  category: string;
  image_url?: string;
  price_paise: number;
  stock_quantity: number;
  is_available: boolean;
}

export interface DbOrder {
  id: string;
  student_id: string;
  college_id: string;
  total_amount_paise: number;
  payment_status: string;
  fulfilment_status: string;
  fulfilment_method: string;
  collection_point: string;
  idempotency_key?: string;
  created_at: string;
  order_items?: DbOrderItem[];
}

export interface DbOrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name_snapshot: string;
  category_snapshot: string;
  quantity: number;
  unit_price_paise: number;
  subtotal_paise: number;
}

export interface DbTransaction {
  id: string;
  wallet_id: string;
  student_id: string;
  transaction_type: string;
  amount_paise: number;
  direction?: string;
  previous_balance_paise?: number;
  new_balance_paise?: number;
  balance_after_paise?: number;
  status: string;
  reference?: string;
  reference_id?: string;
  reference_type?: string;
  description?: string;
  related_order_id?: string | null;
  created_at: string;
}

export interface DbNotification {
  id: string;
  student_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function extractRelation<T>(rel: T[] | T | undefined | null): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] || null;
  return rel;
}

export function mapNotificationType(type: string): 'order' | 'wallet' | 'alert' | 'system' {
  if (type === 'order') return 'order';
  if (type === 'funding' || type === 'spend' || type === 'wallet') return 'wallet';
  if (type === 'alert') return 'alert';
  return 'system';
}

export function mapDbNotificationToClient(n: DbNotification, studentCode: string): Notification {
  return {
    id: n.id,
    target: 'both',
    studentId: studentCode,
    title: n.title,
    message: n.message,
    time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    type: (n.type === 'wallet' ? 'funding' : n.type === 'order' ? 'order' : n.type === 'alert' ? 'alert' : 'info') as any,
    read: n.is_read ?? false,
  };
}
