/**
 * Student Actions Hook: Auth, Cart Management, Checkers & Checkout
 */

import React from 'react';
import type {
  EcosystemState,
  Student,
  Product,
  Order,
  PopulatedCartItem,
  SpendingControls,
  LedgerMetrics,
  Notification,
  WalletTransaction,
  StudentScreen,
} from '../../types/ecosystem';

interface StudentActionParams {
  ecosystem: EcosystemState;
  setEcosystem: React.Dispatch<React.SetStateAction<EcosystemState>>;
  currentStudent: Student;
  populatedCart: PopulatedCartItem[];
  cart: Array<{ productId: string; qty: number }>;
  setCart: React.Dispatch<React.SetStateAction<Array<{ productId: string; qty: number }>>>;
  cartFinalPayable: number;
  studentControls: SpendingControls;
  studentMetrics: LedgerMetrics;
  studentTodaySpend: number;
  credIdInput: string;
  credPassInput: string;
  setCredError: (err: string) => void;
  pendingStudent: Student | null;
  setPendingStudent: (stu: Student | null) => void;
  pinInput: string;
  setPinInput: (pin: string) => void;
  setPinError: (err: string) => void;
  setLoggedStudentId: (id: string) => void;
  setStudentAuthed: (authed: boolean) => void;
  setStudentScreen: (screen: StudentScreen | string) => void;
  setSelectedProductId: (id: string) => void;
  setDetailQty: (qty: number) => void;
  setRecentlyViewed: React.Dispatch<React.SetStateAction<string[]>>;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | string) => void;
  setStudentPayStep: (step: number) => void;
  setStudentPayErrorReason: (reason: string) => void;
  simulateFailureMode: boolean;
  activeIdempotencyKey: string;
  processedIdempotencyKeys: string[];
  setProcessedIdempotencyKeys: React.Dispatch<React.SetStateAction<string[]>>;
  fulfilmentType: string;
  selectedCollectionPoint: string;
  setLastConfirmedOrder: (order: Order | null) => void;
  setTrackingOrderId: (id: string) => void;
}

