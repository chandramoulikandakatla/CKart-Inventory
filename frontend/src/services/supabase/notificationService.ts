/**
 * Supabase Notification Service
 * Manages persistent database-backed notifications for students and guardians.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Notification } from '../../types/ecosystem';
import { DbStudent, DbNotification, mapNotificationType, mapDbNotificationToClient } from './types';

export const notificationService = {
  /**
   * Fetch all notifications from Supabase
   */
  async fetchNotifications(dbStudents?: DbStudent[]): Promise<Notification[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return [];

      let students: Array<{ id: string; student_code: string }> | undefined = dbStudents;
      if (!students) {
        const { data: stuData } = await supabase.from('students').select('id, student_code');
        students = (stuData as Array<{ id: string; student_code: string }>) || [];
      }

      return data.map((n: DbNotification) => {
        const stu = students?.find((s) => s.id === n.student_id);
        const studentCode = stu?.student_code || 'CK-2026-101';
        return mapDbNotificationToClient(n, studentCode);
      });
    } catch (err) {
      console.warn('fetchNotifications error:', err);
      return [];
    }
  },

  /**
   * Create persistent notification in Supabase
   */
  async createNotification(params: {
    studentCode: string;
    title: string;
    message: string;
    type: string;
  }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('student_code', params.studentCode)
        .single();

      if (!student) return false;

      const dbType = mapNotificationType(params.type);
      const { error } = await supabase.from('notifications').insert({
        student_id: student.id,
        title: params.title,
        message: params.message,
        type: dbType,
        is_read: false,
      });

      return !error;
    } catch (err) {
      console.warn('createNotification error:', err);
      return false;
    }
  },
};
