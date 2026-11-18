export type AccountStatus = 'active' | 'inactive' | 'suspended';

export type TransactionType = 'funding' | 'purchase' | 'refund' | 'adjustment';

export type FulfilmentStatus =
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Collection'
  | 'Completed'
  | 'Cancelled';

export interface College {
  id: string;
  name: string;
  institution_code: string;
  pilot_window: string;
  collection_points_json: string;
}

export interface ParentLink {
  parent_account_id: string;
  parent_name: string;
  relationship: string;
  status: 'verified' | 'pending' | 'revoked';
}

export interface StudentProfile {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  academic_year: string;
  account_status: AccountStatus;
  college: College;
  parent_link: ParentLink;
}

export interface Wallet {
  id: string;
  balance_paise: number;
  currency: 'INR';
  status: 'active' | 'frozen';
  updated_at: string;
}

export interface Product {
  id: string;
  college_id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  price_paise: number;
  stock_quantity: number;
  is_available: number | boolean;
  is_featured: number | boolean;
  offer_tag: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  category_snapshot: string;
  unit_price_snapshot_paise: number;
  quantity: number;
  subtotal_paise: number;
}

export interface Order {
  id: string;
  student_id: string;
  college_id: string;
  total_amount_paise: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfilment_status: FulfilmentStatus;
  fulfilment_method: string;
  collection_point: string;
  idempotency_key: string | null;
  is_simulated: number | boolean;
  created_at: string;
  items: OrderItem[];
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  student_id: string;
  transaction_type: TransactionType;
  amount_paise: number;
  direction: 'credit' | 'debit';
  previous_balance_paise: number;
  new_balance_paise: number;
  status: 'completed' | 'failed' | 'pending';
  reference: string;
  related_order_id: string | null;
  description: string;
  is_simulated: number | boolean;
  created_at: string;
}

export interface SpendingControls {
  id: string;
  student_id: string;
  daily_limit_paise: number | null;
  weekly_limit_paise: number | null;
  monthly_limit_paise: number | null;
  category_restrictions_json: string;
  enabled: number | boolean;
}

export interface StudentNotification {
  id: string;
  student_id: string;
  type: 'order' | 'wallet' | 'alert' | 'system';
  title: string;
  message: string;
  is_read: number | boolean;
  created_at: string;
}

export interface DashboardMetrics {
  total_spent_paise: number;
  total_funded_paise: number;
  purchase_count: number;
  transaction_count: number;
  avg_transaction_paise: number;
  category_spending: Array<{ category: string; amount_paise: number }>;
}

export interface StudentDashboardResponse {
  student: StudentProfile;
  wallet: Wallet;
  spending_controls: SpendingControls;
  metrics: DashboardMetrics;
  recent_orders: Order[];
  orders: Order[];
  transactions: WalletTransaction[];
  notifications: StudentNotification[];
}
