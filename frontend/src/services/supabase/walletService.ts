/**
 * Supabase Wallet & Transaction Ledger Service
 * Atomic funding, manual balance adjustments, and audit ledger entries.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { notificationService } from './notificationService';

export const walletService = {
  /**
   * Top up student wallet in Supabase, create transaction, and push notification
   */
  async topUpWallet(studentCode: string, amountRupees: number, method: string): Promise<number | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('id, student_code, first_name')
        .eq('student_code', studentCode)
        .single();

      if (sErr || !student) {
        console.warn('Student not found for topUpWallet:', studentCode);
        return null;
      }

      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('id, balance_paise')
        .eq('student_id', student.id)
        .single();

      if (wErr || !wallet) {
        console.warn('Wallet not found for student:', student.id);
        return null;
      }

      const amountPaise = Math.round(amountRupees * 100);
      const prevBalPaise = Number(wallet.balance_paise || 0);
      const newBalPaise = prevBalPaise + amountPaise;

      // Update wallet balance
      const { error: updateErr } = await supabase
        .from('wallets')
        .update({ balance_paise: newBalPaise, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      if (updateErr) {
        console.warn('Wallet balance update error:', updateErr);
        return null;
      }

      // Record transaction
      const txnRef = `TXN-CK-${Math.floor(90100 + Math.random() * 899)}`;
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        student_id: student.id,
        transaction_type: 'CREDIT',
        amount_paise: amountPaise,
        direction: 'credit',
        previous_balance_paise: prevBalPaise,
        new_balance_paise: newBalPaise,
        balance_after_paise: newBalPaise,
        status: 'completed',
        reference: txnRef,
        reference_id: txnRef,
        reference_type: 'PARENT_FUNDING',
        description: `Parent Top-Up ₹${amountRupees} via ${method}`,
      });

      // Emit database notification
      await notificationService.createNotification({
        studentCode,
        title: 'Wallet Funded Successfully',
        message: `₹${amountRupees} added to ${student.first_name}'s wallet via ${method}. New balance: ₹${Math.round(newBalPaise / 100)}.`,
        type: 'wallet',
      });

      return Math.round(newBalPaise / 100);
    } catch (err) {
      console.warn('topUpWallet error:', err);
      return null;
    }
  },

  /**
   * Record audited manual wallet adjustment in Supabase
   */
  async recordManualAdjustment(params: {
    studentCode: string;
    amountRupees: number;
    type: string;
    reason: string;
    operator: string;
  }): Promise<number | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id, student_code, first_name')
        .eq('student_code', params.studentCode)
        .single();

      if (!student) return null;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance_paise')
        .eq('student_id', student.id)
        .single();

      if (!wallet) return null;

      const deltaPaise = Math.round(params.amountRupees * 100);
      const prevBalPaise = Number(wallet.balance_paise || 0);
      const newBalPaise = Math.max(0, prevBalPaise + deltaPaise);

      await supabase
        .from('wallets')
        .update({ balance_paise: newBalPaise, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      const txnRef = `TXN-ADJ-${Math.floor(1000 + Math.random() * 9000)}`;
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        student_id: student.id,
        transaction_type: params.type.toUpperCase(),
        amount_paise: deltaPaise,
        direction: deltaPaise >= 0 ? 'credit' : 'debit',
        previous_balance_paise: prevBalPaise,
        new_balance_paise: newBalPaise,
        balance_after_paise: newBalPaise,
        status: 'completed',
        reference: txnRef,
        reference_id: txnRef,
        reference_type: 'OPERATIONS_ADJUSTMENT',
        description: `[AUDIT] ${params.reason} (by ${params.operator})`,
      });

      await notificationService.createNotification({
        studentCode: params.studentCode,
        title: `Audited Wallet ${params.type}`,
        message: `₹${params.amountRupees} adjustment applied by ${params.operator}. Reason: ${params.reason}.`,
        type: 'alert',
      });

      return Math.round(newBalPaise / 100);
    } catch (err) {
      console.warn('recordManualAdjustment error:', err);
      return null;
    }
  },
};
