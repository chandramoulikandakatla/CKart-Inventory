/**
 * Parent Actions Hook: Authentication, Wallet Funding & Spending Limits
 */

import React from 'react';
import { supabaseService } from '../../services/supabaseService';
import type {
  EcosystemState,
  Student,
  FundingReceipt,
  SpendingControls,
  WalletTransaction,
  Notification,
  ParentScreen,
} from '../../types/ecosystem';

interface ParentActionParams {
  ecosystem: EcosystemState;
  setEcosystem: React.Dispatch<React.SetStateAction<EcosystemState>>;
  parentLinkedStudent: Student;
  parentLookupStudentId: string;
  parentPinInput: string;
  setParentAuthError: (err: string) => void;
  setLinkedStudentId: (id: string) => void;
  setParentAuthed: (authed: boolean) => void;
  setParentScreen: (screen: ParentScreen | string) => void;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | string) => void;
  fundAmount: number;
  fundingMethod: string;
  setParentPayStep: (step: number) => void;
  setLastFundingReceipt: (receipt: FundingReceipt | null) => void;
}

export function useParentActions(params: ParentActionParams) {
  const {
    ecosystem,
    setEcosystem,
    parentLinkedStudent,
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
  } = params;

  const handleParentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setParentAuthError('');
    const query = parentLookupStudentId.trim().toUpperCase();
    const cleanPhone = parentLookupStudentId.replace(/\D/g, '');

    const student = ecosystem.students.find((s) => {
      const sId = s.id.toUpperCase();
      const sParentPhone = (s.parentPhone || '').replace(/\D/g, '');
      const sParentName = (s.parentName || '').toUpperCase();
      const sName = s.name.toUpperCase();
      return (
        sId === query ||
        (cleanPhone.length >= 5 && sParentPhone.includes(cleanPhone)) ||
        sParentName.includes(query) ||
        sName.includes(query)
      );
    });

    if (!student) {
      setParentAuthError('Student or Guardian record not found. Valid IDs: CK-2026-101, CK-2026-102, or CK-2026-103.');
      return;
    }
    if (student.parentPin !== parentPinInput.trim()) {
      setParentAuthError(`Invalid Parent PIN for ${student.parentName} (${student.name}'s Guardian). Demo PIN is ${student.parentPin}.`);
      return;
    }

    setLinkedStudentId(student.id);
    setParentAuthed(true);
    setParentScreen('dashboard');
    showToast('Parent Portal Unlocked', `Verified Guardian: ${student.parentName} linked strictly to ${student.name} (${student.id})`, 'success');
  };

  const handleParentLogout = () => {
    setParentAuthed(false);
    setParentScreen('login');
    showToast('Parent Logged Out', 'Guardian session terminated safely.', 'info');
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
      const now = new Date();
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const txnId = `TXN-CK-${Math.floor(90100 + Math.random() * 899)}`;
      const prevBalPaise = Math.round(parentLinkedStudent.walletBalance * 100);
      const addPaise = Math.round(amt * 100);
      const newBalPaise = prevBalPaise + addPaise;
      const prevBal = prevBalPaise / 100;
      const newBal = newBalPaise / 100;

      const newTxn: WalletTransaction = {
        id: txnId,
        studentId: parentLinkedStudent.id,
        type: 'Wallet Funding',
        category: 'Parent Top-Up',
        amount: amt,
        previousBalance: prevBal,
        newBalance: newBal,
        timestamp: nowStr,
        month: 'Nov 2026',
        status: 'Completed',
        method: `${fundingMethod} (Simulated)`,
        relatedOrderId: null,
        note: `Parent wallet top-up by ${parentLinkedStudent.parentName}`,
        reconciled: true,
      };

      const newNotif: Notification = {
        id: `NOTIF-${Date.now()}`,
        target: 'both',
        studentId: parentLinkedStudent.id,
        title: 'Wallet Funded Successfully',
        message: `₹${amt} added to ${parentLinkedStudent.name}'s wallet via ${fundingMethod}. New balance: ₹${newBal}.`,
        time: 'Just now',
        type: 'funding',
        read: false,
      };

      setEcosystem((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === parentLinkedStudent.id ? { ...s, walletBalance: newBal } : s)),
        transactions: [newTxn, ...prev.transactions],
        notifications: [newNotif, ...prev.notifications],
      }));

      // Synchronize live with Supabase
      if (supabaseService.isAvailable()) {
        supabaseService.topUpWallet(parentLinkedStudent.id, amt, fundingMethod).then((dbBal) => {
          if (dbBal !== null) {
            setEcosystem((prev) => ({
              ...prev,
              students: prev.students.map((s) => (s.id === parentLinkedStudent.id ? { ...s, walletBalance: dbBal } : s)),
            }));
          }
        });
      }

      setLastFundingReceipt({
        txnId,
        studentName: parentLinkedStudent.name,
        studentId: parentLinkedStudent.id,
        amount: amt,
        method: fundingMethod,
        timestamp: nowStr,
        previousBalance: prevBal,
        newBalance: newBal,
      });

      setParentScreen('funding_success');
    }, 5000);
  };

  const handleSaveSpendingControls = (updatedControls: SpendingControls) => {
    setEcosystem((prev) => ({
      ...prev,
      spendingControls: {
        ...prev.spendingControls,
        [parentLinkedStudent.id]: updatedControls,
      },
      notifications: [
        {
          id: `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: parentLinkedStudent.id,
          title: 'Spending Preferences Updated',
          message: `Parent updated spending controls (Daily limit: ${
            updatedControls.dailyLimitEnabled ? '₹' + updatedControls.dailyLimit : 'Off'
          }).`,
          time: 'Just now',
          type: 'alert',
          read: false,
        },
        ...prev.notifications,
      ],
    }));

    if (supabaseService.isAvailable()) {
      supabaseService.updateSpendingControls(parentLinkedStudent.id, updatedControls);
    }

    showToast('Controls Saved', 'Spending limits and category rules are now enforced in real time.', 'success');
  };

  return {
    handleParentLogin,
    handleParentLogout,
    handleConfirmParentFunding,
    handleSaveSpendingControls,
  };
}
