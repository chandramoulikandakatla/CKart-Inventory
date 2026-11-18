import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { INITIAL_STATE } from '../constants/initialState';
import { ToastData } from '../components/common/ToastNotification';

export interface CampusKartContextType {
  // Ecosystem state
  ecosystem: any;
  setEcosystem: React.Dispatch<React.SetStateAction<any>>;

  // Portal & Shared overlays
  activePortal: 'student' | 'parent' | 'ops' | 'college' | string;
  setActivePortal: React.Dispatch<React.SetStateAction<any>>;
  toast: ToastData | null;
  setToast: React.Dispatch<React.SetStateAction<ToastData | null>>;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | string) => void;
  showDemoModal: boolean;
  setShowDemoModal: React.Dispatch<React.SetStateAction<boolean>>;
  receiptModalOrder: any | null;
  setReceiptModalOrder: React.Dispatch<React.SetStateAction<any | null>>;

  // Student portal state
  studentScreen: string;
  setStudentScreen: React.Dispatch<React.SetStateAction<string>>;
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
  pendingStudent: any;
  setPendingStudent: React.Dispatch<React.SetStateAction<any>>;
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
  lastConfirmedOrder: any | null;
  setLastConfirmedOrder: React.Dispatch<React.SetStateAction<any | null>>;
  orderFilter: string;
  setOrderFilter: React.Dispatch<React.SetStateAction<string>>;
  trackingOrderId: string;
  setTrackingOrderId: React.Dispatch<React.SetStateAction<string>>;

  // Parent portal state
  parentScreen: string;
  setParentScreen: React.Dispatch<React.SetStateAction<string>>;
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
  lastFundingReceipt: any | null;
  setLastFundingReceipt: React.Dispatch<React.SetStateAction<any | null>>;
  parentTxnFilter: string;
  setParentTxnFilter: React.Dispatch<React.SetStateAction<string>>;
  parentDateRange: string;
  setParentDateRange: React.Dispatch<React.SetStateAction<string>>;

  // Operations portal state
  opsScreen: string;
  setOpsScreen: React.Dispatch<React.SetStateAction<string>>;
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
  setEditingProductId: React.Dispatch<React.SetStateAction<any>>;
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
  collegeScreen: string;
  setCollegeScreen: React.Dispatch<React.SetStateAction<string>>;

  // Derived values
  currentStudent: any;
  parentLinkedStudent: any;
  populatedCart: any[];
  cartItemCount: number;
  cartSubtotal: number;
  platformFee: number;
  cartFinalPayable: number;
  studentOrders: any[];
  studentTransactions: any[];
  parentOrders: any[];
  parentTransactions: any[];
  parentControls: any;
  studentControls: any;
  studentMetrics: any;
  parentMetrics: any;
  studentTodaySpend: number;
  parentCategoryChartData: Array<{ name: string; value: number }>;
  highestSpendCategory: string;
  parentMonthlyChartData: any[];
  parentDailyTrendData: any[];

  // Handlers
  handleValidateStudentCredentials: (e?: React.FormEvent) => void;
  handleVerifyStudentPin: (e?: React.FormEvent) => void;
  handleOpenProductDetail: (productId: string) => void;
  handleAddToCart: (product: any, qtyToAdd?: number) => void;
  handleUpdateCartQty: (productId: string, delta: number) => void;
  handleRemoveFromCart: (productId: string) => void;
  handleRequestParentTopUp: () => void;
  checkOrderBlockers: () => string | null;
  handleConfirmAndPay: () => void;
  handleParentLogin: (e?: React.FormEvent) => void;
  handleConfirmParentFunding: () => void;
  handleSaveSpendingControls: (updatedControls: any) => void;
  handleOpsUpdateOrderStatus: (orderId: string, nextStatus: string) => void;
  handleOpsUpdateStock: (productId: string, newStock?: number, newPrice?: number, toggleActive?: boolean) => void;
  handleOpsCreateProduct: (e: React.FormEvent) => void;
  handleOpsToggleStudentStatus: (studentId: string) => void;
  handleOpsCreateStudent: (e: React.FormEvent) => void;
  handleOpsManualAdjustment: (e: React.FormEvent) => void;
  handleResetDemoData: () => void;
}

const CampusKartContext = createContext<CampusKartContextType | null>(null);

