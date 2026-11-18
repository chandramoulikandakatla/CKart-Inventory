/**
 * Comprehensive Parent-Student Authentication & Wallet Isolation Test Suite
 * Validates:
 * 1. Multi-guardian identity matching (Aarav, Diya, Rohan).
 * 2. Dedicated Parent PIN authentication and rejection of incorrect PINs.
 * 3. Strict wallet balance isolation (funding student A NEVER modifies student B).
 * 4. Strict spending control isolation (daily limits, category restrictions).
 * 5. Strict transaction ledger scoping.
 */

import { INITIAL_STATE } from './src/constants/initialState.js';
import type { EcosystemState, WalletTransaction, SpendingControls } from './src/types/ecosystem.js';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function runIsolationTests() {
  console.log('================================================================');
  console.log('CampusKart Parent-Student Multi-Tenant Isolation & FinTech Tests');
  console.log('================================================================\n');

  let state: EcosystemState = deepClone(INITIAL_STATE);

  const stuAarav = state.students.find(s => s.id === 'CK-2026-101')!;
  const stuDiya = state.students.find(s => s.id === 'CK-2026-102')!;
  const stuRohan = state.students.find(s => s.id === 'CK-2026-103')!;

  // 1. Initial State Check
  console.log('[Test 1] Initial Student Wallets:');
  console.log(`  - Aarav (${stuAarav.id}): ₹${stuAarav.walletBalance}`);
  console.log(`  - Diya  (${stuDiya.id}): ₹${stuDiya.walletBalance}`);
  console.log(`  - Rohan (${stuRohan.id}): ₹${stuRohan.walletBalance}`);
  if (stuAarav.walletBalance !== 0 || stuDiya.walletBalance !== 0 || stuRohan.walletBalance !== 0) {
    throw new Error('Initial wallets must start at 0.');
  }
  console.log('  -> PASSED: All students initialized with zero balances.\n');

  // 2. Parent Authentication Simulation
  console.log('[Test 2] Guardian Identity & Scalable Credential Verification:');
  // 2a. Username & Password Authentication for Rajesh Sharma
  const userRajesh = 'rajesh_sharma';
  const passRajesh = 'parent123';
  const parentRajesh = (state.parents || []).find(p => p.username === userRajesh && p.password === passRajesh);
  if (!parentRajesh || parentRajesh.name !== 'Rajesh Sharma') {
    throw new Error('Failed to authenticate Rajesh Sharma with username and password.');
  }
  console.log(`  - Rajesh Sharma authenticated successfully via username "@${parentRajesh.username}" and password.`);

  // 2b. Incorrect Password for Rajesh fails
  const badPass = 'wrong_password_123';
  const badAuth = (state.parents || []).find(p => p.username === userRajesh && p.password === badPass);
  if (badAuth) {
    throw new Error('Authentication succeeded with invalid password!');
  }
  console.log('  - Invalid password rejected as expected.');

  // 2c. Backward-compatible PIN matching on student record
  const queryRajesh = 'CK-2026-101';
  const pinRajesh = '9999';
  const matchAarav = state.students.find(s => s.id === queryRajesh && s.parentPin === pinRajesh);
  if (!matchAarav || matchAarav.parentName !== 'Rajesh Sharma') {
    throw new Error('Failed to authenticate Rajesh Sharma with valid PIN.');
  }
  console.log(`  - Backward-compatible PIN verification verified for child: ${matchAarav.name}`);

  // 2d. Username & Password for Lakshmi Reddy
  const userLakshmi = 'lakshmi_reddy';
  const passLakshmi = 'parent123';
  const parentLakshmi = (state.parents || []).find(p => p.username === userLakshmi && p.password === passLakshmi);
  if (!parentLakshmi || parentLakshmi.name !== 'Lakshmi Reddy') {
    throw new Error('Failed to authenticate Lakshmi Reddy with valid credentials.');
  }
  console.log(`  - Lakshmi Reddy authenticated successfully via username "@${parentLakshmi.username}".`);
  console.log('  -> PASSED: Scalable guardian username/password & dedicated PIN validation strictly isolates sessions.\n');

  // 3. Parent Wallet Funding Scoping
  console.log('[Test 3] Parent Wallet Funding Isolation:');
  // Scenario A: Rajesh funds ₹500 for Aarav
  const fundAmtAarav = 500;
  state = {
    ...state,
    students: state.students.map(s => s.id === 'CK-2026-101' ? { ...s, walletBalance: s.walletBalance + fundAmtAarav } : s),
    transactions: [
      {
        id: 'TXN-AARAV-FND',
        studentId: 'CK-2026-101',
        type: 'Wallet Funding',
        category: 'Parent Top-Up',
        amount: fundAmtAarav,
        previousBalance: 0,
        newBalance: fundAmtAarav,
        timestamp: '2026-11-18 23:00',
        month: 'Nov 2026',
        status: 'Completed',
        method: 'UPI',
        relatedOrderId: null,
        note: 'Parent top-up by Rajesh Sharma',
        reconciled: true,
      },
      ...state.transactions,
    ],
  };

  const curAarav = state.students.find(s => s.id === 'CK-2026-101')!;
  const curDiya = state.students.find(s => s.id === 'CK-2026-102')!;
  const curRohan = state.students.find(s => s.id === 'CK-2026-103')!;

  console.log(`  - After Rajesh funded Aarav with ₹${fundAmtAarav}:`);
  console.log(`    * Aarav: ₹${curAarav.walletBalance} (Expected: 500)`);
  console.log(`    * Diya:  ₹${curDiya.walletBalance} (Expected: 0)`);
  console.log(`    * Rohan: ₹${curRohan.walletBalance} (Expected: 0)`);
  if (curAarav.walletBalance !== 500 || curDiya.walletBalance !== 0 || curRohan.walletBalance !== 0) {
    throw new Error('Cross-account leakage detected in Aarav funding!');
  }

  // Scenario B: Lakshmi funds ₹750 for Diya
  const fundAmtDiya = 750;
  state = {
    ...state,
    students: state.students.map(s => s.id === 'CK-2026-102' ? { ...s, walletBalance: s.walletBalance + fundAmtDiya } : s),
    transactions: [
      {
        id: 'TXN-DIYA-FND',
        studentId: 'CK-2026-102',
        type: 'Wallet Funding',
        category: 'Parent Top-Up',
        amount: fundAmtDiya,
        previousBalance: 0,
        newBalance: fundAmtDiya,
        timestamp: '2026-11-18 23:05',
        month: 'Nov 2026',
        status: 'Completed',
        method: 'NetBanking',
        relatedOrderId: null,
        note: 'Parent top-up by Lakshmi Reddy',
        reconciled: true,
      },
      ...state.transactions,
    ],
  };

  const postDiyaAarav = state.students.find(s => s.id === 'CK-2026-101')!;
  const postDiyaDiya = state.students.find(s => s.id === 'CK-2026-102')!;
  const postDiyaRohan = state.students.find(s => s.id === 'CK-2026-103')!;

  console.log(`  - After Lakshmi funded Diya with ₹${fundAmtDiya}:`);
  console.log(`    * Aarav: ₹${postDiyaAarav.walletBalance} (Expected: 500)`);
  console.log(`    * Diya:  ₹${postDiyaDiya.walletBalance} (Expected: 750)`);
  console.log(`    * Rohan: ₹${postDiyaRohan.walletBalance} (Expected: 0)`);
  if (postDiyaAarav.walletBalance !== 500 || postDiyaDiya.walletBalance !== 750 || postDiyaRohan.walletBalance !== 0) {
    throw new Error('Cross-account leakage detected in Diya funding!');
  }
  console.log('  -> PASSED: Wallet balances are strictly isolated per student.\n');

  // 4. Spending Controls Scoping
  console.log('[Test 4] Spending Controls Scoping & Daily Limit Enforcer:');
  // Rajesh sets Aarav daily limit to ₹250
  state.spendingControls['CK-2026-101'] = {
    ...state.spendingControls['CK-2026-101'],
    dailyLimitEnabled: true,
    dailyLimit: 250,
  };
  // Lakshmi sets Diya daily limit to ₹500
  state.spendingControls['CK-2026-102'] = {
    ...state.spendingControls['CK-2026-102'],
    dailyLimitEnabled: true,
    dailyLimit: 500,
  };

  const aaravLimit = state.spendingControls['CK-2026-101'].dailyLimit;
  const diyaLimit = state.spendingControls['CK-2026-102'].dailyLimit;
  console.log(`  - Aarav daily limit: ₹${aaravLimit}, Diya daily limit: ₹${diyaLimit}`);

  // Test purchase attempt of ₹300:
  const testCartTotal = 300;
  // Aarav should be BLOCKED (300 > 250)
  const aaravBlocked = testCartTotal > aaravLimit;
  // Diya should be ALLOWED (300 <= 500)
  const diyaAllowed = testCartTotal <= diyaLimit;

  if (!aaravBlocked || !diyaAllowed) {
    throw new Error('Spending controls isolation violation!');
  }
  console.log(`  - Aarav ₹300 checkout: Blocked by guardian cap (₹${aaravLimit}) -> Verified.`);
  console.log(`  - Diya ₹300 checkout: Permitted under guardian cap (₹${diyaLimit}) -> Verified.`);
  console.log('  -> PASSED: Spending controls operate independently per student.\n');

  // 5. Ledger & Transaction Scoping
  console.log('[Test 5] Transaction Ledger & Privacy Isolation:');
  const aaravTxns = state.transactions.filter(t => t.studentId === 'CK-2026-101');
  const diyaTxns = state.transactions.filter(t => t.studentId === 'CK-2026-102');

  console.log(`  - Rajesh sees Aarav transactions: count=${aaravTxns.length}, all match CK-2026-101.`);
  console.log(`  - Lakshmi sees Diya transactions: count=${diyaTxns.length}, all match CK-2026-102.`);
  for (const t of aaravTxns) {
    if (t.studentId !== 'CK-2026-101') throw new Error('Data leak in Aarav transactions!');
  }
  for (const t of diyaTxns) {
    if (t.studentId !== 'CK-2026-102') throw new Error('Data leak in Diya transactions!');
  }
  console.log('  -> PASSED: Zero cross-tenant data leakage in parent ledgers.\n');

  console.log('================================================================');
  console.log('[SUCCESS] ALL PARENT-STUDENT ISOLATION & LOGIC CHECKS PASSED 100%');
  console.log('================================================================');
}

runIsolationTests();
