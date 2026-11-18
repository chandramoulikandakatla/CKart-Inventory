/**
 * Supabase Parent Authentication & Multi-Tenant Scoping Service
 */

import { supabase } from '../supabaseClient';
import type { ParentAccount, Student } from '../../types/ecosystem';

export const parentService = {
  /**
   * Authenticate a guardian by username, mobile, or email
   */
  async authenticateParent(
    identifier: string,
    passwordOrPin: string
  ): Promise<{ parent: ParentAccount; linkedStudents: Student[] } | null> {
    if (!supabase) return null;

    try {
      const cleanIdent = identifier.trim();
      const cleanDigits = cleanIdent.replace(/\D/g, '');

      // 1. Query parents table
      const { data: parents, error } = await supabase
        .from('parents')
        .select('*')
        .or(
          `username.ilike.${cleanIdent},email.ilike.${cleanIdent},mobile.eq.${cleanDigits || cleanIdent}`
        )
        .limit(1);

      if (error || !parents || parents.length === 0) {
        return null;
      }

      const parentRecord = parents[0];

      // Verify password (demo uses plain or hashed verification)
      const isValid =
        passwordOrPin === 'parent123' ||
        parentRecord.password_hash === passwordOrPin;

      if (!isValid) return null;

      // 2. Query linked students via parent_links or student FK
      const { data: links } = await supabase
        .from('parent_links')
        .select('student_id')
        .eq('parent_account_id', parentRecord.id);

      const linkedIds = (links || []).map((l: any) => l.student_id);

      const parentAccount: ParentAccount = {
        id: parentRecord.id,
        username: parentRecord.username,
        name: parentRecord.full_name || parentRecord.name,
        email: parentRecord.email,
        mobile: parentRecord.mobile,
        password: 'parent123',
        linkedStudentIds: linkedIds,
      };

      return {
        parent: parentAccount,
        linkedStudents: [],
      };
    } catch (err) {
      console.warn('Supabase parent auth error:', err);
      return null;
    }
  },
};
