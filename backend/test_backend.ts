/**
 * CampusKart TypeScript Integration & Ecosystem Verification Test Suite
 * Fully asynchronous, testing all roles, authentication steps, spending controls,
 * atomic checkout with idempotency deduplication, and privacy guarantees.
 */

import http from 'node:http';
import { createServer, resetStore } from './server.ts';

const TEST_PORT = 8999;
let server: http.Server;

function apiRequest(
  path: string,
  method = 'GET',
  body?: any,
  token?: string
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const dataStr = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {}),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = resData ? JSON.parse(resData) : {};
          } catch {
            parsed = { raw: resData };
          }
          resolve({ status: res.statusCode || 500, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  console.log('[Test] Starting CampusKart TypeScript Ecosystem Tests...');
  resetStore();
  server = createServer();
  await new Promise<void>((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));

  try {
    // -------------------------------------------------------------
    // Test 1: Authentication & Role Isolation
    // -------------------------------------------------------------
    console.log('[Test 1] Testing empty state and independent role authentication...');
    
    // Step 1: Student login
    const loginRes = await apiRequest('/api/auth/login', 'POST', {
      student_code: 'CK-2026-101',
      password: 'PASS101',
    });
    assert(loginRes.status === 200, 'Student Step 1 login should return 200');
    assert(Boolean(loginRes.data.pre_auth_token), 'Should receive pre_auth_token');
    assert(loginRes.data.student_preview.first_name === 'Aarav', 'Preview name should match');

    // Step 2: Student verify PIN
    const pinRes = await apiRequest('/api/auth/verify-pin', 'POST', {
      pre_auth_token: loginRes.data.pre_auth_token,
      pin: '2026',
    });
    assert(pinRes.status === 200, 'Student Step 2 PIN verification should return 200');
    const studentToken = pinRes.data.session_token;
    assert(Boolean(studentToken), 'Should receive student session_token');

    // Student token cannot access ops dashboard (Role isolation)
    const opsForbidRes = await apiRequest('/api/ops/dashboard', 'GET', undefined, studentToken);
    assert(opsForbidRes.status === 403, 'Student token must be rejected at ops dashboard');

    // Student token can access student dashboard
    const stuDashRes = await apiRequest('/api/student/dashboard', 'GET', undefined, studentToken);
    assert(stuDashRes.status === 200, 'Student should access student dashboard');
    assert(stuDashRes.data.student.student_code === 'CK-2026-101', 'Student code must match');

    // Invalid parent login fails
    const badParent = await apiRequest('/api/parent/auth/login', 'POST', {
      mobile: '9876543210',
      password: 'wrong_password',
    });
    assert(badParent.status === 401, 'Bad parent credentials must return 401');

    // Valid parent login succeeds
    const goodParent = await apiRequest('/api/parent/auth/login', 'POST', {
      mobile: '9876543210',
      password: 'parent123',
    });
    assert(goodParent.status === 200, 'Valid parent credentials must return 200');
    const parentToken = goodParent.data.session_token;
    assert(Boolean(parentToken), 'Should receive parent session_token');

    console.log('  -> Test 1 Passed: Independent role auth and isolation verified.');

    // -------------------------------------------------------------
    // Test 2: Cross-Portal Scenarios A through E & Privacy
    // -------------------------------------------------------------
    console.log('[Test 2] Testing cross-portal workflows: funding, checkout, ops and privacy...');

    // Ops and College login
    const opsLogin = await apiRequest('/api/ops/auth/login', 'POST', {
      username: 'ops_admin',
      password: 'ops123',
    });
    assert(opsLogin.status === 200, 'Ops login should succeed');
    const opsToken = opsLogin.data.session_token;

    const collegeLogin = await apiRequest('/api/college/auth/login', 'POST', {
      username: 'principal',
      password: 'college123',
    });
    assert(collegeLogin.status === 200, 'College login should succeed');
    const collegeToken = collegeLogin.data.session_token;

    // Parent funds student wallet with Rs 500 (50,000 paise)
    const fundRes = await apiRequest(
      '/api/parent/fund',
      'POST',
      { amount_paise: 50000, method: 'UPI' },
      parentToken
    );
    assert(fundRes.status === 200, 'Parent funding should succeed');
    assert(fundRes.data.new_balance_paise === 135000, 'New balance should be 85000 + 50000 = 135000 paise');

    // Student checks out with Casio Calculator (Rs 1250 = 125,000 paise is > 25,000 single txn limit)
    // First, let's update spending controls to allow larger purchase
    await apiRequest(
      '/api/parent/spending-controls',
      'POST',
      { single_txn_limit_paise: 150000, daily_limit_paise: 200000 },
      parentToken
    );

    // Perform checkout with idempotency key
    const idempKey = `test-idemp-${Date.now()}`;
    const checkoutRes = await apiRequest(
      '/api/checkout',
      'POST',
      {
        items: [{ product_id: 'PRD-001', quantity: 2 }], // 2 x 6500 = 13000 paise
        fulfilment_method: 'Campus Kiosk Pickup',
        collection_point: 'Main Canteen Counter 1',
        idempotency_key: idempKey,
      },
      studentToken
    );
    assert(checkoutRes.status === 200, 'Student checkout should succeed');
    assert(checkoutRes.data.total_amount_paise === 13000, 'Total should be 13000 paise');
    assert(checkoutRes.data.new_balance_paise === 122000, 'Balance after checkout should be 122000 paise');

    // Idempotency replay check: Calling again with same key returns identical order without double charge
    const replayRes = await apiRequest(
      '/api/checkout',
      'POST',
      {
        items: [{ product_id: 'PRD-001', quantity: 2 }],
        idempotency_key: idempKey,
      },
      studentToken
    );
    assert(replayRes.status === 200, 'Idempotency replay should succeed with 200');
    assert(replayRes.data.order_id === checkoutRes.data.order_id, 'Should return same order ID');
    assert(replayRes.data.new_balance_paise === 122000, 'Balance must NOT be deducted again');

    // Parent sees order in parent dashboard
    const parentDash = await apiRequest('/api/parent/dashboard', 'GET', undefined, parentToken);
    assert(parentDash.status === 200, 'Parent dashboard query succeeds');
    assert(parentDash.data.orders.some((o: any) => o.id === checkoutRes.data.order_id), 'Parent should see student order');

    // Ops updates order status to 'Ready for Collection'
    const statusUpdate = await apiRequest(
      '/api/ops/orders/status',
      'POST',
      { order_id: checkoutRes.data.order_id, status: 'Ready for Collection' },
      opsToken
    );
    assert(statusUpdate.status === 200, 'Ops status update succeeds');

    // Parent locks card
    await apiRequest('/api/parent/spending-controls', 'POST', { card_locked: true }, parentToken);

    // Student checkout while locked should fail with 403
    const lockedCheckout = await apiRequest(
      '/api/checkout',
      'POST',
      {
        items: [{ product_id: 'PRD-002', quantity: 1 }],
        idempotency_key: `locked-${Date.now()}`,
      },
      studentToken
    );
    assert(lockedCheckout.status === 403, 'Checkout on locked card must return 403');

    // Ops manual adjustment
    const adjRes = await apiRequest(
      '/api/ops/wallet/adjust',
      'POST',
      { student_id: 'CK-2026-101', type: 'CREDIT', amount_paise: 5000, reason: 'Scholarship Grant' },
      opsToken
    );
    assert(adjRes.status === 200, 'Ops manual adjustment should succeed');
    assert(adjRes.data.new_balance_paise === 127000, 'Balance should reflect credit');

    // College dashboard privacy check: aggregate metrics without student personal data
    const collegeDash = await apiRequest('/api/college/dashboard', 'GET', undefined, collegeToken);
    assert(collegeDash.status === 200, 'College dashboard should succeed');
    assert(collegeDash.data.kpis.total_orders > 0, 'College sees aggregate total orders');
    assert(!collegeDash.data.students, 'College dashboard must NOT leak individual student records');

    console.log('  -> Test 2 Passed: Full cross-portal workflow and privacy verified.');
    console.log('\n[Success] ALL TYPESCRIPT TESTS PASSED (100% OK)');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n[Error] Test failed:', err);
  if (server) server.close();
  process.exit(1);
});
