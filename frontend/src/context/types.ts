/**
 * CampusKart Context Interface & Action Types
 */

import React from 'react';
import type { ToastData } from '../components/common/ToastNotification';
import type {
  EcosystemState,
  Student,
  Product,
  Order,
  SpendingControls,
  WalletTransaction,
  FundingReceipt,
  PopulatedCartItem,
  LedgerMetrics,
  PortalType,
  StudentScreen,
  ParentScreen,
  OpsScreen,
  CollegeScreen,
} from '../types/ecosystem';

export interface CampusKartContextType {
  // Ecosystem state
  ecosystem: EcosystemState;
  setEcosystem: React.Dispatch<React.SetStateAction<EcosystemState>>;

  // Portal & Shared overlays
  activePortal: PortalType | string;
  setActivePortal: React.Dispatch<React.SetStateAction<PortalType | string>>;
  toast: ToastData | null;
  setToast: React.Dispatch<React.SetStateAction<ToastData | null>>;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | string) => void;
  showDemoModal: boolean;
  setShowDemoModal: React.Dispatch<React.SetStateAction<boolean>>;
  receiptModalOrder: Order | null;
  setReceiptModalOrder: React.Dispatch<React.SetStateAction<Order | null>>;

  // Student portal state
  studentScreen: StudentScreen | string;
  setStudentScreen: React.Dispatch<React.SetStateAction<StudentScreen | string>>;
  loggedStudentId: string;
  setLoggedStudentId: React.Dispatch<React.SetStateAction<string>>;
  studentAuthed: boolean;
  setStudentAuthed: React.Dispatch<React.SetStateAction<boolean>>;
  credIdInput: string;
  setCredIdInput: React.Dispatch<React.SetStateAction<string>>;
  credPassInput: string;
  setCredPassInput: React.Dispatch<React.SetStateAction<string>>;
  credError: string;
  setCredError: React.Dispatch<React.SetStateAction<string>>;
  pendingStudent: Student | null;
  setPendingStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  pinInput: string;
  setPinInput: React.Dispatch<React.SetStateAction<string>>;
  pinError: string;
  setPinError: React.Dispatch<React.SetStateAction<string>>;
  pinMasked: boolean;
  setPinMasked: React.Dispatch<React.SetStateAction<boolean>>;
  shopSearch: string;
  setShopSearch: React.Dispatch<React.SetStateAction<string>>;
  shopCategory: string;
  setShopCategory: React.Dispatch<React.SetStateAction<string>>;
  shopSort: string;
  setShopSort: React.Dispatch<React.SetStateAction<string>>;
  selectedProductId: string;
  setSelectedProductId: React.Dispatch<React.SetStateAction<string>>;
  detailQty: number;
  setDetailQty: React.Dispatch<React.SetStateAction<number>>;
  recentlyViewed: string[];
  setRecentlyViewed: React.Dispatch<React.SetStateAction<string[]>>;
  cart: Array<{ productId: string; qty: number }>;
  setCart: React.Dispatch<React.SetStateAction<Array<{ productId: string; qty: number }>>>;
  processedIdempotencyKeys: string[];
  setProcessedIdempotencyKeys: React.Dispatch<React.SetStateAction<string[]>>;
  activeIdempotencyKey: string;
  setActiveIdempotencyKey: React.Dispatch<React.SetStateAction<string>>;
  backendConnected: boolean;
  setBackendConnected: React.Dispatch<React.SetStateAction<boolean>>;
  fulfilmentType: string;
  setFulfilmentType: React.Dispatch<React.SetStateAction<string>>;
  selectedCollectionPoint: string;
  setSelectedCollectionPoint: React.Dispatch<React.SetStateAction<string>>;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  simulateFailureMode: boolean;
  setSimulateFailureMode: React.Dispatch<React.SetStateAction<boolean>>;
  studentPayStep: number;
  setStudentPayStep: React.Dispatch<React.SetStateAction<number>>;
  studentPayErrorReason: string;
  setStudentPayErrorReason: React.Dispatch<React.SetStateAction<string>>;
  lastConfirmedOrder: Order | null;
  setLastConfirmedOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  orderFilter: string;
  setOrderFilter: React.Dispatch<React.SetStateAction<string>>;
  trackingOrderId: string;
  setTrackingOrderId: React.Dispatch<React.SetStateAction<string>>;

  // Parent portal state
  parentScreen: ParentScreen | string;
  setParentScreen: React.Dispatch<React.SetStateAction<ParentScreen | string>>;
  parentAuthed: boolean;
  setParentAuthed: React.Dispatch<React.SetStateAction<boolean>>;
  parentLookupStudentId: string;
  setParentLookupStudentId: React.Dispatch<React.SetStateAction<string>>;
  parentPinInput: string;
  setParentPinInput: React.Dispatch<React.SetStateAction<string>>;
  parentAuthError: string;
  setParentAuthError: React.Dispatch<React.SetStateAction<string>>;
  linkedStudentId: string;
  setLinkedStudentId: React.Dispatch<React.SetStateAction<string>>;
  fundAmount: number;
  setFundAmount: React.Dispatch<React.SetStateAction<number>>;
  customFundInput: string;
  setCustomFundInput: React.Dispatch<React.SetStateAction<string>>;
  fundingMethod: string;
  setFundingMethod: React.Dispatch<React.SetStateAction<string>>;
  parentPayStep: number;
  setParentPayStep: React.Dispatch<React.SetStateAction<number>>;
  lastFundingReceipt: FundingReceipt | null;
  setLastFundingReceipt: React.Dispatch<React.SetStateAction<FundingReceipt | null>>;
  parentTxnFilter: string;
  setParentTxnFilter: React.Dispatch<React.SetStateAction<string>>;
  parentDateRange: string;
  setParentDateRange: React.Dispatch<React.SetStateAction<string>>;

  // Operations portal state
  opsScreen: OpsScreen | string;
  setOpsScreen: React.Dispatch<React.SetStateAction<OpsScreen | string>>;
  opsOrderFilter: string;
  setOpsOrderFilter: React.Dispatch<React.SetStateAction<string>>;
  newProductForm: {
    name: string;
    category: string;
    price: number;
    stock: number;
    offerTag: string;
    description: string;
  };
  setNewProductForm: React.Dispatch<React.SetStateAction<any>>;
  editingProductId: string | null;
  setEditingProductId: React.Dispatch<React.SetStateAction<string | null>>;
  manualAdjForm: {
    studentId: string;
    type: string;
    amount: number;
    reason: string;
    operator: string;
  };
  setManualAdjForm: React.Dispatch<React.SetStateAction<any>>;
  newStudentForm: {
    name: string;
    academicYear: string;
    parentName: string;
    initialWallet: number;
  };
  setNewStudentForm: React.Dispatch<React.SetStateAction<any>>;

  // College portal state
  collegeScreen: CollegeScreen | string;
  setCollegeScreen: React.Dispatch<React.SetStateAction<CollegeScreen | string>>;

  // Derived values
  currentStudent: Student;
  parentLinkedStudent: Student;
  populatedCart: PopulatedCartItem[];
  cartItemCount: number;
  cartSubtotal: number;
  platformFee: number;
  cartFinalPayable: number;
  studentOrders: Order[];
  studentTransactions: WalletTransaction[];
  parentOrders: Order[];
  parentTransactions: WalletTransaction[];
  parentControls: SpendingControls;
  studentControls: SpendingControls;
  studentMetrics: LedgerMetrics;
  parentMetrics: LedgerMetrics;
  studentTodaySpend: number;
  parentCategoryChartData: Array<{ name: string; value: number }>;
  highestSpendCategory: string;
  parentMonthlyChartData: Array<{ month: string; funded: number; spent: number }>;
  parentDailyTrendData: Array<{ day: string; amount: number; funded: number }>;

  // Handlers
  handleValidateStudentCredentials: (e?: React.FormEvent) => void;
  handleVerifyStudentPin: (e?: React.FormEvent) => void;
  handleOpenProductDetail: (productId: string) => void;
  handleAddToCart: (product: Product, qtyToAdd?: number) => void;
  handleUpdateCartQty: (productId: string, delta: number) => void;
  handleRemoveFromCart: (productId: string) => void;
  handleRequestParentTopUp: () => void;
  checkOrderBlockers: () => string | null;
  handleConfirmAndPay: () => void;
  handleParentLogin: (e?: React.FormEvent) => void;
  handleParentLogout: () => void;
  handleConfirmParentFunding: () => void;
  handleSaveSpendingControls: (updatedControls: SpendingControls) => void;
  handleOpsUpdateOrderStatus: (orderId: string, nextStatus: string) => void;
  handleOpsUpdateStock: (productId: string, newStock?: number, newPrice?: number, toggleActive?: boolean) => void;
  handleOpsCreateProduct: (e: React.FormEvent) => void;
  handleOpsToggleStudentStatus: (studentId: string) => void;
  handleOpsCreateStudent: (e: React.FormEvent) => void;
  handleOpsManualAdjustment: (e: React.FormEvent) => void;
  handleResetDemoData: () => void;
}
