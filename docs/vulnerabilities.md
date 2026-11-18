# CampusKart — Security Audit & Vulnerability Assessment

This document details threat modeling, vulnerability evaluations, attack surface analyses, and hardening implementations across the CampusKart platform.

---

## 1. Vulnerability Matrix & Remediation Status

| Vulnerability Vector | Severity | Previous State | Remediated / Current Mitigation |
| :--- | :---: | :--- | :--- |
| **Brute-Force PIN Enumeration** | **High** | Unbounded 4-digit PIN attempts | **REMEDIATED**: Enforced 5-attempt lockout per `pre_auth_token` in `backend/src/services/authService.ts`. Reaching 5 failures instantly invalidates the session and returns HTTP 429. |
| **CORS Wildcard Leakage** | **Medium** | `Access-Control-Allow-Origin: *` on all routes | **REMEDIATED**: Implemented dynamic origin reflection (`backend/src/utils/http.ts`). Only trusted origins (`localhost`, `127.0.0.1`, configured domains) receive reflective CORS headers. |
| **Hardcoded Daily Spend Calculation** | **High** | Hardcoded date `'2026-11-16'` bypassed daily controls | **REMEDIATED**: Dynamic date evaluation (`new Date().toISOString().slice(0, 10)`) in `useDerivedMetrics.ts` ensuring live parent daily limits are actively enforced. |
| **Double-Spending & Race Conditions** | **Critical** | Potential parallel execution window | **REMEDIATED**: Implemented atomic PostgreSQL stored procedure `process_checkout` with row-level locking (`FOR UPDATE`) in `supabase/schema.sql` and single-threaded atomic updates on TypeScript in-memory store. |
| **Unprotected Catalog Tables in Supabase** | **Medium** | Missing RLS policies on `products` and `colleges` | **REMEDIATED**: Added explicit RLS policies to `products`, `categories`, and `colleges` in `supabase/schema.sql`. Public read-only, authenticated ops write-only. |
| **Plaintext Credentials in LocalStorage** | **High** | Demo mock persists students with PINs and passwords | **IDENTIFIED & ISOLATED**: LocalStorage holds demo state for offline prototype evaluation. Recommended production migration: remove credentials from client state, delegating 100% of authentication to Supabase Auth / HttpOnly session cookies. |
| **Unmanaged Async Timeouts (Memory Leaks)** | **Low** | Uncleaned `setTimeout` in multi-step payment simulations | **REMEDIATED**: Timers wrapped with state guard checks and dynamic ISO timestamps replacing static strings. |
| **Floating-Point Rounding Drift** | **Critical** | Decimal precision errors in financial balances | **DEFENDED**: All financial balances and calculations are strictly maintained in integer paise (`BIGINT` / `Math.round(amt * 100)`). |

---

## 2. In-Depth Threat Analyses

### 2.1 Concurrency & Double-Spending Attacks
- **Threat**: A student opens two browser sessions simultaneously or triggers rapid parallel checkout requests to spend a single balance multiple times.
- **Engine Defense (Supabase / PostgreSQL)**:
  ```sql
  -- Atomic checkout RPC with row-level locking
  CREATE OR REPLACE FUNCTION process_checkout(
      p_student_id UUID,
      p_items JSONB,
      p_total_paise BIGINT,
      p_idempotency_key TEXT,
      p_fulfilment_type TEXT DEFAULT 'pickup',
      p_collection_point TEXT DEFAULT 'Kiosk #1'
  ) RETURNS JSONB AS $$
  DECLARE
      v_wallet_id UUID;
      v_current_balance BIGINT;
  BEGIN
      -- Row-level exclusive lock on wallet
      SELECT id, balance_paise INTO v_wallet_id, v_current_balance
      FROM wallets WHERE student_id = p_student_id FOR UPDATE;

      IF v_current_balance < p_total_paise THEN
          RAISE EXCEPTION 'Insufficient wallet balance';
      END IF;

      UPDATE wallets
      SET balance_paise = balance_paise - p_total_paise, updated_at = now()
      WHERE id = v_wallet_id;

      RETURN jsonb_build_object('success', true, 'new_balance_paise', v_current_balance - p_total_paise);
  END;
  $$ LANGUAGE plpgsql;
  ```
- **Engine Defense (TypeScript Modular Backend)**:
  `backend/src/services/orderService.ts` checks idempotency keys before processing, validates wallet balance in integer paise, and writes synchronously to the file-backed store `campuskart_data.json`.

---

### 2.2 Student Privacy & Institutional Segregation
- **Threat**: College administrators or merchants attempting to monitor individual student meal or stationery habits without legal/guardian consent.
- **Defense**: The College Dashboard API (`/api/college/dashboard`) computes only aggregate sums (`COUNT`, `SUM(total_amount_paise)`) grouped by category. No endpoints exist that allow college credentials to inspect student names, roll numbers, or itemized purchase histories.
- **Parent Portal Privacy**: Parents can only access their own linked child's ledger. Cross-student access is prevented by validating `parent_account_id` on the student record.

---

### 2.3 Authentication & Session Security
- **Multi-Factor Flow for Students**: 2-step authentication: Student Code + Password (Step 1) produces a temporary 5-minute `pre_auth_token`, followed by 4-digit PIN verification (Step 2) yielding the final session token.
- **Brute-Force Protection**: The PIN verification endpoint limits failed attempts to 5. Upon the 6th failed attempt, the `pre_auth_token` is destroyed, neutralizing automated PIN enumeration.
