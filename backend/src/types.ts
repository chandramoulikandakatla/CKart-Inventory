/**
 * CampusKart Backend Domain Types
 */

export interface SessionData {
  role: 'student' | 'parent' | 'ops' | 'college';
  entityId: string;
  metadata?: Record<string, any>;
  expiresAt: number;
}

export interface College {
  id: string;
  name: string;
  institution_code: string;
  collection_points: string[];
}

export interface StudentRecord {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  academic_year: string;
  college_id: string;
  account_status: string;
  password_hash: string;
  pin_hash: string;
  parent_account_id: string;
}

export interface ParentRecord {
  id: string;
  mobile: string;
  password_hash: string;
  name: string;
}

export interface StaffRecord {
  id: string;
  username: string;
  password_hash: string;
  role: 'ops' | 'college';
  college_id: string;
}

export interface WalletRecord {
  student_id: string;
  balance_paise: number;
  status: string;
}

export interface ProductRecord {
  id: string;
  college_id: string;
  name: string;
  category: string;
  price_paise: number;
  stock_quantity: number;
  is_available: boolean;
  image_url: string;
  description: string;
}

export interface OrderItemRecord {
  product_id: string;
  name: string;
  quantity: number;
  unit_price_paise: number;
}

export interface OrderRecord {
  id: string;
  reference: string;
  student_id: string;
  college_id: string;
  total_amount_paise: number;
  payment_status: string;
  fulfilment_status: string;
  fulfilment_method: string;
  collection_point: string;
  idempotency_key: string;
  created_at: string;
  items: OrderItemRecord[];
}

export interface TransactionRecord {
  id: string;
  wallet_id: string;
  student_id: string;
  type: 'CREDIT' | 'DEBIT';
  amount_paise: number;
  balance_after_paise: number;
  reference: string;
  description: string;
  created_at: string;
}

export interface SpendingControlsRecord {
  daily_limit_paise: number;
  single_txn_limit_paise: number;
  allowed_categories: string[];
  card_locked: boolean;
}

export interface NotificationRecord {
  id: string;
  student_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface BackendStore {
  colleges: College[];
  students: StudentRecord[];
  parents: ParentRecord[];
  staff: StaffRecord[];
  wallets: Map<string, WalletRecord>;
  products: ProductRecord[];
  orders: OrderRecord[];
  transactions: TransactionRecord[];
  spending_controls: Map<string, SpendingControlsRecord>;
  notifications: NotificationRecord[];
}

export interface SerializedStore {
  colleges: College[];
  students: StudentRecord[];
  parents: ParentRecord[];
  staff: StaffRecord[];
  wallets: Record<string, WalletRecord>;
  products: ProductRecord[];
  orders: OrderRecord[];
  transactions: TransactionRecord[];
  spending_controls: Record<string, SpendingControlsRecord>;
  notifications: NotificationRecord[];
}
