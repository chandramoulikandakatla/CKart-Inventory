/**
 * Derived Calculations, Analytics & Metrics Hook
 */

import { useMemo } from 'react';
import { INITIAL_STATE } from '../../constants/initialState';
import type {
  EcosystemState,
  PopulatedCartItem,
  WalletTransaction,
  LedgerMetrics,
} from '../../types/ecosystem';

export function useDerivedMetrics(
  ecosystem: EcosystemState,
  loggedStudentId: string,
  linkedStudentId: string,
  cart: Array<{ productId: string; qty: number }>
) {
  const currentStudent = useMemo(() => {
    return ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  }, [ecosystem.students, loggedStudentId]);

  const parentLinkedStudent = useMemo(() => {
    return ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  }, [ecosystem.students, linkedStudentId]);

  const populatedCart: PopulatedCartItem[] = useMemo(() => {
    return cart
      .map((item) => {
        const product = ecosystem.products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          ...product,
          qty: item.qty,
          subtotal: product.price * item.qty,
        };
      })
      .filter(Boolean) as PopulatedCartItem[];
  }, [cart, ecosystem.products]);

  const cartItemCount = useMemo(() => populatedCart.reduce((acc, i) => acc + i.qty, 0), [populatedCart]);
  const cartSubtotal = useMemo(() => populatedCart.reduce((acc, i) => acc + i.subtotal, 0), [populatedCart]);
  const platformFee = 0;
  const cartFinalPayable = cartSubtotal + platformFee;

  const studentOrders = useMemo(() => {
    return ecosystem.orders.filter((o) => o.studentId === currentStudent.id);
  }, [ecosystem.orders, currentStudent.id]);

  const studentTransactions = useMemo(() => {
    return ecosystem.transactions.filter((t) => t.studentId === currentStudent.id);
  }, [ecosystem.transactions, currentStudent.id]);

  const parentOrders = useMemo(() => {
    return ecosystem.orders.filter((o) => o.studentId === parentLinkedStudent.id);
  }, [ecosystem.orders, parentLinkedStudent.id]);

  const parentTransactions = useMemo(() => {
    return ecosystem.transactions.filter((t) => t.studentId === parentLinkedStudent.id);
  }, [ecosystem.transactions, parentLinkedStudent.id]);

  const parentControls = useMemo(() => {
    return ecosystem.spendingControls[parentLinkedStudent.id] || INITIAL_STATE.spendingControls['CK-2026-101'];
  }, [ecosystem.spendingControls, parentLinkedStudent.id]);

  const studentControls = useMemo(() => {
    return ecosystem.spendingControls[currentStudent.id] || INITIAL_STATE.spendingControls['CK-2026-101'];
  }, [ecosystem.spendingControls, currentStudent.id]);

  const calcLedgerMetrics = (txns: WalletTransaction[]): LedgerMetrics => {
    let totalAdded = 0;
    let totalSpent = 0;
    let totalRefunds = 0;
    let purchaseCount = 0;
    txns.forEach((t) => {
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
      avgPurchase: purchaseCount > 0 ? Math.round(totalSpent / purchaseCount) : 0,
    };
  };

  const studentMetrics = useMemo(() => calcLedgerMetrics(studentTransactions), [studentTransactions]);
  const parentMetrics = useMemo(() => calcLedgerMetrics(parentTransactions), [parentTransactions]);

  const studentTodaySpend = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return studentTransactions
      .filter((t) => t.type === 'Student Purchase' && (t.timestamp.startsWith(today) || t.timestamp.startsWith('2026-11-16')))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [studentTransactions]);

  const parentCategoryChartData = useMemo(() => {
    const map: Record<string, number> = {
      'Food and Snacks': 0,
      Beverages: 0,
      'Personal Care': 0,
      'Daily Essentials': 0,
      'Academic Supplies': 0,
      'Other Services': 0,
    };
    parentOrders.forEach((ord) => {
      if (ord.status === 'Cancelled') return;
      ord.items.forEach((it) => {
        const cat = it.category || 'Daily Essentials';
        map[cat] = (map[cat] || 0) + it.subtotal;
      });
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
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
      'Nov 2026': { month: 'Nov 2026', funded: 0, spent: 0 },
    };
    parentTransactions.forEach((t: any) => {
      const m = t.month || 'Nov 2026';
      if (!base[m]) base[m] = { month: m, funded: 0, spent: 0 };
      if (t.type === 'Wallet Funding') base[m].funded += t.amount;
      if (t.type === 'Student Purchase') base[m].spent += Math.abs(t.amount);
    });
    return months.map((m) => base[m]);
  }, [parentTransactions]);

  const parentDailyTrendData = useMemo(() => {
    const days = [
      { day: 'Nov 10', amount: 0, funded: 0 },
      { day: 'Nov 12', amount: 0, funded: 0 },
      { day: 'Nov 14', amount: 0, funded: 0 },
      { day: 'Nov 15', amount: 0, funded: 0 },
      { day: 'Nov 16', amount: 0, funded: 0 },
    ];
    parentTransactions.forEach((t) => {
      const datePrefix = t.timestamp.slice(5, 10);
      const mapDay: Record<string, string> = {
        '11-10': 'Nov 10',
        '11-12': 'Nov 12',
        '11-14': 'Nov 14',
        '11-15': 'Nov 15',
        '11-16': 'Nov 16',
      };
      const label = mapDay[datePrefix];
      if (label) {
        const entry = days.find((d) => d.day === label);
        if (entry) {
          if (t.type === 'Student Purchase') entry.amount += Math.abs(t.amount);
          if (t.type === 'Wallet Funding') entry.funded += t.amount;
        }
      }
    });
    return days;
  }, [parentTransactions]);

  return {
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
  };
}
