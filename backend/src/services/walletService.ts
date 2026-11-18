/**
 * Wallet Top-Up, Funding & Ledger Management Service
 */

import { store, saveStore } from '../store/index.js';
import { verifyToken } from '../security/index.js';

export const walletService = {
  fundWallet(token: string | null, body: { amount_paise?: number; amount?: number; method?: string }) {
    const session = token ? verifyToken(token) : null;
    let targetStudentId = 'STU-101';

    if (session) {
      if (session.role === 'student') targetStudentId = session.entityId;
      else if (session.role === 'parent' && session.metadata?.linkedStudentId) {
        targetStudentId = session.metadata.linkedStudentId;
      }
    }

    const amountPaise = body.amount_paise || (body.amount ? body.amount * 100 : 0);
    if (amountPaise <= 0) return { status: 400, error: 'Amount must be greater than zero' };

    const wallet = store.wallets.get(targetStudentId);
    if (!wallet) return { status: 404, error: 'Wallet not found' };

    wallet.balance_paise += amountPaise;
    const ref = `FND-${Date.now().toString().slice(-6)}`;
    store.transactions.unshift({
      id: `TXN-${Date.now()}`,
      wallet_id: `WLT-${targetStudentId}`,
      student_id: targetStudentId,
      type: 'CREDIT',
      amount_paise: amountPaise,
      balance_after_paise: wallet.balance_paise,
      reference: ref,
      description: `Wallet top-up via ${body.method || 'Online Banking'}`,
      created_at: new Date().toISOString(),
    });

    saveStore(store);

    return {
      status: 200,
      data: {
        reference: ref,
        new_balance_paise: wallet.balance_paise,
        simulated: true,
      },
    };
  },

  updateSpendingControls(token: string | null, body: any) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'parent') {
      return { status: 403, error: 'Unauthorized: Parent access only' };
    }

    const studentId = session.metadata?.linkedStudentId || 'STU-101';
    const controls = store.spending_controls.get(studentId) || {
      daily_limit_paise: 50000,
      single_txn_limit_paise: 25000,
      allowed_categories: ['All'],
      card_locked: false,
    };

    if (body.daily_limit_paise !== undefined) controls.daily_limit_paise = body.daily_limit_paise;
    if (body.single_txn_limit_paise !== undefined) controls.single_txn_limit_paise = body.single_txn_limit_paise;
    if (body.allowed_categories !== undefined) controls.allowed_categories = body.allowed_categories;
    if (body.card_locked !== undefined) controls.card_locked = body.card_locked;

    store.spending_controls.set(studentId, controls);
    saveStore(store);

    return { status: 200, data: { success: true, controls } };
  },

  manualAdjust(token: string | null, body: { student_id?: string; type?: 'CREDIT' | 'DEBIT'; amount_paise?: number; reason?: string }) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return { status: 403, error: 'Unauthorized: Operations staff access only' };
    }

    const { student_id, type, amount_paise, reason } = body;
    if (!student_id || !type || !amount_paise) {
      return { status: 400, error: 'Missing required adjustment fields' };
    }

    const student = store.students.find((s) => s.id === student_id || s.student_code === student_id);
    if (!student) return { status: 404, error: 'Student not found' };

    const wallet = store.wallets.get(student.id);
    if (!wallet) return { status: 404, error: 'Wallet not found' };

    if (type === 'CREDIT') {
      wallet.balance_paise += amount_paise;
    } else if (type === 'DEBIT') {
      if (wallet.balance_paise < amount_paise) {
        return { status: 400, error: 'Insufficient funds for debit adjustment' };
      }
      wallet.balance_paise -= amount_paise;
    } else {
      return { status: 400, error: 'Invalid adjustment type' };
    }

    const ref = `ADJ-${Date.now().toString().slice(-6)}`;
    store.transactions.unshift({
      id: `TXN-${Date.now()}`,
      wallet_id: `WLT-${student.id}`,
      student_id: student.id,
      type,
      amount_paise,
      balance_after_paise: wallet.balance_paise,
      reference: ref,
      description: `Manual Adjustment: ${reason || 'Staff Adjustment'}`,
      created_at: new Date().toISOString(),
    });

    saveStore(store);

    return {
      status: 200,
      data: {
        success: true,
        reference: ref,
        new_balance_paise: wallet.balance_paise,
      },
    };
  },
};