export const CampusKartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load or initialize shared ecosystem state
  const [ecosystem, setEcosystem] = useState(() => {
    try {
      const saved = localStorage.getItem('campuskart_ecosystem_v4_clean');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.students && parsed.products && parsed.transactions) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore storage error in sandboxed iframe
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('campuskart_ecosystem_v4_clean', JSON.stringify(ecosystem));
    } catch (e) {
      // Ignore storage error
    }
  }, [ecosystem]);

  // Active Portal Switcher ('student' | 'parent' | 'ops' | 'college')
  const [activePortal, setActivePortal] = useState<'student' | 'parent' | 'ops' | 'college' | string>('student');

  // Toast Notification System
  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | string = 'info') => {
    setToast({ title, message, type, id: Date.now() });
  };
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Support / Demo Guide Modal
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [receiptModalOrder, setReceiptModalOrder] = useState<any | null>(null);

  // Student state
  const [studentScreen, setStudentScreen] = useState('welcome');
  const [loggedStudentId, setLoggedStudentId] = useState('CK-2026-101');
  const [studentAuthed, setStudentAuthed] = useState(false);

  const [credIdInput, setCredIdInput] = useState('CK-2026-101');
  const [credPassInput, setCredPassInput] = useState('PASS101');
  const [credError, setCredError] = useState('');
  const [pendingStudent, setPendingStudent] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinMasked, setPinMasked] = useState(true);

  const [shopSearch, setShopSearch] = useState('');
  const [shopCategory, setShopCategory] = useState('All');
  const [shopSort, setShopSort] = useState('featured');
  const [selectedProductId, setSelectedProductId] = useState('PRD-001');
  const [detailQty, setDetailQty] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState(['PRD-001', 'PRD-005']);
  const [cart, setCart] = useState<Array<{ productId: string; qty: number }>>([]);
  const [processedIdempotencyKeys, setProcessedIdempotencyKeys] = useState<string[]>([]);
  const [activeIdempotencyKey, setActiveIdempotencyKey] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const syncWithBackend = async () => {
      try {
        const res = await fetch('https://campuskart-api.example.com/api/health', { method: 'GET' });
        if (mounted && res.ok) setBackendConnected(true);
      } catch (err) {
        if (mounted) setBackendConnected(false);
      }
    };
    syncWithBackend();
    return () => { mounted = false; };
  }, []);

  const [fulfilmentType, setFulfilmentType] = useState('Campus Kiosk Pickup');
  const [selectedCollectionPoint, setSelectedCollectionPoint] = useState(INITIAL_STATE.college.collectionPoints[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CampusKart Wallet');
  const [simulateFailureMode, setSimulateFailureMode] = useState(false);
  const [studentPayStep, setStudentPayStep] = useState(0);
  const [studentPayErrorReason, setStudentPayErrorReason] = useState('');
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<any | null>(null);

  const [orderFilter, setOrderFilter] = useState('All Orders');
  const [trackingOrderId, setTrackingOrderId] = useState('ORD-2026-8803');

  // Parent state
  const [parentScreen, setParentScreen] = useState('welcome');
  const [parentAuthed, setParentAuthed] = useState(false);
  const [parentLookupStudentId, setParentLookupStudentId] = useState('CK-2026-101');
  const [parentPinInput, setParentPinInput] = useState('9999');
  const [parentAuthError, setParentAuthError] = useState('');
  const [linkedStudentId, setLinkedStudentId] = useState('CK-2026-101');

  const [fundAmount, setFundAmount] = useState(1000);
  const [customFundInput, setCustomFundInput] = useState('1000');
  const [fundingMethod, setFundingMethod] = useState('UPI');
  const [parentPayStep, setParentPayStep] = useState(0);
  const [lastFundingReceipt, setLastFundingReceipt] = useState<any | null>(null);

  const [parentTxnFilter, setParentTxnFilter] = useState('All');
  const [parentDateRange, setParentDateRange] = useState('All Time');

  // Operations state
  const [opsScreen, setOpsScreen] = useState('overview');
  const [opsOrderFilter, setOpsOrderFilter] = useState('All');
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Food and Snacks',
    price: 50,
    stock: 25,
    offerTag: 'New Arrival',
    description: ''
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [manualAdjForm, setManualAdjForm] = useState({
    studentId: 'CK-2026-101',
    type: 'Adjustment',
    amount: 50,
    reason: 'Kiosk sensor calibration credit',
    operator: 'OPS-ADMIN-04 (K. Chandra)'
  });
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    academicYear: 'Intermediate First Year (MPC)',
    parentName: '',
    initialWallet: 500
  });

  // College state
  const [collegeScreen, setCollegeScreen] = useState('overview');

  // Derived memos
  const currentStudent = useMemo(() => {
    return ecosystem.students.find((s: any) => s.id === loggedStudentId) || ecosystem.students[0];
  }, [ecosystem.students, loggedStudentId]);

  const parentLinkedStudent = useMemo(() => {
    return ecosystem.students.find((s: any) => s.id === linkedStudentId) || ecosystem.students[0];
  }, [ecosystem.students, linkedStudentId]);

  const populatedCart = useMemo(() => {
    return cart.map(item => {
      const product = ecosystem.products.find((p: any) => p.id === item.productId);
      if (!product) return null;
      return {
        ...product,
        qty: item.qty,
        subtotal: product.price * item.qty
      };
    }).filter(Boolean);
  }, [cart, ecosystem.products]);

  const cartItemCount = useMemo(() => populatedCart.reduce((acc, i) => acc + i.qty, 0), [populatedCart]);
  const cartSubtotal = useMemo(() => populatedCart.reduce((acc, i) => acc + i.subtotal, 0), [populatedCart]);
  const platformFee = 0;
  const cartFinalPayable = cartSubtotal + platformFee;

  const studentOrders = useMemo(() => {
    return ecosystem.orders.filter((o: any) => o.studentId === currentStudent.id);
  }, [ecosystem.orders, currentStudent.id]);

  const studentTransactions = useMemo(() => {
    return ecosystem.transactions.filter((t: any) => t.studentId === currentStudent.id);
  }, [ecosystem.transactions, currentStudent.id]);

  const parentOrders = useMemo(() => {
    return ecosystem.orders.filter((o: any) => o.studentId === parentLinkedStudent.id);
  }, [ecosystem.orders, parentLinkedStudent.id]);

  const parentTransactions = useMemo(() => {
    return ecosystem.transactions.filter((t: any) => t.studentId === parentLinkedStudent.id);
  }, [ecosystem.transactions, parentLinkedStudent.id]);

  const parentControls = useMemo(() => {
    return ecosystem.spendingControls[parentLinkedStudent.id] || INITIAL_STATE.spendingControls["CK-2026-101"];
  }, [ecosystem.spendingControls, parentLinkedStudent.id]);

  const studentControls = useMemo(() => {
    return ecosystem.spendingControls[currentStudent.id] || INITIAL_STATE.spendingControls["CK-2026-101"];
  }, [ecosystem.spendingControls, currentStudent.id]);

  const calcLedgerMetrics = (txns: any[]) => {
    let totalAdded = 0;
    let totalSpent = 0;
    let totalRefunds = 0;
    let purchaseCount = 0;
    txns.forEach((t: any) => {
      if (t.type === 'Wallet Funding') totalAdded += t.amount;
      else if (t.type === 'Student Purchase') {
        totalSpent += Math.abs(t.amount);
        purchaseCount += 1;
      } else if (t.type === 'Refund' || (t.type === 'Adjustment' && t.amount > 0)) {
        totalRefunds += t.amount;
      } else if (t.type === 'Adjustment' && t.amount < 0) {
        totalSpent += Math.abs(t.amount);
      }
    });
    return {
      totalAdded,
      totalSpent,
      totalRefunds,
      purchaseCount,
      avgPurchase: purchaseCount > 0 ? Math.round(totalSpent / purchaseCount) : 0
    };
  };

  const studentMetrics = useMemo(() => calcLedgerMetrics(studentTransactions), [studentTransactions]);
  const parentMetrics = useMemo(() => calcLedgerMetrics(parentTransactions), [parentTransactions]);

  const studentTodaySpend = useMemo(() => {
    return studentTransactions
      .filter((t: any) => t.type === 'Student Purchase' && t.timestamp.startsWith('2026-11-16'))
      .reduce((acc: number, t: any) => acc + Math.abs(t.amount), 0);
  }, [studentTransactions]);

  const parentCategoryChartData = useMemo(() => {
    const map: Record<string, number> = {
      'Food and Snacks': 0,
      'Beverages': 0,
      'Personal Care': 0,
      'Daily Essentials': 0,
      'Academic Supplies': 0,
      'Other Services': 0
    };
    parentOrders.forEach((ord: any) => {
      if (ord.status === 'Cancelled') return;
      ord.items.forEach((it: any) => {
        const cat = it.category || 'Daily Essentials';
        map[cat] = (map[cat] || 0) + it.subtotal;
      });
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [parentOrders]);

  const highestSpendCategory = useMemo(() => {
    if (!parentCategoryChartData.length) return 'None';
    return [...parentCategoryChartData].sort((a, b) => b.value - a.value)[0].name;
  }, [parentCategoryChartData]);

  const parentMonthlyChartData = useMemo(() => {
    const months = ['Sep 2026', 'Oct 2026', 'Nov 2026'];
    const base: Record<string, { month: string; funded: number; spent: number }> = {
      'Sep 2026': { month: 'Sep 2026', funded: 0, spent: 0 },
      'Oct 2026': { month: 'Oct 2026', funded: 0, spent: 0 },
      'Nov 2026': { month: 'Nov 2026', funded: 0, spent: 0 }
    };
    parentTransactions.forEach((t: any) => {
      const m = t.month || 'Nov 2026';
      if (!base[m]) base[m] = { month: m, funded: 0, spent: 0 };
      if (t.type === 'Wallet Funding') base[m].funded += t.amount;
      if (t.type === 'Student Purchase') base[m].spent += Math.abs(t.amount);
    });
    return months.map(m => base[m]);
  }, [parentTransactions]);

  const parentDailyTrendData = useMemo(() => {
    const days = [
      { day: 'Nov 10', amount: 0, funded: 0 },
      { day: 'Nov 12', amount: 0, funded: 0 },
      { day: 'Nov 14', amount: 0, funded: 0 },
      { day: 'Nov 15', amount: 0, funded: 0 },
      { day: 'Nov 16', amount: 0, funded: 0 }
    ];
    parentTransactions.forEach((t: any) => {
      const datePrefix = t.timestamp.slice(5, 10);
      const mapDay: Record<string, string> = {
        '11-10': 'Nov 10',
        '11-12': 'Nov 12',
        '11-14': 'Nov 14',
        '11-15': 'Nov 15',
        '11-16': 'Nov 16'
      };
      const dayName = mapDay[datePrefix];
      const target = days.find(d => d.day === dayName);
      if (target) {
        if (t.type === 'Student Purchase') target.amount += Math.abs(t.amount);
        if (t.type === 'Wallet Funding') target.funded += t.amount;
      }
    });
    return days;
  }, [parentTransactions]);

  // Handlers
  const handleValidateStudentCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCredError('');
    const trimmedId = credIdInput.trim().toUpperCase();
    const student = ecosystem.students.find((s: any) => s.id.toUpperCase() === trimmedId);

    if (!student) {
      setCredError('Student ID not found in CampusKart registry. Try CK-2026-101.');
      return;
    }
    if (student.institution !== ecosystem.college.name) {
      setCredError('Account does not belong to this participating institution.');
      return;
    }
    if (student.status !== 'Active') {
      setCredError(`Account ${student.id} (${student.name}) is currently Inactive. Contact Operations.`);
      return;
    }
    if (student.password !== credPassInput.trim()) {
      setCredError('Invalid student access password. Demo password for CK-2026-101 is PASS101.');
      return;
    }

    setPendingStudent(student);
    setPinInput('');
    setPinError('');
    setStudentScreen('pin');
  };

  const handleVerifyStudentPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingStudent) return;
    if (pinInput.trim() !== pendingStudent.pin) {
      setPinError(`Incorrect 4-digit CampusKart PIN. Demo PIN for ${pendingStudent.firstName} is ${pendingStudent.pin}.`);
      return;
    }
    setLoggedStudentId(pendingStudent.id);
    setStudentAuthed(true);
    setPinError('');
    setStudentScreen('home');
    showToast('Session Established', `Welcome back, ${pendingStudent.name}!`, 'success');
  };

  const handleOpenProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setDetailQty(1);
    setRecentlyViewed(prev => [productId, ...prev.filter(id => id !== productId)].slice(0, 5));
    setStudentScreen('product_detail');
  };

  const handleAddToCart = (product: any, qtyToAdd = 1) => {
    if (!product.active || product.stock <= 0) {
      showToast('Unavailable', `${product.name} is currently out of stock.`, 'error');
      return;
    }
    const existing = cart.find(c => c.productId === product.id);
    const currentQty = existing ? existing.qty : 0;
    if (currentQty + qtyToAdd > product.stock) {
      showToast('Stock Limit Reached', `Only ${product.stock} units of ${product.name} available in stock.`, 'error');
      return;
    }
    if (existing) {
      setCart(cart.map(c => c.productId === product.id ? { ...c, qty: c.qty + qtyToAdd } : c));
    } else {
      setCart([...cart, { productId: product.id, qty: qtyToAdd }]);
    }
    showToast('Added to Cart', `${qtyToAdd}x ${product.name} added to your CampusKart bag.`, 'success');
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const product = ecosystem.products.find((p: any) => p.id === productId);
    if (!product) return;
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      const nextQty = item.qty + delta;
      if (nextQty <= 0) return null;
      if (nextQty > product.stock) {
        showToast('Stock Limit', `Maximum available stock is ${product.stock} units.`, 'error');
        return item;
      }
      return { ...item, qty: nextQty };
    }).filter(Boolean) as Array<{ productId: string; qty: number }>);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    showToast('Item Removed', 'Cart subtotal updated.', 'info');
  };

  const handleRequestParentTopUp = () => {
    const shortfall = Math.max(0, cartFinalPayable - currentStudent.walletBalance);
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      target: 'parent',
      studentId: currentStudent.id,
      title: 'Wallet Top-Up Requested by Student',
      message: `${currentStudent.name} requested ₹${shortfall > 0 ? shortfall : 500} top-up for a ₹${cartFinalPayable} order (Current Balance: ₹${currentStudent.walletBalance}).`,
      time: 'Just now',
      type: 'funding',
      read: false
    };
    setEcosystem((prev: any) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    }));
    showToast('Parent Notified', `Top-up request sent to ${currentStudent.parentName}'s Parent Portal.`, 'success');
  };

  const checkOrderBlockers = (): string | null => {
    if (currentStudent.status !== 'Active') {
      return 'Student account is inactive.';
    }
    if (populatedCart.length === 0) {
      return 'Your shopping cart is empty.';
    }
    for (const item of populatedCart) {
      if (!item.active || item.stock < item.qty) {
        return `${item.name} only has ${item.stock} left in stock.`;
      }
      if (studentControls.restrictedCategories?.includes(item.category)) {
        return `Category "${item.category}" (${item.name}) is restricted by Parent Spending Controls.`;
      }
    }
    if (currentStudent.walletBalance < cartFinalPayable) {
      return `Insufficient CampusKart Wallet balance. Need ₹${cartFinalPayable - currentStudent.walletBalance} more.`;
    }
    if (studentControls.dailyLimitEnabled && (studentTodaySpend + cartFinalPayable > studentControls.dailyLimit)) {
      return `Order exceeds Parent Daily Spending Limit of ₹${studentControls.dailyLimit} (Already spent today: ₹${studentTodaySpend}).`;
    }
    if (studentControls.monthlyLimitEnabled && (studentMetrics.totalSpent + cartFinalPayable > studentControls.monthlyLimit)) {
      return `Order exceeds Parent Monthly Spending Limit of ₹${studentControls.monthlyLimit}.`;
    }
    return null;
  };

  const handleConfirmAndPay = () => {
    const blocker = checkOrderBlockers();
    if (blocker) {
      if (blocker.includes('Limit') || blocker.includes('restricted')) {
        const limitNotif = {
          id: `NOTIF-${Date.now()}`,
          target: 'parent',
          studentId: currentStudent.id,
          title: 'Spending Control Triggered',
          message: `Blocked ₹${cartFinalPayable} purchase attempt by ${currentStudent.name}: ${blocker}`,
          time: 'Just now',
          type: 'alert',
          read: false
        };
        setEcosystem((prev: any) => ({
          ...prev,
          notifications: [limitNotif, ...prev.notifications]
        }));
      }
      showToast('Transaction Blocked', blocker, 'error');
      return;
    }

    setStudentScreen('payment_processing');
    setStudentPayStep(1);
    setStudentPayErrorReason('');

    setTimeout(() => {
      setStudentPayStep(2);
    }, 1200);

    setTimeout(() => {
      if (simulateFailureMode) {
        setStudentPayStep(4);
        setStudentPayErrorReason('Simulated gateway verification timeout — Wallet was NOT debited and cart is preserved.');
        return;
      }
      setStudentPayStep(3);
    }, 3100);

    setTimeout(() => {
      if (simulateFailureMode) return;
      const nowStr = "2026-11-16 " + new Date().toTimeString().slice(0, 5);
      const orderId = `ORD-2026-${Math.floor(8810 + Math.random() * 180)}`;
      const txnId = `TXN-CK-${Math.floor(90025 + Math.random() * 900)}`;
      const constidemKey = activeIdempotencyKey || `IDEM-${Date.now()}`;
      if (processedIdempotencyKeys.includes(constidemKey)) return;
      setProcessedIdempotencyKeys(prev => [...prev, constidemKey]);
      const prevBalPaise = Math.round(currentStudent.walletBalance * 100);
      const payablePaise = Math.round(cartFinalPayable * 100);
      const newBalPaise = Math.max(0, prevBalPaise - payablePaise);
      const prevBal = prevBalPaise / 100;
      const newBal = newBalPaise / 100;
      const primaryCategory = populatedCart[0]?.category || 'Daily Essentials';

      const newOrder = {
        id: orderId,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        date: nowStr,
        month: "Nov 2026",
        items: populatedCart.map(i => ({
          productId: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          qty: i.qty,
          subtotal: i.subtotal
        })),
        totalAmount: cartFinalPayable,
        paymentStatus: "Paid via CampusKart Wallet",
        txnRef: txnId,
        fulfilmentMethod: fulfilmentType,
        collectionPoint: selectedCollectionPoint,
        estimatedTime: "12:45 PM – 01:30 PM Window",
        status: "Order Placed",
        previousBalance: prevBal,
        remainingBalance: newBal
      };

      const newTxn = {
        id: txnId,
        studentId: currentStudent.id,
        type: "Student Purchase",
        category: primaryCategory,
        amount: -cartFinalPayable,
        previousBalance: prevBal,
        newBalance: newBal,
        timestamp: nowStr,
        month: "Nov 2026",
        status: "Completed",
        method: "CampusKart Wallet",
        relatedOrderId: orderId,
        note: populatedCart.map(i => `${i.qty}x ${i.name}`).join(', ').slice(0, 65),
        reconciled: true
      };

      const newNotifs = [
        {
          id: `NOTIF-${Date.now()}-1`,
          target: 'both',
          studentId: currentStudent.id,
          title: `Order Confirmed (${orderId})`,
          message: `${currentStudent.name} placed an order for ₹${cartFinalPayable}. Remaining balance: ₹${newBal}.`,
          time: 'Just now',
          type: 'spend',
          read: false
        }
      ];

      if (studentControls.lowBalanceAlertEnabled && newBal <= studentControls.lowBalanceThreshold) {
        newNotifs.push({
          id: `NOTIF-${Date.now()}-2`,
          target: 'parent',
          studentId: currentStudent.id,
          title: 'Low Wallet Balance Alert',
          message: `${currentStudent.name}'s wallet balance is ₹${newBal} (below ₹${studentControls.lowBalanceThreshold} threshold).`,
          time: 'Just now',
          type: 'alert',
          read: false
        });
      }

      setEcosystem((prev: any) => ({
        ...prev,
        students: prev.students.map((s: any) => s.id === currentStudent.id ? { ...s, walletBalance: newBal } : s),
        products: prev.products.map((p: any) => {
          const inCart = cart.find(c => c.productId === p.id);
          return inCart ? { ...p, stock: Math.max(0, p.stock - inCart.qty) } : p;
        }),
        orders: [newOrder, ...prev.orders],
        transactions: [newTxn, ...prev.transactions],
        notifications: [...newNotifs, ...prev.notifications]
      }));

      setLastConfirmedOrder(newOrder);
      setTrackingOrderId(orderId);
      setCart([]);
      setStudentScreen('order_confirmation');
    }, 5000);
  };

  const handleParentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setParentAuthError('');
    const student = ecosystem.students.find((s: any) => s.id.toUpperCase() === parentLookupStudentId.trim().toUpperCase());
    if (!student) {
      setParentAuthError('Student CampusKart ID not found. Use CK-2026-101 or CK-2026-102.');
      return;
    }
    if (student.parentPin !== parentPinInput.trim()) {
      setParentAuthError(`Invalid Parent Access PIN for ${student.parentName}. Demo PIN is ${student.parentPin}.`);
      return;
    }
    setLinkedStudentId(student.id);
    setParentAuthed(true);
    setParentScreen('dashboard');
    showToast('Parent Portal Unlocked', `Linked to ${student.name} (${student.id})`, 'success');
  };

  const handleConfirmParentFunding = () => {
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) {
      showToast('Invalid Amount', 'Please enter a valid funding amount greater than ₹0.', 'error');
      return;
    }
    setParentScreen('funding_processing');
    setParentPayStep(1);

    setTimeout(() => {
      setParentPayStep(2);
    }, 1200);

    setTimeout(() => {
      setParentPayStep(3);
    }, 3100);

    setTimeout(() => {
      const nowStr = "2026-11-16 " + new Date().toTimeString().slice(0, 5);
      const txnId = `TXN-CK-${Math.floor(90100 + Math.random() * 899)}`;
      const prevBalPaise = Math.round(parentLinkedStudent.walletBalance * 100);
      const addPaise = Math.round(amt * 100);
      const newBalPaise = prevBalPaise + addPaise;
      const prevBal = prevBalPaise / 100;
      const newBal = newBalPaise / 100;

      const newTxn = {
        id: txnId,
        studentId: parentLinkedStudent.id,
        type: "Wallet Funding",
        category: "Parent Top-Up",
        amount: amt,
        previousBalance: prevBal,
        newBalance: newBal,
        timestamp: nowStr,
        month: "Nov 2026",
        status: "Completed",
        method: `${fundingMethod} (Simulated)`,
        relatedOrderId: null,
        note: `Parent wallet top-up by ${parentLinkedStudent.parentName}`,
        reconciled: true
      };

      const newNotif = {
        id: `NOTIF-${Date.now()}`,
        target: 'both',
        studentId: parentLinkedStudent.id,
        title: 'Wallet Funded Successfully',
        message: `₹${amt} added to ${parentLinkedStudent.name}'s wallet via ${fundingMethod}. New balance: ₹${newBal}.`,
        time: 'Just now',
        type: 'funding',
        read: false
      };

      setEcosystem((prev: any) => ({
        ...prev,
        students: prev.students.map((s: any) => s.id === parentLinkedStudent.id ? { ...s, walletBalance: newBal } : s),
        transactions: [newTxn, ...prev.transactions],
        notifications: [newNotif, ...prev.notifications]
      }));

      setLastFundingReceipt({
        txnId,
        studentName: parentLinkedStudent.name,
        studentId: parentLinkedStudent.id,
        amount: amt,
        method: fundingMethod,
        timestamp: nowStr,
        previousBalance: prevBal,
        newBalance: newBal
      });

      setParentScreen('funding_success');
    }, 5000);
  };

  const handleSaveSpendingControls = (updatedControls: any) => {
    setEcosystem((prev: any) => ({
      ...prev,
      spendingControls: {
        ...prev.spendingControls,
        [parentLinkedStudent.id]: updatedControls
      },
      notifications: [
        {
          id: `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: parentLinkedStudent.id,
          title: 'Spending Preferences Updated',
          message: `Parent updated spending controls (Daily limit: ${updatedControls.dailyLimitEnabled ? '₹' + updatedControls.dailyLimit : 'Off'}).`,
          time: 'Just now',
          type: 'alert',
          read: false
        },
        ...prev.notifications
      ]
    }));
    showToast('Controls Saved', 'Spending limits and category rules are now enforced in real time.', 'success');
  };

  const handleOpsUpdateOrderStatus = (orderId: string, nextStatus: string) => {
    const targetOrder = ecosystem.orders.find((o: any) => o.id === orderId);
    if (!targetOrder) return;

    setEcosystem((prev: any) => ({
      ...prev,
      orders: prev.orders.map((o: any) => o.id === orderId ? { ...o, status: nextStatus } : o),
      notifications: [
        {
          id: `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: targetOrder.studentId,
          title: `Order ${orderId} Status: ${nextStatus}`,
          message: `Your order (${orderId}) is now marked as "${nextStatus}" by CampusKart Operations.`,
          time: 'Just now',
          type: 'order',
          read: false
        },
        ...prev.notifications
      ]
    }));
    showToast('Order Status Updated', `${orderId} moved to "${nextStatus}". Student & Parent views synced.`, 'success');
  };

  const handleOpsUpdateStock = (productId: string, newStock?: number, newPrice?: number, toggleActive?: boolean) => {
    setEcosystem((prev: any) => ({
      ...prev,
      products: prev.products.map((p: any) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          stock: newStock !== undefined ? Math.max(0, Number(newStock)) : p.stock,
          price: newPrice !== undefined ? Math.max(1, Number(newPrice)) : p.price,
          active: toggleActive !== undefined ? toggleActive : p.active
        };
      })
    }));
    showToast('Catalogue Updated', `Product ${productId} inventory synced with Student Shop.`, 'success');
  };

  const handleOpsCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) {
      showToast('Missing Name', 'Please enter a product name.', 'error');
      return;
    }
    const newId = `PRD-0${ecosystem.products.length + 1}`;
    const prod = {
      id: newId,
      name: newProductForm.name.trim(),
      category: newProductForm.category,
      price: Math.max(5, Number(newProductForm.price) || 50),
      stock: Math.max(0, Number(newProductForm.stock) || 20),
      active: true,
      featured: true,
      frequent: false,
      offerTag: newProductForm.offerTag || 'Campus Special',
      description: newProductForm.description.trim() || 'Approved institutional campus product.'
    };
    setEcosystem((prev: any) => ({
      ...prev,
      products: [prod, ...prev.products]
    }));
    setNewProductForm({ name: '', category: 'Food and Snacks', price: 50, stock: 25, offerTag: 'New Arrival', description: '' });
    showToast('Product Created', `${prod.name} (${prod.id}) is now live in the Student Catalogue.`, 'success');
  };

  const handleOpsToggleStudentStatus = (studentId: string) => {
    setEcosystem((prev: any) => ({
      ...prev,
      students: prev.students.map((s: any) => {
        if (s.id !== studentId) return s;
        const next = s.status === 'Active' ? 'Inactive' : 'Active';
        return { ...s, status: next };
      })
    }));
    showToast('Student Status Updated', `Account ${studentId} status toggled.`, 'info');
  };

  const handleOpsCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim() || !newStudentForm.parentName.trim()) {
      showToast('Incomplete Form', 'Provide both student and linked parent name.', 'error');
      return;
    }
    const idx = ecosystem.students.length + 101;
    const newId = `CK-2026-${idx}`;
    const initBal = Math.max(0, Number(newStudentForm.initialWallet) || 0);
    const nowStr = "2026-11-16 " + new Date().toTimeString().slice(0, 5);

    const newStu = {
      id: newId,
      name: newStudentForm.name.trim(),
      firstName: newStudentForm.name.trim().split(' ')[0],
      password: `PASS${idx}`,
      pin: "1234",
      institution: ecosystem.college.name,
      academicYear: newStudentForm.academicYear,
      status: "Active",
      walletBalance: initBal,
      parentId: `PAR-${idx}`,
      parentName: newStudentForm.parentName.trim(),
      parentPin: "9999",
      parentPhone: "+91 90000 11223",
      notificationsPref: { sms: true, app: true, lowBalance: true }
    };

    const newTxns = initBal > 0 ? [{
      id: `TXN-CK-${Math.floor(90500 + Math.random() * 400)}`,
      studentId: newId,
      type: "Wallet Funding",
      category: "Parent Top-Up",
      amount: initBal,
      previousBalance: 0,
      newBalance: initBal,
      timestamp: nowStr,
      month: "Nov 2026",
      status: "Completed",
      method: "Onboarding Initial Credit",
      relatedOrderId: null,
      note: `Onboarding balance funded for ${newStu.name}`,
      reconciled: true
    }] : [];

    setEcosystem((prev: any) => ({
      ...prev,
      students: [...prev.students, newStu],
      spendingControls: {
        ...prev.spendingControls,
        [newId]: {
          dailyLimitEnabled: true,
          dailyLimit: 500,
          weeklyLimitEnabled: true,
          weeklyLimit: 2000,
          monthlyLimitEnabled: true,
          monthlyLimit: 5000,
          restrictedCategories: [],
          lowBalanceAlertEnabled: true,
          lowBalanceThreshold: 150,
          instantTxnNotification: true,
          spendingAlertsEnabled: true
        }
      },
      transactions: [...newTxns, ...prev.transactions]
    }));
    setNewStudentForm({ name: '', academicYear: 'Intermediate First Year (MPC)', parentName: '', initialWallet: 500 });
    showToast('Student Enrolled', `${newStu.name} registered with ID ${newId} (Pass: PASS${idx}, PIN: 1234).`, 'success');
  };

  const handleOpsManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = ecosystem.students.find((s: any) => s.id === manualAdjForm.studentId);
    if (!stu) return;
    const rawAmt = Number(manualAdjForm.amount);
    if (!rawAmt || !manualAdjForm.reason.trim()) {
      showToast('Audit Requirement', 'Reason, operator identity, and non-zero amount are mandatory.', 'error');
      return;
    }
    const prevBalPaise = Math.round(stu.walletBalance * 100);
    const deltaPaise = Math.round(rawAmt * 100);
    if (prevBalPaise + deltaPaise < 0) {
      showToast('Negative Balance Blocked', 'Wallet adjustment cannot result in a negative balance.', 'error');
      return;
    }
    const prevBal = prevBalPaise / 100;
    const nextBal = (prevBalPaise + deltaPaise) / 100;
    const nowStr = "2026-11-16 " + new Date().toTimeString().slice(0, 5);
    const txnId = `TXN-ADJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn = {
      id: txnId,
      studentId: stu.id,
      type: manualAdjForm.type,
      category: "Audited Adjustment",
      amount: rawAmt,
      previousBalance: prevBal,
      newBalance: nextBal,
      timestamp: nowStr,
      month: "Nov 2026",
      status: "Completed",
      method: `Operator: ${manualAdjForm.operator}`,
      relatedOrderId: null,
      note: `[AUDIT] ${manualAdjForm.reason.trim()}`,
      reconciled: true
    };

    setEcosystem((prev: any) => ({
      ...prev,
      students: prev.students.map((s: any) => s.id === stu.id ? { ...s, walletBalance: nextBal } : s),
      transactions: [newTxn, ...prev.transactions],
      notifications: [
        {
          id: `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: stu.id,
          title: `Audited Wallet ${manualAdjForm.type}`,
          message: `₹${rawAmt} adjustment recorded by ${manualAdjForm.operator} (${manualAdjForm.reason}). New balance: ₹${nextBal}.`,
          time: 'Just now',
          type: 'funding',
          read: false
        },
        ...prev.notifications
      ]
    }));

    setManualAdjForm({ ...manualAdjForm, amount: 50, reason: '' });
    showToast('Ledger Entry Recorded', `Audited transaction ${txnId} committed and reconciled.`, 'success');
  };

  const handleResetDemoData = () => {
    setEcosystem(INITIAL_STATE);
    setCart([]);
    setProcessedIdempotencyKeys([]);
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

        currentStudent,
        parentLinkedStudent,
        populatedCart,
        cartItemCount,
        cartSubtotal,
        platformFee,
        cartFinalPayable,
        studentOrders,
        studentTransactions,
        parentOrders,
        parentTransactions,
        parentControls,
        studentControls,
        studentMetrics,
        parentMetrics,
        studentTodaySpend,
        parentCategoryChartData,
        highestSpendCategory,
        parentMonthlyChartData,
        parentDailyTrendData,

        handleValidateStudentCredentials,
        handleVerifyStudentPin,
        handleOpenProductDetail,
        handleAddToCart,
        handleUpdateCartQty,
        handleRemoveFromCart,
        handleRequestParentTopUp,
        checkOrderBlockers,
        handleConfirmAndPay,
        handleParentLogin,
        handleConfirmParentFunding,
        handleSaveSpendingControls,
        handleOpsUpdateOrderStatus,
        handleOpsUpdateStock,
        handleOpsCreateProduct,
        handleOpsToggleStudentStatus,
        handleOpsCreateStudent,
        handleOpsManualAdjustment,
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

export default CampusKartContext;
