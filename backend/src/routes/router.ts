/**
 * Central API Request Dispatcher Router
 */

import http from 'node:http';
import { DATA_FILE, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { store } from '../store/index.js';
import {
  parseJsonBody,
  sendJson,
  getAuthToken,
  getCorsOrigin,
  createSessionCookie,
  logRequestStart,
  logRequestComplete,
  logger,
} from '../utils/index.js';
import { authService, productService, walletService, orderService, opsService } from '../services/index.js';
import { productCache, metricsCache } from '../cache/index.js';
import { verifyToken } from '../security/index.js';

export async function handleApiRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  logRequestStart(req);

  res.on('finish', () => {
    logRequestComplete(req, res, {
      role: (req as any)._userRole,
      userId: (req as any)._userId,
      error: (req as any)._error,
    });
  });

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin as string | undefined;
    res.writeHead(204, {
      'Access-Control-Allow-Origin': getCorsOrigin(origin),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Idempotency-Key',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const token = getAuthToken(req);

  if (token) {
    const session = verifyToken(token);
    if (session) {
      (req as any)._userRole = session.role;
      (req as any)._userId = session.entityId;
    }
  }

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
      const customHeaders = resData.data?.token
        ? { 'Set-Cookie': createSessionCookie(resData.data.token) }
        : undefined;
      return sendJson(res, resData.status, resData.data || { error: resData.error }, { customHeaders });
    }

    if (pathname === '/api/parent/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.parentLogin(body);
      const customHeaders = resData.data?.token
        ? { 'Set-Cookie': createSessionCookie(resData.data.token) }
        : undefined;
      return sendJson(res, resData.status, resData.data || { error: resData.error }, { customHeaders });
    }

    if (pathname === '/api/ops/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.opsLogin(body);
      const customHeaders = resData.data?.token
        ? { 'Set-Cookie': createSessionCookie(resData.data.token) }
        : undefined;
      return sendJson(res, resData.status, resData.data || { error: resData.error }, { customHeaders });
    }

    if (pathname === '/api/college/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const resData = authService.collegeLogin(body);
      const customHeaders = resData.data?.token
        ? { 'Set-Cookie': createSessionCookie(resData.data.token) }
        : undefined;
      return sendJson(res, resData.status, resData.data || { error: resData.error }, { customHeaders });
    }

    // 3. Products (with search, category filter, sorting & lazy pagination)
    if (pathname === '/api/products' && method === 'GET') {
      const resData = productService.getProducts({
        search: parsedUrl.searchParams.get('search'),
        category: parsedUrl.searchParams.get('category'),
        sort: parsedUrl.searchParams.get('sort'),
        page: parsedUrl.searchParams.get('page'),
        limit: parsedUrl.searchParams.get('limit'),
        cursor: parsedUrl.searchParams.get('cursor'),
      });
      return sendJson(res, resData.status, resData.data, { cached: resData.cached });
    }

    // System Telemetry, Memory & Cache Performance
    if (pathname === '/api/system/metrics' && method === 'GET') {
      const mem = process.memoryUsage();
      return sendJson(res, 200, {
        uptime_seconds: Math.floor(process.uptime()),
        memory: {
          heap_used_mb: (mem.heapUsed / 1024 / 1024).toFixed(2),
          heap_total_mb: (mem.heapTotal / 1024 / 1024).toFixed(2),
          rss_mb: (mem.rss / 1024 / 1024).toFixed(2),
        },
        caches: {
          products: productCache.getMetrics(),
          metrics: metricsCache.getMetrics(),
        },
        counts: {
          products: store.products.length,
          orders: store.orders.length,
          transactions: store.transactions.length,
          students: store.students.length,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Dashboards & Student Resources
    if (pathname === '/api/student/dashboard' && method === 'GET') {
      const resData = authService.getStudentDashboard(token);
      return sendJson(res, resData.status, resData.data || { error: resData.error });
    }

    const studentMatch = pathname.match(/^\/api\/student\/([^/]+)\/(wallet|orders|notifications)$/);
    if (studentMatch && method === 'GET') {
      const studentCode = decodeURIComponent(studentMatch[1]);
      const subResource = studentMatch[2];
      const student = store.students.find((s) => s.student_code === studentCode || s.id === studentCode);
      if (!student) {
        return sendJson(res, 404, { error: 'Student not found' });
      }

      if (subResource === 'wallet') {
        const wallet = store.wallets.get(student.id);
        return sendJson(res, 200, {
          student_code: student.student_code,
          balance_paise: wallet?.balance_paise || 0,
          balance_rupees: Math.round((wallet?.balance_paise || 0) / 100),
          currency: 'INR',
        });
      }

      if (subResource === 'orders') {
        const orders = store.orders.filter((o) => o.student_id === student.id);
        return sendJson(res, 200, { orders });
      }

      if (subResource === 'notifications') {
        const notifs = store.notifications.filter((n) => n.student_id === student.id);
        return sendJson(res, 200, { notifications: notifs });
      }
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
      return sendJson(res, resData.status, resData.data || { error: resData.error }, { cached: (resData as any).cached });
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

    // 8. Student data GET routes
    const walletMatch = pathname.match(/^\/api\/student\/([^\/]+)\/wallet$/);
    if (walletMatch && method === 'GET') {
      const studentCode = decodeURIComponent(walletMatch[1]);
      const student = store.students.find((s) => s.student_code === studentCode || s.id === studentCode);
      if (!student) return sendJson(res, 404, { error: 'Student not found' });
      const wallet = store.wallets.get(student.id);
      if (!wallet) return sendJson(res, 404, { error: 'Wallet not found' });
      return sendJson(res, 200, { student_code: student.student_code, wallet });
    }

    const ordersMatch = pathname.match(/^\/api\/student\/([^\/]+)\/orders$/);
    if (ordersMatch && method === 'GET') {
      const studentCode = decodeURIComponent(ordersMatch[1]);
      const student = store.students.find((s) => s.student_code === studentCode || s.id === studentCode);
      if (!student) return sendJson(res, 404, { error: 'Student not found' });
      const orders = store.orders.filter((o) => o.student_id === student.id);
      return sendJson(res, 200, { student_code: student.student_code, orders });
    }

    const notificationsMatch = pathname.match(/^\/api\/student\/([^\/]+)\/notifications$/);
    if (notificationsMatch && method === 'GET') {
      const studentCode = decodeURIComponent(notificationsMatch[1]);
      const student = store.students.find((s) => s.student_code === studentCode || s.id === studentCode);
      if (!student) return sendJson(res, 404, { error: 'Student not found' });
      const notifications = store.notifications.filter((n) => n.student_id === student.id);
      return sendJson(res, 200, { student_code: student.student_code, notifications });
    }

    // 404 Fallback
    return sendJson(res, 404, { error: 'Route not found' });
  } catch (err: any) {
    (req as any)._error = err?.message;
    return sendJson(res, 500, { error: err?.message || 'Internal Server Error' });
  }
}
