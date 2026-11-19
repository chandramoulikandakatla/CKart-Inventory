/**
 * CampusKart Backend API Wrapper
 * All mutations (wallet top-up, checkout, spending controls, manual adjustment)
 * go through the backend at VITE_API_URL. Never calls Supabase directly.
 */

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL as string) || 'http://127.0.0.1:8080';

function getHeaders(token?: string | null): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Payload & Response Types ──────────────────────────────────────────────

export interface CheckoutItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutParams {
  items: CheckoutItem[];
  fulfilment_method: string;
  collection_point: string;
  idempotency_key: string;
  simulate_failure?: boolean;
}

export interface SpendingControlsPayload {
  daily_limit_paise: number;
  daily_limit_enabled: boolean;
  weekly_limit_paise: number;
  weekly_limit_enabled: boolean;
  monthly_limit_paise: number;
  monthly_limit_enabled: boolean;
  restricted_categories: string[];
  low_balance_threshold_paise: number;
  low_balance_alert_enabled: boolean;
  instant_txn_notification: boolean;
  spending_alerts_enabled: boolean;
}

export interface AdjustParams {
  student_id: string;
  type: string;
  amount_paise: number;
  reason: string;
  operator?: string;
}

export interface FundWalletResult {
  new_balance_paise: number;
  reference: string;
}

export interface CheckoutResult {
  order_id: string;
  reference: string;
  new_balance_paise: number;
}

export interface AdjustResult {
  new_balance_paise: number;
}

// ─── Token Helpers ─────────────────────────────────────────────────────────

export function getStudentToken(): string | null {
  try {
    return (
      localStorage.getItem('campuskart_student_token') ||
      localStorage.getItem('campuskart_session_token') ||
      null
    );
  } catch {
    return null;
  }
}

export function setStudentToken(token: string): void {
  try {
    localStorage.setItem('campuskart_student_token', token);
  } catch {
    // ignore
  }
}

export function getParentToken(): string | null {
  try {
    return (
      localStorage.getItem('campuskart_parent_token') ||
      localStorage.getItem('campuskart_session_token') ||
      null
    );
  } catch {
    return null;
  }
}

export function setParentToken(token: string): void {
  try {
    localStorage.setItem('campuskart_parent_token', token);
  } catch {
    // ignore
  }
}

export function getOpsToken(): string | null {
  try {
    return (
      localStorage.getItem('campuskart_ops_token') ||
      localStorage.getItem('campuskart_session_token') ||
      null
    );
  } catch {
    return null;
  }
}

export function setOpsToken(token: string): void {
  try {
    localStorage.setItem('campuskart_ops_token', token);
  } catch {
    // ignore
  }
}

// ─── Backend API Object ────────────────────────────────────────────────────

export const backendApi = {
  /**
   * POST /api/parent/fund — top up a student's wallet (parent JWT required)
   */
  async fundWallet(
    token: string,
    amountPaise: number,
    method: string
  ): Promise<FundWalletResult | null> {
    try {
      const res = await fetch(`${API_BASE}/api/parent/fund`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ amount_paise: amountPaise, method }),
      });
      if (!res.ok) {
        console.warn('[backendApi.fundWallet] non-ok response:', res.status);
        return null;
      }
      const data = await res.json();
      return data as FundWalletResult;
    } catch (err) {
      console.warn('[backendApi.fundWallet] error:', err);
      return null;
    }
  },

  /**
   * POST /api/checkout — place an order (student JWT required)
   */
  async checkout(
    token: string,
    params: CheckoutParams
  ): Promise<CheckoutResult | null> {
    try {
      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        console.warn('[backendApi.checkout] non-ok response:', res.status);
        return null;
      }
      const data = await res.json();
      return {
        order_id: data.order_id,
        reference: data.reference,
        new_balance_paise: data.new_balance_paise,
      } as CheckoutResult;
    } catch (err) {
      console.warn('[backendApi.checkout] error:', err);
      return null;
    }
  },

  /**
   * POST /api/parent/spending-controls — save spending controls (parent JWT required)
   */
  async updateSpendingControls(
    token: string,
    controls: SpendingControlsPayload
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/parent/spending-controls`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(controls),
      });
      if (!res.ok) {
        console.warn('[backendApi.updateSpendingControls] non-ok response:', res.status);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[backendApi.updateSpendingControls] error:', err);
      return false;
    }
  },

  /**
   * POST /api/ops/wallet/adjust — manual wallet adjustment (ops JWT required)
   */
  async manualAdjust(
    token: string,
    params: AdjustParams
  ): Promise<AdjustResult | null> {
    try {
      const res = await fetch(`${API_BASE}/api/ops/wallet/adjust`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        console.warn('[backendApi.manualAdjust] non-ok response:', res.status);
        return null;
      }
      const data = await res.json();
      return data as AdjustResult;
    } catch (err) {
      console.warn('[backendApi.manualAdjust] error:', err);
      return null;
    }
  },

  /**
   * POST /api/parent/auth/login — authenticate parent and get JWT
   */
  async loginParent(
    username: string,
    password: string
  ): Promise<{ token: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/parent/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data as { token: string };
    } catch (err) {
      console.warn('[backendApi.loginParent] error:', err);
      return null;
    }
  },

  /**
   * POST /api/ops/auth/login — authenticate ops user and get JWT
   */
  async loginOps(
    username: string,
    password: string
  ): Promise<{ token: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/ops/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data as { token: string };
    } catch (err) {
      console.warn('[backendApi.loginOps] error:', err);
      return null;
    }
  },

  /**
   * POST /api/auth/login — initiate student login and obtain pre-auth token
   */
  async loginStudentStep1(
    studentCode: string,
    password: string
  ): Promise<{ pre_auth_token: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ student_code: studentCode, password }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data as { pre_auth_token: string };
    } catch (err) {
      console.warn('[backendApi.loginStudentStep1] error:', err);
      return null;
    }
  },

  /**
   * POST /api/auth/verify-pin — verify student PIN and get session JWT
   */
  async verifyStudentPin(
    preAuthToken: string,
    pin: string
  ): Promise<{ session_token: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-pin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ pre_auth_token: preAuthToken, pin }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data as { session_token: string };
    } catch (err) {
      console.warn('[backendApi.verifyStudentPin] error:', err);
      return null;
    }
  },
};
