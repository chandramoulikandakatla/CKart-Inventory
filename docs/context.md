# CampusKart — Ecosystem Architecture & Domain Context

## 1. Executive Summary

**CampusKart** is a closed-loop institutional student commerce and pre-funded campus wallet platform designed specifically for supervised academic environments such as junior colleges, coaching institutes (e.g., Sri Chaitanya, Narayana), and residential boarding campuses. 

In these environments:
- Students are typically prohibited from carrying open smartphones, credit/debit cards, or uncontrolled cash.
- Traditional commerce creates administrative friction, long lines during short lunch/dispersal breaks, and vulnerability to theft or loss.
- Parents demand real-time visibility and granular financial controls over their ward's daily expenditures.
- Colleges require zero administrative burden, strict student privacy preservation, and unified merchant settlement.

---

## 2. Institutional Model & Constraints

### 2.1 The Pilot Environment
- **Participating Institution**: Sri Chaitanya & Narayana Junior Academy (`SCNA-HYD-01`).
- **Campus Locations**: Vijayawada / Hyderabad Pilot Campuses.
- **Pilot Windows**:
  - Window 1: `12:30 PM – 01:45 PM` (Lunch Break).
  - Window 2: `04:15 PM – 05:30 PM` (Evening Dispersal).
- **Physical Collection Points**:
  - `Block A — Ground Floor Smart Kiosk #1`
  - `Block B — Academic Wing Counter #2`
  - `Hostel Gate Dispensary #3`

### 2.2 Core Financial Rules
1. **Integer Paise Accounting (`BIGINT`)**:
   - All monetary amounts in the database, backend calculations, and network payloads are stored and computed in integer paise (₹1 = 100 paise).
   - This eliminates IEEE 754 floating-point drift, fractional penny discrepancies, and reconciliation errors.
2. **Pre-Funded Closed Wallet**:
   - Students cannot self-fund accounts with external bank credentials.
   - Wallets are pre-funded exclusively by authenticated parents or authorized institutional onboarding operators.
3. **Dual-Factor Student Authentication**:
   - Factor 1: Student Code (`CK-2026-101`) + Academic Password (`PASS101`).
   - Factor 2: 4-digit CampusKart Hardware/Kiosk PIN (`1234`).
4. **Independent Parent Access**:
   - Parents authenticate separately using the Student Code + Parent Access PIN (`9999`).
   - Parents do not know or use the student's personal kiosk PIN.

---

## 3. Four Interconnected Portals (Single Source of Truth)

All 4 applications operate against an authoritative, synchronized relational ledger:

```
┌─────────────────────────────────────────────────────────────┐
│                 Shared Relational Ledger                    │
│      (SQLite / Supabase PostgreSQL with ACID Isolation)     │
└────────┬──────────────┬──────────────┬──────────────┬───────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
   │  Student  │  │  Parent   │  │Operations │  │  College  │
   │Commerce UI│  │FinTech UI │  │Control Hub│  │Admin Panel│
   └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

1. **Student Application**:
   - 16 distinct screens covering onboarding, catalog discovery, product detail, shopping bag, order review, payment simulation, receipt inspection, order tracking, and wallet ledger.
2. **Parent FinTech Portal**:
   - 14 distinct screens featuring instant wallet funding (simulated UPI, NetBanking, Debit/Credit Card), category restrictions, daily/monthly spend limits, live spend alerts, and consolidated tax/expense statements.
3. **Operations Dashboard**:
   - 5 comprehensive management screens: real-time order queue with status transitions, live inventory catalogue updates, student account management (status toggling), and audited manual ledger adjustments.
4. **College Reporting Portal**:
   - 2 aggregate institutional views: high-level volume and category breakdown with strict zero-individual-student privacy preservation.

---

## 4. State Machine & Order Lifecycle

```
[Order Placed] ──> [Payment Confirmed] ──> [Accepted] ──> [Preparing] ──> [Ready for Collection] ──> [Completed]
      │
      └──> (If insufficient balance / limit exceeded / manual cancellation) ──> [Cancelled]
```

- Every order transition generates automated audit trail entries in `wallet_transactions` and broadcasts student/parent notifications.

---

## 5. Step-by-Step Student Data Handling & Persistence Protocol

Because CampusKart manages sensitive institutional student financial records, every student interaction follows a deterministic, 7-step data lifecycle where state is strictly verified, loaded, and persisted at each step:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 7-Step Student Data Lifecycle & Persistence                 │
└─────────────────────────────────────────────────────────────────────────────┘
  [Step 1] Enrollment & Credential Ingestion
     │       - Generate unique Student Code (CK-YYYY-NNN) & UUID
     │       - PBKDF2 hash for password & 4-digit PIN
     │       - Initialize Wallet in integer paise & emit Initial Credit ledger entry
     │       - Persist immediately to disk / Supabase
     ▼
  [Step 2] Dual-Factor Authentication
     │       - Factor 1: Student Code + Password -> Issue Pre-Auth Token (TTL: 5m)
     │       - Factor 2: Pre-Auth Token + 4-digit PIN -> Issue HMAC-SHA256 Session Token
     │       - Verify account status is 'active' (not suspended/inactive)
     ▼
  [Step 3] Session & Spending Controls Hydration
     │       - Hydrate wallet balance (`balance_paise`), active orders, and notifications
     │       - Load parent spending controls (daily limit, single txn limit, category locks, card lock)
     │       - Persist session state in browser localStorage to survive reloads
     ▼
  [Step 4] Pre-Transaction Compliance Verification
     │       - Verify student card is not locked (`card_locked === false`)
     │       - Verify item categories against allowed categories list
     │       - Verify single order amount <= `single_txn_limit_paise`
     │       - Verify today's aggregate spend + order amount <= `daily_limit_paise`
     │       - Verify available wallet balance >= order amount in integer paise
     ▼
  [Step 5] Atomic Checkout & Double-Entry Ledger Execution
     │       - Check `idempotency_key` (return cached receipt on replay without duplicate charge)
     │       - Atomically decrement product stock quantities
     │       - Atomically debit student wallet balance in integer paise
     │       - Insert new order record with status 'Order Placed'
     │       - Insert immutable audit record into `wallet_transactions` ledger
     ▼
  [Step 6] Durable Storage Commitment (Zero Data Loss)
     │       - Backend: Atomic write (`write -> fs.renameSync`) to persistent JSON database
     │       - Cloud: Sync mutation to Supabase PostgreSQL with RLS
     │       - Frontend: Synchronize updated balances and active order records in localStorage
     ▼
  [Step 7] Order Fulfillment Tracking & Parent Notifications
             - Ops advances order: 'Order Placed' -> 'Preparing' -> 'Ready for Collection'
             - Push notification issued to student & parent
             - Every transition permanently recorded with timestamp & operator ID
```

