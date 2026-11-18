/**
 * Supabase Student & Account Management Service
 * Handles enrollment, identity, and status transitions.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Student } from '../../types/ecosystem';
import { INITIAL_STATE } from '../../constants/initialState';
import { DbStudent, extractRelation } from './types';

export const studentService = {
  /**
   * Fetch all registered students from Supabase with their wallets
   */
  async getStudents(): Promise<{ students: Student[]; dbStudents: DbStudent[] } | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: dbStudents, error } = await supabase
        .from('students')
        .select('*, wallets(*), spending_controls(*)');

      if (error || !dbStudents) return null;

      const mappedStudents: Student[] = INITIAL_STATE.students.map((seedStu) => {
        const found = dbStudents.find((s: DbStudent) => s.student_code === seedStu.id);
        const wObj = extractRelation(found?.wallets);
        const balancePaise = wObj ? Number(wObj.balance_paise || 0) : 0;
        const status = found?.account_status === 'inactive' ? 'Inactive' : 'Active';
        return {
          ...seedStu,
          status,
          walletBalance: Math.round(balancePaise / 100),
        };
      });

      return { students: mappedStudents, dbStudents };
    } catch (err) {
      console.warn('getStudents error:', err);
      return null;
    }
  },

  /**
   * Toggle student active status in Supabase
   */
  async updateStudentStatus(studentCode: string, nextStatus: 'Active' | 'Inactive'): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbStatus = nextStatus.toLowerCase();
      const { error } = await supabase
        .from('students')
        .update({ account_status: dbStatus })
        .eq('student_code', studentCode);

      return !error;
    } catch (err) {
      console.warn('updateStudentStatus error:', err);
      return false;
    }
  },

  /**
   * Enroll a new student into Supabase with initial wallet & default controls
   */
  async enrollStudent(student: Student, initialBalanceRupees: number): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      // 1. Get college ID
      const { data: college } = await supabase.from('colleges').select('id').limit(1).single();
      const collegeId = college?.id || 'c0000000-0000-0000-0000-000000000001';

      // 2. Insert student
      const { data: newStu, error: sErr } = await supabase
        .from('students')
        .insert({
          college_id: collegeId,
          student_code: student.id,
          first_name: student.firstName,
          last_name: student.name.split(' ').slice(1).join(' ') || 'Student',
          academic_year: student.academicYear,
          account_status: 'active',
        })
        .select('id')
        .single();

      if (sErr || !newStu) {
        console.warn('enrollStudent student insert error:', sErr);
        return false;
      }

      // 3. Create initial wallet
      const balancePaise = Math.round(initialBalanceRupees * 100);
      await supabase.from('wallets').insert({
        student_id: newStu.id,
        balance_paise: balancePaise,
        status: 'active',
      });

      // 4. Create default spending controls
      await supabase.from('spending_controls').insert({
        student_id: newStu.id,
        daily_limit_paise: 50000,
        weekly_limit_paise: 200000,
        monthly_limit_paise: 500000,
        restricted_categories: [],
        low_balance_threshold_paise: 15000,
      });

      return true;
    } catch (err) {
      console.warn('enrollStudent error:', err);
      return false;
    }
  },
};
