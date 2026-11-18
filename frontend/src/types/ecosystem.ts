export type PortalType = 'student' | 'parent' | 'ops' | 'college';

export type StudentScreen =
  | 'welcome'
  | 'credentials'
  | 'pin'
  | 'home'
  | 'shop'
  | 'product_detail'
  | 'cart'
  | 'order_review'
  | 'payment_method'
  | 'wallet_verify'
  | 'payment_processing'
  | 'order_confirmation'
  | 'my_orders'
  | 'order_tracking'
  | 'wallet'
  | 'profile';

export type ParentScreen =
  | 'welcome'
  | 'login'
  | 'dashboard'
  | 'add_money'
  | 'funding_method'
  | 'funding_confirm'
  | 'funding_processing'
  | 'funding_success'
  | 'transactions'
  | 'analytics'
  | 'controls'
  | 'orders'
  | 'notifications'
  | 'statements';

export type OpsScreen =
  | 'overview'
  | 'orders'
  | 'inventory'
  | 'students'
  | 'reconciliation';

export type CollegeScreen = 'overview' | 'reports';

export interface College {
  name: string;
  code: string;
  city: string;
  pilotWindow: string;
  collectionPoints: string[];
}

export interface StudentNotificationPref {
  sms: boolean;
  app: boolean;
  lowBalance: boolean;
}

export interface Student {
  id: string;
  name: string;
  firstName: string;
  password?: string;
  pin: string;
  institution: string;
  academicYear: string;
  status: 'Active' | 'Inactive';
  walletBalance: number;
  parentId: string;
  parentName: string;
  parentUsername?: string;
  parentPassword?: string;
  parentPin: string;
  parentPhone: string;
  notificationsPref: StudentNotificationPref;
}

export interface ParentAccount {
  id: string;
  username: string;
  name: string;
  email?: string;
  mobile: string;
  password?: string;
  pin?: string;
  linkedStudentIds: string[];
}

export interface SpendingControls {
  dailyLimitEnabled: boolean;
  dailyLimit: number;
  weeklyLimitEnabled: boolean;
  weeklyLimit: number;
  monthlyLimitEnabled: boolean;
  monthlyLimit: number;
  restrictedCategories: string[];
  lowBalanceAlertEnabled: boolean;
  lowBalanceThreshold: number;
  instantTxnNotification: boolean;
  spendingAlertsEnabled: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  frequent?: boolean;
  offerTag?: string;
  description: string;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface PopulatedCartItem extends Product {
  qty: number;
  subtotal: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  month: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  txnRef: string;
  fulfilmentMethod: string;
  collectionPoint: string;
  estimatedTime?: string;
  status: string;
  previousBalance: number;
  remainingBalance: number;
}

export interface WalletTransaction {
  id: string;
  studentId: string;
  type: string;
  category: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  timestamp: string;
  month: string;
  status: string;
  method: string;
  relatedOrderId?: string | null;
  note: string;
  reconciled: boolean;
}

export interface Notification {
  id: string;
  target: 'student' | 'parent' | 'both';
  studentId: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'wallet' | 'alert' | 'system' | 'funding' | 'spend';
  read: boolean;
}

export interface EcosystemState {
  college: College;
  students: Student[];
  parents?: ParentAccount[];
  spendingControls: Record<string, SpendingControls>;
  products: Product[];
  orders: Order[];
  transactions: WalletTransaction[];
  notifications: Notification[];
}

export interface LedgerMetrics {
  totalAdded: number;
  totalSpent: number;
  totalRefunds: number;
  purchaseCount: number;
  avgPurchase: number;
}

export interface FundingReceipt {
  txnId: string;
  studentName: string;
  studentId: string;
  amount: number;
  method: string;
  timestamp: string;
  previousBalance: number;
  newBalance: number;
}