export function useStudentActions(params: StudentActionParams) {
  const {
    ecosystem,
    setEcosystem,
    currentStudent,
    populatedCart,
    cart,
    setCart,
    cartFinalPayable,
    studentControls,
    studentMetrics,
    studentTodaySpend,
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
  } = params;

  const handleValidateStudentCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCredError('');
    const student = ecosystem.students.find(
      (s) => s.id.toUpperCase() === credIdInput.trim().toUpperCase()
    );
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
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 5));
    setStudentScreen('product_detail');
  };

  const handleAddToCart = (product: Product, qtyToAdd = 1) => {
    if (!product.active || product.stock <= 0) {
      showToast('Unavailable', `${product.name} is currently out of stock.`, 'error');
      return;
    }
    const existing = cart.find((c) => c.productId === product.id);
    const currentQty = existing ? existing.qty : 0;
    if (currentQty + qtyToAdd > product.stock) {
      showToast('Stock Limit Reached', `Only ${product.stock} units of ${product.name} available in stock.`, 'error');
      return;
    }
    if (existing) {
      setCart(cart.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + qtyToAdd } : c)));
    } else {
      setCart([...cart, { productId: product.id, qty: qtyToAdd }]);
    }
    showToast('Added to Cart', `${qtyToAdd}x ${product.name} added to your CampusKart bag.`, 'success');
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const product = ecosystem.products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          if (nextQty > product.stock) {
            showToast('Stock Limit', `Maximum available stock is ${product.stock} units.`, 'error');
            return item;
          }
          return { ...item, qty: nextQty };
        })
        .filter(Boolean) as Array<{ productId: string; qty: number }>
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    showToast('Item Removed', 'Cart subtotal updated.', 'info');
  };

  const handleRequestParentTopUp = () => {
    const shortfall = Math.max(0, cartFinalPayable - currentStudent.walletBalance);
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      target: 'parent',
      studentId: currentStudent.id,
      title: 'Wallet Top-Up Requested by Student',
      message: `${currentStudent.name} requested ₹${shortfall > 0 ? shortfall : 500} top-up for a ₹${cartFinalPayable} order (Current Balance: ₹${currentStudent.walletBalance}).`,
      time: 'Just now',
      type: 'funding',
      read: false,
    };
    setEcosystem((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
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
    if (studentControls.dailyLimitEnabled && studentTodaySpend + cartFinalPayable > studentControls.dailyLimit) {
      return `Order exceeds Parent Daily Spending Limit of ₹${studentControls.dailyLimit} (Already spent today: ₹${studentTodaySpend}).`;
    }
    if (
      studentControls.monthlyLimitEnabled &&
      studentMetrics.totalSpent + cartFinalPayable > studentControls.monthlyLimit
    ) {
      return `Order exceeds Parent Monthly Spending Limit of ₹${studentControls.monthlyLimit}.`;
    }
    return null;
  };

  const handleConfirmAndPay = () => {
    const blocker = checkOrderBlockers();
    if (blocker) {
      if (blocker.includes('Limit') || blocker.includes('restricted')) {
        const limitNotif: Notification = {
          id: `NOTIF-${Date.now()}`,
          target: 'parent',
          studentId: currentStudent.id,
          title: 'Spending Control Triggered',
          message: `Blocked ₹${cartFinalPayable} purchase attempt by ${currentStudent.name}: ${blocker}`,
          time: 'Just now',
          type: 'alert',
          read: false,
        };
        setEcosystem((prev) => ({
          ...prev,
          notifications: [limitNotif, ...prev.notifications],
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
      const nowStr = '2026-11-16 ' + new Date().toTimeString().slice(0, 5);
      const orderId = `ORD-2026-${Math.floor(8810 + Math.random() * 180)}`;
      const txnId = `TXN-CK-${Math.floor(90025 + Math.random() * 900)}`;
      const constidemKey = activeIdempotencyKey || `IDEM-${Date.now()}`;
      if (processedIdempotencyKeys.includes(constidemKey)) return;
      setProcessedIdempotencyKeys((prev) => [...prev, constidemKey]);
      const prevBalPaise = Math.round(currentStudent.walletBalance * 100);
      const payablePaise = Math.round(cartFinalPayable * 100);
      const newBalPaise = Math.max(0, prevBalPaise - payablePaise);
      const prevBal = prevBalPaise / 100;
      const newBal = newBalPaise / 100;
      const primaryCategory = populatedCart[0]?.category || 'Daily Essentials';

      const newOrder: Order = {
        id: orderId,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        date: nowStr,
        month: 'Nov 2026',
        items: populatedCart.map((i) => ({
          productId: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          qty: i.qty,
          subtotal: i.subtotal,
        })),
        totalAmount: cartFinalPayable,
        paymentStatus: 'Paid via CampusKart Wallet',
        txnRef: txnId,
        fulfilmentMethod: fulfilmentType,
        collectionPoint: selectedCollectionPoint,
        estimatedTime: '12:45 PM – 01:30 PM Window',
        status: 'Order Placed',
        previousBalance: prevBal,
        remainingBalance: newBal,
      };

      const newTxn: WalletTransaction = {
        id: txnId,
        studentId: currentStudent.id,
        type: 'Student Purchase',
        category: primaryCategory,
        amount: -cartFinalPayable,
        previousBalance: prevBal,
        newBalance: newBal,
        timestamp: nowStr,
        month: 'Nov 2026',
        status: 'Completed',
        method: 'CampusKart Wallet',
        relatedOrderId: orderId,
        note: populatedCart.map((i) => `${i.qty}x ${i.name}`).join(', ').slice(0, 65),
        reconciled: true,
      };

      const newNotifs: Notification[] = [
        {
          id: `NOTIF-${Date.now()}-1`,
          target: 'both',
          studentId: currentStudent.id,
          title: `Order Confirmed (${orderId})`,
          message: `${currentStudent.name} placed an order for ₹${cartFinalPayable}. Remaining balance: ₹${newBal}.`,
          time: 'Just now',
          type: 'spend',
          read: false,
        },
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
          read: false,
        });
      }

      setEcosystem((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === currentStudent.id ? { ...s, walletBalance: newBal } : s)),
        products: prev.products.map((p) => {
          const inCart = cart.find((c) => c.productId === p.id);
          return inCart ? { ...p, stock: Math.max(0, p.stock - inCart.qty) } : p;
        }),
        orders: [newOrder, ...prev.orders],
        transactions: [newTxn, ...prev.transactions],
        notifications: [...newNotifs, ...prev.notifications],
      }));

      setLastConfirmedOrder(newOrder);
      setTrackingOrderId(orderId);
      setCart([]);
      setStudentScreen('order_confirmation');
    }, 5000);
  };

  return {
    handleValidateStudentCredentials,
    handleVerifyStudentPin,
    handleOpenProductDetail,
    handleAddToCart,
    handleUpdateCartQty,
    handleRemoveFromCart,
    handleRequestParentTopUp,
    checkOrderBlockers,
    handleConfirmAndPay,
  };
}
