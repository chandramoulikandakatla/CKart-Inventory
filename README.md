# CampusKart — 100% TypeScript Student Commerce & Wallet Platform

CampusKart is a high-performance student commerce and pre-funded campus wallet ecosystem engineered for institutional environments (junior colleges, coaching academies, and universities).

The entire codebase is built **exclusively in TypeScript & React (TSX)** with zero Python code, native Supabase cloud database integration, and integer paise monetary precision.

---

## Architecture & Directory Structure

```
cKart/
├── package.json                          # Monorepo root scripts (npm run dev, npm run server, etc.)
├── backend/
│   ├── package.json                      # Pure TypeScript backend (Node standard libraries + tsx)
│   ├── tsconfig.json                     # Strict TypeScript configuration
│   ├── server.ts                         # ACID-compliant HTTP REST API server (zero Python)
│   ├── test_backend.ts                   # Asynchronous TypeScript integration test suite
│   ├── schema_postgres_supabase.sql      # Supabase PostgreSQL schema with RLS
│   └── schema_sqlite.sql                 # Reference SQLite relational schema
│
├── frontend/
│   ├── package.json                      # React 18, Vite, Lucide-React, Recharts, @supabase/supabase-js
│   ├── vite.config.ts                    # Vite build with Rollup chunk optimization
│   ├── tsconfig.json                     # Strict TypeScript compiler options
│   ├── tailwind.config.js                # Tailwind CSS styling and theme tokens
│   ├── index.html                        # HTML5 entry template
│   └── src/
│       ├── main.tsx                      # React root rendering entry point
│       ├── index.css                     # Base stylesheets
│       ├── App.tsx                       # Lazy-loaded coordinated application shell
│       ├── constants/
│       │   └── initialState.ts           # Seed evaluation state, categories & order status constants
│       ├── context/
│       │   └── CampusKartContext.tsx     # Unified reactive state manager and custom hook (`useCampusKart`)
│       ├── services/
│       │   ├── api.ts                    # Typed REST API client
│       │   ├── supabaseClient.ts         # Singleton Supabase client configuration
│       │   ├── supabaseService.ts        # Direct Supabase typed operations (orders, wallet, controls)
│       │   └── index.ts                  # Clean barrel exports
│       ├── types/
│       │   ├── campuskart.ts             # API interfaces
│       │   └── ecosystem.ts              # Domain models & strict TypeScript interfaces
│       ├── components/
│       │   └── common/                   # Shared UI (ShaderBackground, ReceiptModal, etc.)
│       └── pages/
│           ├── student/                  # 16 Dedicated Student screens (Shop, Cart, Checkout, etc.)
│           ├── parent/                   # 14 Dedicated Parent screens (Funding, Limits, Analytics, etc.)
│           ├── ops/                      # 5 Dedicated Ops screens (Orders, Inventory, Reconciliation)
│           └── college/                  # 2 Dedicated College screens (Aggregated Overview, Reports)
│
├── supabase/
│   └── schema.sql                        # Production Supabase PostgreSQL schema with Row Level Security (RLS)
├── docs/                                 # Authoritative documentation suite
│   ├── context.md                        # Institutional domain context & paise precision
│   ├── agents.md                         # 4 Agent personas, system prompts & permissions
│   ├── suggestions.md                    # Engineering scaling & architecture recommendations
│   ├── addons.md                         # Hardware kiosk, RFID/NFC & WhatsApp specifications
│   ├── vulnerabilities.md                # Threat model, race conditions & RLS audit
│   ├── logs.md                           # Changelog of milestones & transitions
│   └── todo.md                           # Prioritized roadmap
├── .env.example                          # Environment variables template
└── README.md
```

---

## Quick Start (No Python Required)

### 1. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Run the Frontend Development Server
From root:
```bash
npm run dev
```
*Access the UI at `http://localhost:5173`.*

### 3. Run the TypeScript Backend Server (Optional)
```bash
npm run server
```
*Runs on `http://127.0.0.1:8080` powered by `tsx`.*

### 4. Run the TypeScript Integration Test Suite
```bash
npm run test
```
*Runs `backend/test_backend.ts` validating all 18 endpoints, multi-portal roles, and atomic checkout.*

### 5. Build Frontend for Production
```bash
npm run build
```

---

## Connecting Supabase Cloud

Add your credentials to `.env` in the root:
```env
DATABASE_PROVIDER=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Execute [`supabase/schema.sql`](file:///c:/Users/manit/OneDrive/Desktop/Projects/Vyoma/cKart/supabase/schema.sql) in your Supabase SQL Editor to provision tables, indexes, and Row Level Security policies.
