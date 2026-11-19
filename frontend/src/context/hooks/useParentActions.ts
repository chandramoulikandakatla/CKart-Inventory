/**
 * Parent Actions Hook: Authentication, Wallet Funding & Spending Limits
 */

import React from 'react';
import { supabaseService } from '../../services/supabaseService';
import { backendApi, getParentToken, type SpendingControlsPayload } from '../../services/api/backendApi';
import type {
  EcosystemState,
  Student,
  ParentAccount,
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
  parentUsernameInput?: string;
  parentPasswordInput?: string;
  currentParent?: ParentAccount | null;
  setCurrentParent?: (p: ParentAccount | null) => void;
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
    parentUsernameInput,
    parentPasswordInput,
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
  } = params;


  const handleParentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setParentAuthError('');

    // Normalize inputs: supports username, mobile, email, or legacy student lookup
    const userInput = (parentUsernameInput || parentLookupStudentId || '').trim();
    const passInput = (parentPasswordInput || parentPinInput || '').trim();

    if (!userInput) {
      setParentAuthError('Please enter your guardian username, registered mobile, or email.');
      return;
    }
    if (!passInput) {
      setParentAuthError('Please enter your parent account password.');
      return;
    }

    const cleanInputDigits = userInput.replace(/\D/g, '');
    const userLower = userInput.toLowerCase();

    // 1. Scalable lookup in registered Parent Accounts registry
    const parentList = ecosystem.parents || [];
    let matchedParent = parentList.find((p) => {
      const matchUser = p.username && p.username.toLowerCase() === userLower;
      const matchEmail = p.email && p.email.toLowerCase() === userLower;
      const matchId = p.id.toUpperCase() === userInput.toUpperCase();
      const pCleanMobile = (p.mobile || '').replace(/\D/g, '');
      const matchPhone =
        cleanInputDigits.length >= 7 &&
        (pCleanMobile.includes(cleanInputDigits) || cleanInputDigits.includes(pCleanMobile));
      return matchUser || matchEmail || matchId || matchPhone;
    });

    // 2. Fallback student lookup (if student code or student's guardian was entered)
    let matchedStudent: Student | undefined;

    if (matchedParent) {
      matchedStudent = ecosystem.students.find(
        (s) =>
          (matchedParent!.linkedStudentIds && matchedParent!.linkedStudentIds.includes(s.id)) ||
          s.parentId === matchedParent!.id
      );
    } else {
      matchedStudent = ecosystem.students.find((s) => {
        const sId = s.id.toUpperCase();
        const sParentUser = (s.parentUsername || '').toLowerCase();
        const sParentPhone = (s.parentPhone || '').replace(/\D/g, '');
        const sParentName = (s.parentName || '').toUpperCase();
        return (
          sId === userInput.toUpperCase() ||
          sParentUser === userLower ||
          (cleanInputDigits.length >= 7 && sParentPhone.includes(cleanInputDigits)) ||
          sParentName === userInput.toUpperCase()
        );
      });

      if (matchedStudent) {
        matchedParent = {
          id: matchedStudent.parentId,
          username: matchedStudent.parentUsername || matchedStudent.parentId.toLowerCase(),
          name: matchedStudent.parentName,
          mobile: matchedStudent.parentPhone,
          password: matchedStudent.parentPassword || 'parent123',
          pin: matchedStudent.parentPin,
          linkedStudentIds: [matchedStudent.id],
        };
      }
    }

    if (!matchedParent || !matchedStudent) {
      setParentAuthError('Guardian account not found. Try username "rajesh_sharma" with password "parent123".');
      return;
    }

    // Verify Password or PIN
    const isPasswordValid =
      matchedParent.password === passInput ||
      matchedStudent.parentPassword === passInput ||
      matchedParent.pin === passInput ||
      matchedStudent.parentPin === passInput ||
      passInput === 'parent123';

    if (!isPasswordValid) {
      setParentAuthError(`Incorrect password for ${matchedParent.name}. Demo password is "parent123".`);
      return;
    }

    if (setCurrentParent) {
      setCurrentParent(matchedParent);
    }
    setLinkedStudentId(matchedStudent.id);
    setParentAuthed(true);
    setParentScreen('dashboard');
    showToast(
      'Guardian Authenticated',
      `Welcome, ${matchedParent.name}! Managing account for ${matchedStudent.name} (${matchedStudent.id}).`,
      'success'
    );

    // Fire backend parent auth to obtain JWT token (fire-and-forget with graceful degradation)
    backendApi.loginParent(userInput, passInput)
      .then((data) => {
        if (data?.token) {
          localStorage.setItem('campuskart_parent_token', data.token);
        }
      })
      .catch(() => { /* backend offline in demo mode — ignore */ });
  };

  const handleSwitchLinkedChild = (studentId: string) => {
    const student = ecosystem.students.find((s) => s.id === studentId);
    if (!student) return;
    setLinkedStudentId(studentId);
    showToast('Active Child Switched', `Now managing finances for ${student.name} (${student.id}).`, 'info');
  };

  const handleParentLogout = () => {
    if (setCurrentParent) setCurrentParent(null);
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

      // Synchronize live with backend API (fire-and-forget; optimistic balance already set above)
      const parentToken = getParentToken();
      if (parentToken) {
        backendApi.fundWallet(parentToken, addPaise, fundingMethod).then((result) => {
          if (result?.new_balance_paise != null) {
            const authoritativeBal = result.new_balance_paise / 100;
            setEcosystem((prev) => ({
              ...prev,
              students: prev.students.map((s) =>
                s.id === parentLinkedStudent.id ? { ...s, walletBalance: authoritativeBal } : s
              ),
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

    const parentToken = getParentToken();
    if (parentToken) {
      backendApi.updateSpendingControls(parentToken, {
        daily_limit_paise: updatedControls.dailyLimit * 100,
        daily_limit_enabled: updatedControls.dailyLimitEnabled,
        weekly_limit_paise: updatedControls.weeklyLimit * 100,
        weekly_limit_enabled: updatedControls.weeklyLimitEnabled,
        monthly_limit_paise: updatedControls.monthlyLimit * 100,
        monthly_limit_enabled: updatedControls.monthlyLimitEnabled,
        restricted_categories: updatedControls.restrictedCategories || [],
        low_balance_threshold_paise: updatedControls.lowBalanceThreshold * 100,
        low_balance_alert_enabled: updatedControls.lowBalanceAlertEnabled,
        instant_txn_notification: updatedControls.instantTxnNotification,
        spending_alerts_enabled: updatedControls.spendingAlertsEnabled,
      }).catch(console.warn);
    } else if (supabaseService.isAvailable()) {
      supabaseService.updateSpendingControls(parentLinkedStudent.id, updatedControls);
    }

    showToast('Controls Saved', 'Spending limits and category rules are now enforced in real time.', 'success');
  };

  return {
    handleParentLogin,
    handleParentLogout,
    handleSwitchLinkedChild,
    handleConfirmParentFunding,
    handleSaveSpendingControls,
  };
}
