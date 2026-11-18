/**
 * Authentication and Multi-Portal Authorization Service
 */

import crypto from 'node:crypto';
import { store } from '../store/index.js';
import { verifySecret, generateToken, verifyToken, preAuthTokens } from '../security/index.js';

export const authService = {
  studentLoginStep1(body: { student_code?: string; password?: string }) {
    const { student_code, password } = body;
    const student = store.students.find((s) => s.student_code === student_code);
    if (!student || !password || !verifySecret(password, student.password_hash)) {
      return { status: 401, error: 'Invalid student credentials' };
    }

    if (student.account_status !== 'active') {
      return { status: 403, error: `Account is ${student.account_status}. Please contact campus admin.` };
    }

    const college = store.colleges.find((c) => c.id === student.college_id);
    const preAuthToken = crypto.randomBytes(24).toString('hex');
    preAuthTokens.set(preAuthToken, { studentId: student.id, expiresAt: Date.now() + 300000 });

    return {
      status: 200,
      data: {
        pre_auth_token: preAuthToken,
        student_preview: {
          student_code: student.student_code,
          first_name: student.first_name,
          last_name: student.last_name,
          academic_year: student.academic_year,
          college_name: college?.name || 'Sri Chaitanya Academy',
        },
      },
    };
  },

  studentVerifyPin(body: { pre_auth_token?: string; pin?: string }) {
    const { pre_auth_token, pin } = body;
    if (!pre_auth_token || !pin) {
      return { status: 400, error: 'Missing token or PIN' };
    }

    const preAuth = preAuthTokens.get(pre_auth_token);
    if (!preAuth || Date.now() > preAuth.expiresAt) {
      return { status: 401, error: 'Pre-auth token expired or invalid' };
    }

    const student = store.students.find((s) => s.id === preAuth.studentId);
    if (!student || !verifySecret(pin, student.pin_hash)) {
      return { status: 401, error: 'Incorrect 4-digit PIN' };
    }

    preAuthTokens.delete(pre_auth_token);
    const sessionToken = generateToken('student', student.id, { student_code: student.student_code });
    return { status: 200, data: { session_token: sessionToken } };
  },

  parentLogin(body: { mobile?: string; password?: string }) {
    const { mobile, password } = body;
    const parent = store.parents.find((p) => p.mobile === mobile);
    if (!parent || !password || !verifySecret(password, parent.password_hash)) {
      return { status: 401, error: 'Invalid parent mobile or password' };
    }

    const linkedStudent = store.students.find((s) => s.parent_account_id === parent.id);
    const sessionToken = generateToken('parent', parent.id, { linkedStudentId: linkedStudent?.id });
    return {
      status: 200,
      data: {
        session_token: sessionToken,
        linked_student: linkedStudent
          ? { id: linkedStudent.student_code, name: `${linkedStudent.first_name} ${linkedStudent.last_name}` }
          : null,
      },
    };
  },

  opsLogin(body: { username?: string; password?: string }) {
    const { username, password } = body;
    const staff = store.staff.find((s) => s.username === username && s.role === 'ops');
    if (!staff || !password || !verifySecret(password, staff.password_hash)) {
      return { status: 401, error: 'Invalid operations credentials' };
    }

    const sessionToken = generateToken('ops', staff.id, { college_id: staff.college_id });
    return { status: 200, data: { session_token: sessionToken } };
  },

  collegeLogin(body: { username?: string; password?: string }) {
    const { username, password } = body;
    const staff = store.staff.find((s) => s.username === username && s.role === 'college');
    if (!staff || !password || !verifySecret(password, staff.password_hash)) {
      return { status: 401, error: 'Invalid college authority credentials' };
    }

    const sessionToken = generateToken('college', staff.id, { college_id: staff.college_id });
    return { status: 200, data: { session_token: sessionToken } };
  },

  getStudentDashboard(token: string | null) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'student') {
      return { status: 403, error: 'Unauthorized: Student access only' };
    }

    const student = store.students.find((s) => s.id === session.entityId);
    if (!student) return { status: 404, error: 'Student not found' };

    const wallet = store.wallets.get(student.id) || { student_id: student.id, balance_paise: 0, status: 'active' };
    const orders = store.orders.filter((o) => o.student_id === student.id);
    const transactions = store.transactions.filter((t) => t.student_id === student.id);
    const controls = store.spending_controls.get(student.id) || {
      daily_limit_paise: 50000,
      single_txn_limit_paise: 25000,
      allowed_categories: ['All'],
      card_locked: false,
    };
    const notifications = store.notifications.filter((n) => n.student_id === student.id);

    return {
      status: 200,
      data: {
        student: {
          student_code: student.student_code,
          first_name: student.first_name,
          last_name: student.last_name,
          academic_year: student.academic_year,
        },
        wallet: {
          balance_paise: wallet.balance_paise,
          balance_inr: Math.round(wallet.balance_paise / 100),
          status: wallet.status,
        },
        controls: {
          daily_limit_paise: controls.daily_limit_paise,
          single_txn_limit_paise: controls.single_txn_limit_paise,
          allowed_categories: controls.allowed_categories,
          card_locked: controls.card_locked,
        },
        recent_orders: orders.slice(0, 5),
        transactions: transactions.slice(0, 10),
        notifications,
      },
    };
  },

  getParentDashboard(token: string | null) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'parent') {
      return { status: 403, error: 'Unauthorized: Parent access only' };
    }

    const studentId = session.metadata?.linkedStudentId || 'STU-101';
    const student = store.students.find((s) => s.id === studentId);
    const wallet = store.wallets.get(studentId) || { student_id: studentId, balance_paise: 0, status: 'active' };
    const orders = store.orders.filter((o) => o.student_id === studentId);
    const transactions = store.transactions.filter((t) => t.student_id === studentId);
    const controls = store.spending_controls.get(studentId);

    return {
      status: 200,
      data: {
        student: student
          ? {
              id: student.student_code,
              name: `${student.first_name} ${student.last_name}`,
              academic_year: student.academic_year,
            }
          : null,
        wallet_balance_paise: wallet.balance_paise,
        controls,
        orders,
        transactions,
      },
    };
  },

  getCollegeDashboard(token: string | null) {
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'college') {
      return { status: 403, error: 'Unauthorized: College authority access only' };
    }

    const totalOrders = store.orders.length;
    const totalVolumePaise = store.orders.reduce((sum, o) => sum + o.total_amount_paise, 0);

    return {
      status: 200,
      data: {
        kpis: {
          total_orders: totalOrders,
          total_gross_paise: totalVolumePaise,
          active_students: store.students.length,
        },
        colleges: store.colleges,
      },
    };
  },
};
