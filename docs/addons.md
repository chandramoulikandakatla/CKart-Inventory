# CampusKart — Modular Add-Ons & Integration Extensions

This document catalogs high-value extensions, hardware peripherals, and external service add-ons engineered to scale the CampusKart ecosystem.

---

## 1. Hardware & Edge Kiosk Add-Ons

### 1.1 RFID / NFC Campus Smart Card & Wristband Integration
- **Concept**: Integrate USB/serial NFC readers (e.g., ACR122U or PN532) at physical campus kiosks.
- **Functionality**:
  - Students tap their college ID badge or wristband instead of typing their 11-digit Student Code.
  - The reader transmits a cryptographically hashed card UID to the client.
  - The student then enters their 4-digit PIN on a hardened physical keypad to complete the payment in under 2 seconds.

### 1.2 Automated Locker / Dispensary Bay Actuators
- **Concept**: Integrate microcontroller-driven smart collection lockers (ESP32 / Raspberry Pi).
- **Functionality**:
  - When an order reaches `Ready for Collection`, the Operations team deposits the order into a designated locker bay (e.g., Bay #14).
  - The student scans a QR code or taps their card at the kiosk; the locker solenoid clicks open automatically.
  - State transitions immediately to `Completed`.

---

## 2. Communication & Alerting Add-Ons

### 2.1 WhatsApp & SMS Notification Gateways (Twilio / Gupshup)
- **Concept**: Real-time push messaging for non-app-carrying parents.
- **Functionality**:
  - Send instant WhatsApp alerts to parents: *"Aarav completed a ₹90.00 purchase at Block A Kiosk. Remaining Balance: ₹410.00."*
  - Send low-balance reminder messages with an instant one-click UPI payment link.

### 2.2 Institution ERP & Student Information System (SIS) Sync
- **Concept**: Bi-directional sync with institutional ERPs (TCS iON, Oracle PeopleSoft, Fedena).
- **Functionality**:
  - Automatically onboard new students upon fee payment or college enrollment.
  - Automatically freeze wallets upon academic suspension, disciplinary actions, or graduation.

---

## 3. Financial & Payment Add-Ons

### 3.1 Real UPI Dynamic QR & Payment Gateway (Razorpay / Cashfree / Stripe India)
- **Concept**: Transition from simulated parent funding to real live banking settlements.
- **Functionality**:
  - Dynamic UPI QR code generation on the parent portal with zero merchant commission on educational sub-merchant categories.
  - Automated webhook listener `/api/webhooks/payment` verifying signature and crediting student wallets in under 800ms.

### 3.2 Recurring Auto-Top-Up (e-Mandate)
- **Concept**: Automated parental standing instructions.
- **Functionality**:
  - Parents authorize an NPCI e-Mandate or recurring card subscription.
  - When the student's balance dips below a threshold (e.g. ₹150.00), the backend triggers an automated top-up without parental manual intervention.

---

## 4. Backend Performance & Caching Add-Ons

### 4.1 Distributed In-Memory Cache (Redis / Valkey / Dragonfly)
- **Concept**: Cloud-native shared cache layer extending `backend/src/cache/index.ts`.
- **Functionality**:
  - Connects multiple stateless backend replicas to a centralized low-latency cache.
  - Supports pub/sub tag invalidations across the cluster when operations modify inventory or order fulfillment statuses.

### 4.2 Supabase Realtime CDC (Change Data Capture) Dispatcher
- **Concept**: Instant bi-directional push to student and parent clients.
- **Functionality**:
  - Listens to PostgreSQL `INSERT` / `UPDATE` triggers on `orders` and `wallets`.
  - Pushes live updates directly to student mobile view and parent dashboards via WebSockets, eliminating client polling loops.
- **Functionality**:
  - If a student's wallet balance drops below ₹150, trigger an automatic ₹500 top-up from the parent's linked bank account via NPCI e-Mandate or credit card tokenization.
