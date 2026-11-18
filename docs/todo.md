# CampusKart — Future Roadmap & Things To Do

A prioritized engineering task list for upcoming milestones on CampusKart, tracking both completed foundational data persistence and upcoming institutional features.

---

## Completed Foundational Milestones

- [x] **Durable Backend Data Persistence (`backend/server.ts`)**:
  - Implemented file-backed atomic database storage (`campuskart_data.json`) via safe temp-file write + rename (`fs.renameSync`).
  - Ensures all student profiles, wallets, transactions, spending limits, orders, and products are permanently saved and loaded on each step across server restarts.
- [x] **Frontend Session & Cart Hydration (`CampusKartContext.tsx`)**:
  - Persists student and parent login state, active portal screen, selected student ID, and shopping cart in `localStorage`.
  - Browser page reloads preserve active session, preventing unintended logouts or cart resets.
- [x] **Step-by-Step Student Lifecycle Enforcement**:
  - Strict 7-step data handling: Enrollment -> 2-Step Auth -> Controls Hydration -> Pre-Order Compliance (category, single txn, daily limit, card lock, wallet balance) -> Atomic Checkout -> Immediate Persistence -> Order Tracking.
- [x] **Durable Integration Test Suite (`backend/test_backend.ts`)**:
  - Validates authentication, cross-portal transactions, and verifies cold-reload data persistence from disk.

---

## High Priority (Immediate Next Steps)

- [x] **API Endpoint Rate Limiting (Completed)**:
  - Enforced sliding-window pre-auth tracking in `backend/src/services/authService.ts`.
  - Automated lockout of `pre_auth_token` after 5 failed PIN attempts, mitigating brute-force enumeration.
- [x] **CORS Strict Origin Reflection (Completed)**:
  - Dynamically validates incoming `Origin` headers against localhost, 127.0.0.1, and authorized domains in `backend/src/utils/http.ts` and `router.ts`.
- [ ] **Supabase Cloud Provisioning**:
  - Once user credentials are provided in `.env`, run `supabase/schema.sql` in Supabase SQL Editor.
  - Verify live PostgREST and PostgreSQL connection pooling with Supabase client.

---

## Medium Priority (Phase 2 Hardening)

- [ ] **Supabase Realtime Subscriptions**:
  - Connect the React frontend to Supabase Realtime channels to receive instant push events when Operations updates order statuses (`Preparing` -> `Ready for Collection`).
  - Eliminate all remaining polling mechanisms.
- [ ] **Automated End-to-End Testing**:
  - Set up Playwright tests verifying full student purchase flow from Login -> Add to Cart -> 5s Simulated Payment -> Receipt.
  - Automate test runs in GitHub Actions CI/CD workflow.
- [ ] **Structured Logging & APM**:
  - Replace `console.log()` statements in `backend/server.ts` with structured JSON logging (`pino` in TypeScript) including request ID, latency, user role, and status code.

---

## Long Priority (Phase 3 Enterprise Scale)

- [ ] **Hardware Kiosk SDK Integration**:
  - Build Electron / Tauri desktop kiosk wrapper supporting serial USB barcode scanners and NFC smart card readers.
- [ ] **Payment Gateway Production Webhooks**:
  - Integrate Razorpay / Cashfree educational sub-merchant API for authentic live UPI parental wallet top-ups.
- [ ] **Multi-College Tenancy Partitioning**:
  - Extend RLS policies to enforce multi-tenant isolation across multiple educational societies and campuses.
