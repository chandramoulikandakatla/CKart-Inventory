# CampusKart — Security Audit & Vulnerability Assessment

This document details threat modeling, vulnerability evaluations, attack surface analyses, and hardening recommendations across the CampusKart platform.

---

## 1. Vulnerability Matrix & Risk Evaluation

| Vulnerability Vector | Severity | Current Mitigation | Hardening Requirement |
| :--- | :---: | :--- | :--- |
| **Brute-Force PIN Enumeration** | **High** | 4-digit PIN verified via PBKDF2-HMAC hash | Implement progressive lockout (3 failed attempts = 5 min cooldown) + IP rate limiting. |
| **Race Conditions in Wallet Debit** | **Critical** | Handled via SQLite `BEGIN IMMEDIATE` transaction locking | Ensure Supabase PostgreSQL uses `SELECT FOR UPDATE` or transactional RPC functions with strict row locking. |
| **Replay Attacks on Checkout** | **High** | Idempotency key tracking in `payment_attempts` | Enforce mandatory TTL expiry (e.g. 24h) and strict unique index constraints on idempotency keys across all nodes. |
| **Token Hijacking & Session Replay** | **Medium** | HMAC-SHA256 session tokens with timestamp expiration (`exp`) | Enforce HTTPS exclusively (`Strict-Transport-Security`), HTTP-only Secure SameSite cookies, and token revocation blocklists. |
| **SQL Injection** | **Low** | Parameterized queries (`?` in SQLite) used consistently | Never use raw string formatting or f-strings in SQL execution. Maintain automated static analysis (Bandit/Semgrep). |
| **Horizontal Privilege Escalation (IDOR)** | **High** | Scoped queries based on authenticated `payload['student_id']` | In Supabase, enforce PostgreSQL Row Level Security (RLS) policies (`auth.uid() = auth_user_id`) at the database engine level. |
| **Floating-Point Rounding Drift** | **Critical** | Integer Paise precision (`BIGINT`) enforced across schemas | Strict schema `CHECK (balance_paise >= 0)` constraints preventing negative wallet balances. |

---

## 2. In-Depth Threat Analyses

### 2.1 Concurrency & Double-Spending Attacks
- **Threat**: A student opens two browser sessions simultaneously or triggers rapid parallel checkout requests to spend a single balance multiple times.
- **Current Defense**: `server.py` executes `conn.execute("BEGIN IMMEDIATE")` in SQLite, which reserves an exclusive write lock immediately before checking balances or decrementing stock.
- **Supabase/PostgreSQL Implementation**:
  ```sql
  -- Atomic wallet debit function with row-level locking
  CREATE OR REPLACE FUNCTION process_wallet_checkout(
      p_student_id UUID,
      p_total_paise BIGINT,
      p_idempotency_key TEXT
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

### 2.2 Student Privacy & Institutional Segregation
- **Threat**: College administrators or merchants attempting to monitor individual student meal or stationery habits without legal/guardian consent.
- **Defense**: The College Dashboard API (`/api/college/dashboard`) computes only aggregate sums (`COUNT`, `SUM(total_amount_paise)`) grouped by category. No endpoints exist that allow college credentials to inspect student names, roll numbers, or itemized purchase histories.
