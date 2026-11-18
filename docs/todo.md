# CampusKart — Future Roadmap & Things To Do

A prioritized engineering task list for upcoming milestones on CampusKart.

---

## High Priority (Immediate Next Steps)

- [ ] **Supabase Cloud Provisioning**:
  - Once the user provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `DATABASE_URL`) in `.env`, run `schema_postgres_supabase.sql` to instantiate the production database.
  - Test cross-portal transactional checkout and funding against live Supabase instance.
- [ ] **API Endpoint Rate Limiting**:
  - Add in-memory sliding-window rate limiter for sensitive authentication endpoints (`/api/auth/login`, `/api/auth/verify-pin`, `/api/parent/auth/login`).
  - Block automated brute-force attempts on 4-digit PINs.
- [ ] **CORS Environment Configuration**:
  - Replace wildcard `Access-Control-Allow-Origin: *` with explicit allowed origins read from `.env` (`ALLOWED_ORIGINS=http://localhost:5173,https://campuskart.app`).

---

## Medium Priority (Phase 2 Hardening)

- [ ] **Supabase Realtime Subscriptions**:
  - Connect the React frontend to Supabase Realtime channels to receive instant push events when Operations updates order statuses (`Preparing` -> `Ready for Collection`).
  - Eliminate all remaining polling mechanisms.
- [ ] **Automated Integration & E2E Testing**:
  - Set up Playwright or Cypress tests verifying full student purchase flow from Login -> Add to Cart -> 5s Simulated Payment -> Receipt.
  - Automate test runs in GitHub Actions CI/CD workflow.
- [ ] **Structured Logging & APM**:
  - Replace `print()` statements in `server.py` with structured JSON logging (`structlog` or standard `logging`) including request ID, latency, user role, and status code.

---

## Long Priority (Phase 3 Enterprise Scale)

- [ ] **Hardware Kiosk SDK Integration**:
  - Build Electron / Tauri desktop kiosk wrapper supporting serial USB barcode scanners and NFC smart card readers.
- [ ] **Payment Gateway Production Webhooks**:
  - Integrate Razorpay / Cashfree educational sub-merchant API for authentic live UPI parental wallet top-ups.
- [ ] **Multi-College Tenancy Partitioning**:
  - Extend RLS policies to enforce multi-tenant isolation across multiple educational societies and campuses.
