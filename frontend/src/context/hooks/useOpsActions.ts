/**
 * Operations Actions Hook: Order Management, Stock, Student Enrollment & Manual Adjustments
 */

import React from 'react';
import { supabaseService } from '../../services/supabaseService';
import type {
  EcosystemState,
  Product,
  Student,
  WalletTransaction,
  Notification,
} from '../../types/ecosystem';

interface OpsActionParams {
  ecosystem: EcosystemState;
  setEcosystem: React.Dispatch<React.SetStateAction<EcosystemState>>;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | string) => void;
  newProductForm: {
    name: string;
    category: string;
    price: number;
    stock: number;
    offerTag: string;
    description: string;
  };
  setNewProductForm: React.Dispatch<React.SetStateAction<any>>;
  newStudentForm: {
    name: string;
    academicYear: string;
    parentName: string;
    initialWallet: number;
  };
  setNewStudentForm: React.Dispatch<React.SetStateAction<any>>;
  manualAdjForm: {
    studentId: string;
    type: string;
    amount: number;
    reason: string;
    operator: string;
  };
}

export function useOpsActions(params: OpsActionParams) {
  const {
    ecosystem,
    setEcosystem,
    showToast,
    newProductForm,
    setNewProductForm,
    newStudentForm,
    setNewStudentForm,
    manualAdjForm,
  } = params;

  const handleOpsUpdateOrderStatus = (orderId: string, nextStatus: string) => {
    const targetOrder = ecosystem.orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setEcosystem((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      notifications: [
        {
          id: `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: targetOrder.studentId,
          title: `Order ${orderId} Status: ${nextStatus}`,
          message: `Your order (${orderId}) is now marked as "${nextStatus}" by CampusKart Operations.`,
          time: 'Just now',
          type: 'order',
          read: false,
        },
        ...prev.notifications,
      ],
    }));

    if (supabaseService.isAvailable()) {
      supabaseService.updateOrderStatus(orderId, nextStatus);
    }

    showToast('Order Status Updated', `${orderId} moved to "${nextStatus}". Student & Parent views synced.`, 'success');
  };

  const handleOpsUpdateStock = (
    productId: string,
    newStock?: number,
    newPrice?: number,
    toggleActive?: boolean
  ) => {
    setEcosystem((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          stock: newStock !== undefined ? Math.max(0, Number(newStock)) : p.stock,
          price: newPrice !== undefined ? Math.max(1, Number(newPrice)) : p.price,
          active: toggleActive !== undefined ? toggleActive : p.active,
        };
      }),
    }));

    if (supabaseService.isAvailable()) {
      const p = ecosystem.products.find((prod) => prod.id === productId);
      supabaseService.updateProductStock(
        productId,
        p?.name || '',
        newStock,
        newPrice,
        toggleActive
      );
    }

    showToast('Catalogue Updated', `Product ${productId} inventory synced with Student Shop.`, 'success');
  };

  const handleOpsCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) {
      showToast('Missing Name', 'Please enter a product name.', 'error');
      return;
    }
    const newId = `PRD-0${ecosystem.products.length + 1}`;
    const prod: Product = {
      id: newId,
      name: newProductForm.name.trim(),
      category: newProductForm.category,
      price: Math.max(5, Number(newProductForm.price) || 50),
      stock: Math.max(0, Number(newProductForm.stock) || 20),
      active: true,
      featured: true,
      frequent: false,
      offerTag: newProductForm.offerTag || 'Campus Special',
      description: newProductForm.description.trim() || 'Approved institutional campus product.',
    };
    setEcosystem((prev) => ({
      ...prev,
      products: [prod, ...prev.products],
    }));
    setNewProductForm({
      name: '',
      category: 'Food and Snacks',
      price: 50,
      stock: 25,
      offerTag: 'New Arrival',
      description: '',
    });

    if (supabaseService.isAvailable()) {
      supabaseService.createProduct(prod);
    }

    showToast('Product Created', `${prod.name} (${prod.id}) is now live in the Student Catalogue.`, 'success');
  };

  const handleOpsToggleStudentStatus = (studentId: string) => {
    let next: 'Active' | 'Inactive' = 'Active';
    setEcosystem((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id !== studentId) return s;
        next = s.status === 'Active' ? 'Inactive' : 'Active';
        return { ...s, status: next };
      }),
    }));

    if (supabaseService.isAvailable()) {
      supabaseService.updateStudentStatus(studentId, next);
    }

    showToast('Student Status Updated', `Account ${studentId} status set to ${next}.`, 'info');
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
    const nowStr = '2026-11-16 ' + new Date().toTimeString().slice(0, 5);

    const newStu: Student = {
      id: newId,
      name: newStudentForm.name.trim(),
      firstName: newStudentForm.name.trim().split(' ')[0],
      password: `PASS${idx}`,
      pin: '1234',
      institution: ecosystem.college.name,
      academicYear: newStudentForm.academicYear,
      status: 'Active',
      walletBalance: initBal,
      parentId: `PAR-${idx}`,
      parentName: newStudentForm.parentName.trim(),
      parentPin: '9999',
      parentPhone: '+91 90000 11223',
      notificationsPref: { sms: true, app: true, lowBalance: true },
    };

    const newTxns: WalletTransaction[] =
      initBal > 0
        ? [
            {
              id: `TXN-CK-${Math.floor(90500 + Math.random() * 400)}`,
              studentId: newId,
              type: 'Wallet Funding',
              category: 'Parent Top-Up',
              amount: initBal,
              previousBalance: 0,
              newBalance: initBal,
              timestamp: nowStr,
              month: 'Nov 2026',
              status: 'Completed',
              method: 'Onboarding Initial Credit',
              relatedOrderId: null,
              note: `Onboarding balance funded for ${newStu.name}`,
              reconciled: true,
            },
          ]
        : [];

    setEcosystem((prev) => ({
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
          spendingAlertsEnabled: true,
        },
      },
      transactions: [...newTxns, ...prev.transactions],
    }));
    setNewStudentForm({
      name: '',
      academicYear: 'Intermediate First Year (MPC)',
      parentName: '',
      initialWallet: 500,
    });

    if (supabaseService.isAvailable()) {
      supabaseService.enrollStudent(newStu, initBal);
    }

    showToast(
      'Student Enrolled',
      `${newStu.name} registered with ID ${newId} (Pass: PASS${idx}, PIN: 1234).`,
      'success'
    );
  };

  const handleOpsManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = ecosystem.students.find((s) => s.id === manualAdjForm.studentId);
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
    const nowStr = '2026-11-16 ' + new Date().toTimeString().slice(0, 5);
    const txnId = `TXN-ADJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn: WalletTransaction = {
      id: txnId,
      studentId: stu.id,
      type: manualAdjForm.type,
      category: 'Audited Adjustment',
      amount: rawAmt,
      previousBalance: prevBal,
      newBalance: nextBal,
      timestamp: nowStr,
      month: 'Nov 2026',
      status: 'Completed',
      method: `Operator: ${manualAdjForm.operator}`,
      relatedOrderId: null,
      note: `[AUDIT] ${manualAdjForm.reason.trim()}`,
      reconciled: true,
    };

    setEcosystem((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === stu.id ? { ...s, walletBalance: nextBal } : s)),
      transactions: [newTxn, ...prev.transactions],
      notifications: [
        {
          id: `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: stu.id,
          title: `Audited Wallet ${manualAdjForm.type}`,
          message: `₹${rawAmt} adjustment recorded by ${manualAdjForm.operator} (${manualAdjForm.reason}). New balance: ₹${nextBal}.`,
          time: 'Just now',
          type: 'alert',
          read: false,
        },
        ...prev.notifications,
      ],
    }));

    if (supabaseService.isAvailable()) {
      supabaseService.recordManualAdjustment({
        studentCode: stu.id,
        amountRupees: rawAmt,
        type: manualAdjForm.type,
        reason: manualAdjForm.reason.trim(),
        operator: manualAdjForm.operator,
      });
    }

    showToast('Adjustment Applied', `₹${rawAmt} ${manualAdjForm.type} recorded with immutable audit ID ${txnId}.`, 'success');
  };

  return {
    handleOpsUpdateOrderStatus,
    handleOpsUpdateStock,
    handleOpsCreateProduct,
    handleOpsToggleStudentStatus,
    handleOpsCreateStudent,
    handleOpsManualAdjustment,
  };
}
