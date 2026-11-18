/**
 * Central API Request Dispatcher Router
 */

import http from 'node:http';
import { DATA_FILE, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { store } from '../store/index.js';
import { parseJsonBody, sendJson, getAuthHeader, getCorsOrigin } from '../utils/index.js';
import { authService, productService, walletService, orderService, opsService } from '../services/index.js';

export async function handleApiRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin as string | undefined;
    res.writeHead(204, {
      'Access-Control-Allow-Origin': getCorsOrigin(origin),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Idempotency-Key',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const token = getAuthHeader(req);

  try {
    // 1. Health
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        engine: 'TypeScript-Native-Modular',
        persisted_file: DATA_FILE,
        supabase_configured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
        students_count: store.students.length,
        orders_count: store.orders.length,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Authentication
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.studentLoginStep1(body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/auth/verify-pin' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.studentVerifyPin(body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/parent/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.parentLogin(body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/ops/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.opsLogin(body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/college/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.collegeLogin(body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    // 3. Products
    if (pathname === '/api/products' && method === 'GET') {
      const resData = productService.getProducts({
        search: parsedUrl.searchParams.get('search'),
        category: parsedUrl.searchParams.get('category'),
        sort: parsedUrl.searchParams.get('sort'),
      });
      return sendJson(res, resData.status, resData.data);
    }

    // 4. Dashboards
    if (pathname === '/api/student/dashboard' && method === 'GET') {
      const resData = authService.getStudentDashboard(token);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/parent/dashboard' && method === 'GET') {
      const resData = authService.getParentDashboard(token);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/ops/dashboard' && method === 'GET') {
      const resData = opsService.getDashboard(token);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/college/dashboard' && method === 'GET') {
      const resData = authService.getCollegeDashboard(token);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    // 5. Wallet & Spending Controls
    if ((pathname === '/api/wallet/simulate-topup' || pathname === '/api/parent/fund') && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = walletService.fundWallet(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/parent/spending-controls' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = walletService.updateSpendingControls(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/ops/wallet/adjust' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = walletService.manualAdjust(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    // 6. Orders & Checkout
    if (pathname === '/api/checkout' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = orderService.checkout(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/ops/orders/status' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = opsService.updateOrderStatus(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/notifications/read' && method === 'POST') {
      const resData = orderService.markNotificationsRead(token);
      return sendJson(res, resData.status, resData.data);
    }

    // 7. Operations Student & Product Management
    if (pathname === '/api/ops/students' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = opsService.enrollStudent(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/ops/students/status' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = opsService.toggleStudentStatus(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    if (pathname === '/api/ops/products' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = opsService.updateProduct(token, body);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    // 404 Fallback
    return sendJson(res, 404, { error: 'Route not found' });
  } catch (err: any) {
    return sendJson(res, 500, { error: err?.message || 'Internal Server Error' });
  }
}
