import type {
  Product,
  StudentDashboardResponse,
} from '../types/campuskart';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL) ||
  'http://127.0.0.1:8080';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const campusKartApi = {
  loginCredentials(student_code: string, password: string) {
    return request<{
      pre_auth_token: string;
      student_preview: {
        student_code: string;
        first_name: string;
        last_name: string;
        academic_year: string;
        college_name: string;
      };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ student_code, password }),
    });
  },

  verifyPin(pre_auth_token: string, pin: string) {
    return request<{ session_token: string }>('/api/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pre_auth_token, pin }),
    });
  },

  getProducts(params?: { search?: string; category?: string; sort?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.sort) qs.set('sort', params.sort);
    return request<{ products: Product[] }>(`/api/products?${qs.toString()}`);
  },

  getDashboard(token: string) {
    return request<StudentDashboardResponse>('/api/student/dashboard', { method: 'GET' }, token);
  },

  simulateParentTopUp(token: string, amount_paise: number, method: string) {
    return request<{ reference: string; new_balance_paise: number; simulated: boolean }>(
      '/api/wallet/simulate-topup',
      {
        method: 'POST',
        body: JSON.stringify({ amount_paise, method }),
      },
      token
    );
  },

  checkout(
    token: string,
    payload: {
      items: Array<{ product_id: string; quantity: number }>;
      fulfilment_method: string;
      collection_point: string;
      idempotency_key: string;
      simulate_failure?: boolean;
    }
  ) {
    return request<{
      order_id: string;
      reference: string;
      total_amount_paise: number;
      previous_balance_paise: number;
      new_balance_paise: number;
      simulated: boolean;
    }>(
      '/api/checkout',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token
    );
  },

  markNotificationsRead(token: string) {
    return request<{ ok: boolean }>('/api/notifications/read', { method: 'POST', body: '{}' }, token);
  },
};
