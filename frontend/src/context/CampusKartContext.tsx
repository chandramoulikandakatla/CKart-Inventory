/**
 * CampusKart Core Ecosystem Context & State Coordinator
 * Modularized Architecture: delegates metrics, toast, and role actions to specialized hooks.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { INITIAL_STATE } from '../constants/initialState';
import { isSupabaseConfigured, supabaseService } from '../services';
import type {
  EcosystemState,
  Student,
  ParentAccount,
  Order,
  Notification,
  FundingReceipt,
  PortalType,
  StudentScreen,
  ParentScreen,
  OpsScreen,
  CollegeScreen,
} from '../types/ecosystem';
import type { CampusKartContextType } from './types';
import {
  useToast,
  useDerivedMetrics,
  useStudentActions,
  useParentActions,
  useOpsActions,
} from './hooks';

export type { CampusKartContextType };

const CampusKartContext = createContext<CampusKartContextType | null>(null);

export const CampusKartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Ecosystem Shared State (Authoritative source of truth: Supabase PostgreSQL)
  const [ecosystem, setEcosystem] = useState<EcosystemState>(() => {
    try {
      localStorage.removeItem('campuskart_ecosystem_v4_clean');
      localStorage.removeItem('campuskart_ecosystem_v5_catalog');
    } catch {
      // Ignore storage error
    }
    return INITIAL_STATE;
  });

  // 2. Active Portal & Toast
  const [activePortal, setActivePortal] = useState<PortalType | string>('student');
  const { toast, setToast, showToast } = useToast();

  // 3. Shared Modals
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);

  // 4. Student State
  const [studentScreen, setStudentScreen] = useState<StudentScreen | string>(() => {
    try {
      return localStorage.getItem('campuskart_student_screen') || 'welcome';
    } catch {
      return 'welcome';
    }
  });
  const [loggedStudentId, setLoggedStudentId] = useState<string>(() => {
    try {
      return localStorage.getItem('campuskart_logged_student_id') || 'CK-2026-101';
    } catch {
      return 'CK-2026-101';
    }
  });
  const [studentAuthed, setStudentAuthed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('campuskart_student_authed') === 'true';
    } catch {
      return false;
    }
  });

  const [credIdInput, setCredIdInput] = useState('CK-2026-101');
  const [credPassInput, setCredPassInput] = useState('PASS101');
  const [credError, setCredError] = useState('');
  const [pendingStudent, setPendingStudent] = useState<Student | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinMasked, setPinMasked] = useState(true);

  const [shopSearch, setShopSearch] = useState('');
  const [shopCategory, setShopCategory] = useState('All');
  const [shopSort, setShopSort] = useState('featured');
  const [selectedProductId, setSelectedProductId] = useState('PRD-001');
  const [detailQty, setDetailQty] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState(['PRD-001', 'PRD-005']);
  const [cart, setCart] = useState<Array<{ productId: string; qty: number }>>(() => {
    try {
      const saved = localStorage.getItem('campuskart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [processedIdempotencyKeys, setProcessedIdempotencyKeys] = useState<string[]>([]);
  const [activeIdempotencyKey, setActiveIdempotencyKey] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);

  // Health and Supabase live connectivity & data sync
  useEffect(() => {
    let mounted = true;
    const syncWithBackend = async () => {
      if (supabaseService.isAvailable()) {
        try {
          const liveData = await supabaseService.fetchFullEcosystem();
          if (mounted && liveData) {
            setEcosystem((prev) => ({
              ...prev,
              ...(liveData.products ? { products: liveData.products } : {}),
              ...(liveData.students ? { students: liveData.students } : {}),
              ...(liveData.orders ? { orders: liveData.orders } : {}),
              ...(liveData.transactions ? { transactions: liveData.transactions } : {}),
              ...(liveData.spendingControls ? { spendingControls: liveData.spendingControls } : {}),
              ...(liveData.notifications ? { notifications: liveData.notifications } : {}),
            }));
            setBackendConnected(true);
            return;
          }
        } catch (err) {
          console.warn('Supabase initial sync error:', err);
        }
      }
      try {
        const apiUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || 'http://127.0.0.1:8080';
        const res = await fetch(`${apiUrl}/api/health`, { method: 'GET' });
        if (mounted && res.ok) setBackendConnected(true);
      } catch {
        if (mounted) setBackendConnected(false);
      }
    };
    syncWithBackend();
    return () => {
      mounted = false;
    };
  }, []);

  // Supabase Realtime WebSocket Subscriptions for live multi-portal reactive updates
  useEffect(() => {
    if (!supabaseService.isAvailable()) return;

    const unsubscribe = supabaseService.subscribeToEcosystem({
      onOrderChange: (payload) => {
        if (!payload?.new) return;
        const newOrder = payload.new;
        setEcosystem((prev) => {
          const exists = prev.orders.some(
            (o) => o.id === newOrder.id || (newOrder.idempotency_key && o.txnRef === newOrder.idempotency_key)
          );
          if (exists) {
            return {
              ...prev,
              orders: prev.orders.map((o) => {
                if (o.id === newOrder.id || (newOrder.idempotency_key && o.txnRef === newOrder.idempotency_key)) {
                  return {
                    ...o,
                    status: newOrder.fulfilment_status || o.status,
                    paymentStatus: newOrder.payment_status === 'paid' ? 'Paid via CampusKart Wallet' : o.paymentStatus,
                  };
                }
                return o;
              }),
            };
          }
          return prev;
        });

        if (newOrder.fulfilment_status) {
          const shortId = newOrder.id ? (newOrder.id.length > 8 ? newOrder.id.slice(0, 8) : newOrder.id) : 'Order';
          showToast(
            'Order Status Push',
            `Order #${shortId} status changed to "${newOrder.fulfilment_status}"`,
            'info'
          );
        }
      },
      onWalletChange: (payload) => {
        if (!payload?.new) return;
        const updatedWallet = payload.new;
        const newBal = Math.round(Number(updatedWallet.balance_paise || 0) / 100);
        const resolvedStudentCode = supabaseService.getStudentCodeByUuid(updatedWallet.student_id);
        setEcosystem((prev) => ({
          ...prev,
          students: prev.students.map((s) => {
            if (s.id === resolvedStudentCode || s.id === updatedWallet.student_id) {
              return { ...s, walletBalance: newBal };
            }
            return s;
          }),
        }));
      },
      onProductChange: (payload) => {
        if (!payload?.new) return;
        const p = payload.new;
        setEcosystem((prev) => ({
          ...prev,
          products: prev.products.map((prod) => {
            if (prod.id === p.id || prod.name.toLowerCase() === (p.name || '').toLowerCase()) {
              return {
                ...prod,
                stock: p.stock_quantity !== undefined ? p.stock_quantity : prod.stock,
                price: p.price_paise !== undefined ? Math.round(p.price_paise / 100) : prod.price,
                active: p.is_available !== undefined ? p.is_available : prod.active,
              };
            }
            return prod;
          }),
        }));
      },
      onNotificationInsert: (payload) => {
        if (!payload?.new) return;
        const n = payload.new;
        const notifStudentCode = supabaseService.getStudentCodeByUuid(n.student_id);
        const notif: Notification = {
          id: n.id || `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: notifStudentCode || n.student_id || 'CK-2026-101',
          title: n.title || 'Campus Notification',
          message: n.message || '',
          time: 'Just now',
          type: (n.type as any) || 'system',
          read: n.is_read || false,
        };
        setEcosystem((prev) => ({
          ...prev,
          notifications: [notif, ...prev.notifications.filter((existing) => existing.id !== notif.id)],
        }));
        showToast(notif.title, notif.message, 'info');
      },
      onControlsChange: (payload) => {
        if (!payload?.new) return;
        const c = payload.new;
        const studentCode = supabaseService.getStudentCodeByUuid(c.student_id) || 'CK-2026-101';
        setEcosystem((prev) => ({
          ...prev,
          spendingControls: {
            ...prev.spendingControls,
            [studentCode]: {
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
            },
          },
        }));
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [fulfilmentType, setFulfilmentType] = useState('Campus Kiosk Pickup');
  const [selectedCollectionPoint, setSelectedCollectionPoint] = useState(INITIAL_STATE.college.collectionPoints[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CampusKart Wallet');
  const [simulateFailureMode, setSimulateFailureMode] = useState(false);
  const [studentPayStep, setStudentPayStep] = useState(0);
  const [studentPayErrorReason, setStudentPayErrorReason] = useState('');
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);

  const [orderFilter, setOrderFilter] = useState('All Orders');
  const [trackingOrderId, setTrackingOrderId] = useState('ORD-2026-8803');

  // 5. Parent State
  const [parentScreen, setParentScreen] = useState<ParentScreen | string>(() => {
    try {
      return localStorage.getItem('campuskart_parent_screen') || 'welcome';
    } catch {
      return 'welcome';
    }
  });
  const [parentAuthed, setParentAuthed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('campuskart_parent_authed') === 'true';
    } catch {
      return false;
    }
  });
  const [currentParent, setCurrentParent] = useState<ParentAccount | null>(() => {
    try {
      const saved = localStorage.getItem('campuskart_current_parent');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [parentUsernameInput, setParentUsernameInput] = useState('rajesh_sharma');
  const [parentPasswordInput, setParentPasswordInput] = useState('parent123');
  const [parentLookupStudentId, setParentLookupStudentId] = useState('CK-2026-101');
  const [parentPinInput, setParentPinInput] = useState('9999');
  const [parentAuthError, setParentAuthError] = useState('');
  const [linkedStudentId, setLinkedStudentId] = useState<string>(() => {
    try {
      return localStorage.getItem('campuskart_parent_linked_student_id') || 'CK-2026-101';
    } catch {
      return 'CK-2026-101';
    }
  });

  const [fundAmount, setFundAmount] = useState(1000);
  const [customFundInput, setCustomFundInput] = useState('1000');
  const [fundingMethod, setFundingMethod] = useState('UPI');
  const [parentPayStep, setParentPayStep] = useState(0);
  const [lastFundingReceipt, setLastFundingReceipt] = useState<FundingReceipt | null>(null);

  const [parentTxnFilter, setParentTxnFilter] = useState('All');
  const [parentDateRange, setParentDateRange] = useState('All Time');

  // 6. Operations State
  const [opsScreen, setOpsScreen] = useState<OpsScreen | string>('overview');
  const [opsOrderFilter, setOpsOrderFilter] = useState('All Orders');
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Food and Snacks',
    price: 50,
    stock: 25,
    offerTag: 'New Arrival',
    description: '',
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [manualAdjForm, setManualAdjForm] = useState({
    studentId: 'CK-2026-101',
    type: 'Adjustment',
    amount: 100,
    reason: 'Hostel Mess Fee Waiver',
    operator: 'Finance Desk',
  });
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    academicYear: 'Intermediate First Year (MPC)',
    parentName: '',
    initialWallet: 500,
  });

  // 7. College State
  const [collegeScreen, setCollegeScreen] = useState<CollegeScreen | string>('overview');

  // Local Storage Persistence Sync
  useEffect(() => {
    try {
      localStorage.setItem('campuskart_student_screen', String(studentScreen));
      localStorage.setItem('campuskart_logged_student_id', loggedStudentId);
      localStorage.setItem('campuskart_student_authed', String(studentAuthed));
      localStorage.setItem('campuskart_parent_screen', String(parentScreen));
      localStorage.setItem('campuskart_parent_authed', String(parentAuthed));
      localStorage.setItem('campuskart_parent_linked_student_id', linkedStudentId);
      if (currentParent) {
        localStorage.setItem('campuskart_current_parent', JSON.stringify(currentParent));
      } else {
        localStorage.removeItem('campuskart_current_parent');
      }
      localStorage.setItem('campuskart_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [studentScreen, loggedStudentId, studentAuthed, parentScreen, parentAuthed, linkedStudentId, currentParent, cart]);

  // 8. Derived Metrics Hook
  const derived = useDerivedMetrics(ecosystem, loggedStudentId, linkedStudentId, cart);

  // 9. Student Actions Hook
  const studentActions = useStudentActions({
    ecosystem,
    setEcosystem,
    currentStudent: derived.currentStudent,
    populatedCart: derived.populatedCart,
    cart,
    setCart,
    cartFinalPayable: derived.cartFinalPayable,
    studentControls: derived.studentControls,
    studentMetrics: derived.studentMetrics,
    studentTodaySpend: derived.studentTodaySpend,
    credIdInput,
    credPassInput,
    setCredError,
    pendingStudent,
    setPendingStudent,
    pinInput,
    setPinInput,
    setPinError,
    setLoggedStudentId,
    setStudentAuthed,
    setStudentScreen,
    setSelectedProductId,
    setDetailQty,
    setRecentlyViewed,
    showToast,
    setStudentPayStep,
    setStudentPayErrorReason,
    simulateFailureMode,
    activeIdempotencyKey,
    processedIdempotencyKeys,
    setProcessedIdempotencyKeys,
    fulfilmentType,
    selectedCollectionPoint,
    setLastConfirmedOrder,
    setTrackingOrderId,
  });

  // 10. Parent Actions Hook
  const parentActions = useParentActions({
    ecosystem,
    setEcosystem,
    parentLinkedStudent: derived.parentLinkedStudent,
    parentLookupStudentId,
    parentPinInput,
    parentUsernameInput,
    parentPasswordInput,
    currentParent,
    setCurrentParent,
    setParentAuthError,
    setLinkedStudentId,
    setParentAuthed,
    setParentScreen,
    showToast,
    fundAmount,
    fundingMethod,
    setParentPayStep,
    setLastFundingReceipt,
  });

  // 11. Operations Actions Hook
  const opsActions = useOpsActions({
    ecosystem,
    setEcosystem,
    showToast,
    newProductForm,
    setNewProductForm,
    newStudentForm,
    setNewStudentForm,
    manualAdjForm,
  });

  // Clean Reset
  const handleResetDemoData = () => {
    setEcosystem(INITIAL_STATE);
    setCart([]);
    setProcessedIdempotencyKeys([]);
    setStudentAuthed(false);
    setStudentScreen('welcome');
    setParentAuthed(false);
    setParentScreen('welcome');
    try {
      localStorage.removeItem('campuskart_ecosystem_v5_catalog');
      localStorage.removeItem('campuskart_student_screen');
      localStorage.removeItem('campuskart_logged_student_id');
      localStorage.removeItem('campuskart_student_authed');
      localStorage.removeItem('campuskart_parent_screen');
      localStorage.removeItem('campuskart_parent_authed');
      localStorage.removeItem('campuskart_parent_linked_student_id');
      localStorage.removeItem('campuskart_cart');
    } catch {
      // ignore
    }
    showToast('Demo State Reset', 'All portals restored to clean seeded evaluation data.', 'info');
  };

  return (
    <CampusKartContext.Provider
      value={{
        ecosystem,
        setEcosystem,
        activePortal,
        setActivePortal,
        toast,
        setToast,
        showToast,
        showDemoModal,
        setShowDemoModal,
        receiptModalOrder,
        setReceiptModalOrder,
        studentScreen,
        setStudentScreen,
        loggedStudentId,
        setLoggedStudentId,
        studentAuthed,
        setStudentAuthed,
        credIdInput,
        setCredIdInput,
        credPassInput,
        setCredPassInput,
        credError,
        setCredError,
        pendingStudent,
        setPendingStudent,
        pinInput,
        setPinInput,
        pinError,
        setPinError,
        pinMasked,
        setPinMasked,
        shopSearch,
        setShopSearch,
        shopCategory,
        setShopCategory,
        shopSort,
        setShopSort,
        selectedProductId,
        setSelectedProductId,
        detailQty,
        setDetailQty,
        recentlyViewed,
        setRecentlyViewed,
        cart,
        setCart,
        processedIdempotencyKeys,
        setProcessedIdempotencyKeys,
        activeIdempotencyKey,
        setActiveIdempotencyKey,
        backendConnected,
        setBackendConnected,
        fulfilmentType,
        setFulfilmentType,
        selectedCollectionPoint,
        setSelectedCollectionPoint,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        simulateFailureMode,
        setSimulateFailureMode,
        studentPayStep,
        setStudentPayStep,
        studentPayErrorReason,
        setStudentPayErrorReason,
        lastConfirmedOrder,
        setLastConfirmedOrder,
        orderFilter,
        setOrderFilter,
        trackingOrderId,
        setTrackingOrderId,
        parentScreen,
        setParentScreen,
        parentAuthed,
        setParentAuthed,
        currentParent,
        setCurrentParent,
        parentUsernameInput,
        setParentUsernameInput,
        parentPasswordInput,
        setParentPasswordInput,
        parentLookupStudentId,
        setParentLookupStudentId,
        parentPinInput,
        setParentPinInput,
        parentAuthError,
        setParentAuthError,
        linkedStudentId,
        setLinkedStudentId,
        fundAmount,
        setFundAmount,
        customFundInput,
        setCustomFundInput,
        fundingMethod,
        setFundingMethod,
        parentPayStep,
        setParentPayStep,
        lastFundingReceipt,
        setLastFundingReceipt,
        parentTxnFilter,
        setParentTxnFilter,
        parentDateRange,
        setParentDateRange,
        opsScreen,
        setOpsScreen,
        opsOrderFilter,
        setOpsOrderFilter,
        newProductForm,
        setNewProductForm,
        editingProductId,
        setEditingProductId,
        manualAdjForm,
        setManualAdjForm,
        newStudentForm,
        setNewStudentForm,
        collegeScreen,
        setCollegeScreen,
        ...derived,
        ...studentActions,
        ...parentActions,
        ...opsActions,
        handleResetDemoData,
      }}
    >
      {children}
    </CampusKartContext.Provider>
  );
};

export const useCampusKart = () => {
  const context = useContext(CampusKartContext);
  if (!context) {
    throw new Error('useCampusKart must be used within a CampusKartProvider');
  }
  return context;
};
