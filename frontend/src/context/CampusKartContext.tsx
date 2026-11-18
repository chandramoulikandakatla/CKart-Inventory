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
  Order,
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
  // 1. Ecosystem Shared State
  const [ecosystem, setEcosystem] = useState<EcosystemState>(() => {
    try {
      const saved = localStorage.getItem('campuskart_ecosystem_v4_clean');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.students && parsed?.products && parsed?.transactions) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('campuskart_ecosystem_v4_clean', JSON.stringify(ecosystem));
    } catch {
      // Ignore storage error
    }
  }, [ecosystem]);

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

  // Health and Supabase connectivity check
  useEffect(() => {
    let mounted = true;
    const syncWithBackend = async () => {
      if (isSupabaseConfigured()) {
        try {
          const products = await supabaseService.getProducts();
          if (mounted && products) {
            setBackendConnected(true);
            return;
          }
        } catch {
          // fallback
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
      localStorage.setItem('campuskart_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [studentScreen, loggedStudentId, studentAuthed, parentScreen, parentAuthed, linkedStudentId, cart]);

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
      localStorage.removeItem('campuskart_ecosystem_v4_clean');
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
