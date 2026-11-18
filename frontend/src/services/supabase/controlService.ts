/**
 * Supabase Spending Controls Service
 * Persists guardian daily, weekly, monthly budgets and category restrictions.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { SpendingControls } from '../../types/ecosystem';
import { notificationService } from './notificationService';

export const controlService = {
  /**
   * Update spending controls in Supabase and emit notification
   */
  async updateSpendingControls(studentCode: string, controls: SpendingControls): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('student_code', studentCode)
        .single();

      if (!student) return false;

      const { error } = await supabase
        .from('spending_controls')
        .upsert({
          student_id: student.id,
          daily_limit_paise: controls.dailyLimitEnabled ? controls.dailyLimit * 100 : null,
          weekly_limit_paise: controls.weeklyLimitEnabled ? controls.weeklyLimit * 100 : null,
          monthly_limit_paise: controls.monthlyLimitEnabled ? controls.monthlyLimit * 100 : null,
          restricted_categories: controls.restrictedCategories || [],
          low_balance_threshold_paise: controls.lowBalanceThreshold * 100,
          instant_txn_notification: controls.instantTxnNotification,
          spending_alerts_enabled: controls.spendingAlertsEnabled,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        notificationService.createNotification({
          studentCode,
          title: 'Spending Preferences Updated',
          message: `Guardian updated spending limits (Daily limit: ${
            controls.dailyLimitEnabled ? '₹' + controls.dailyLimit : 'Off'
          }).`,
          type: 'alert',
        });
      }

      return !error;
    } catch (err) {
      console.warn('updateSpendingControls error:', err);
      return false;
    }
  },
};
