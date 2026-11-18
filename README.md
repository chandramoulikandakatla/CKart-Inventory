# CampusKart — Full-Stack Student Commerce Platform

CampusKart is a high-performance student commerce and pre-funded campus wallet ecosystem engineered for institutional environments (junior colleges, coaching academies, and universities).

---

## Architecture & Directory Structure

```
cKart/
├── backend/
│   ├── schema_sqlite.sql                 # Relational SQLite schema (integer paise precision, foreign keys, check constraints)
│   ├── schema_postgres_supabase.sql      # Production PostgreSQL / Supabase schema with Row Level Security (RLS)
│   ├── server.py                         # ACID-compliant HTTP REST API server using sqlite3 & PBKDF2/HMAC
│   └── test_backend.py                   # Automated full-stack integration test suite
│
├── frontend/
│   ├── package.json                      # React 18, Vite, Lucide-React, Recharts, Tailwind CSS
│   ├── vite.config.ts                    # Vite build and dev server configuration
│   ├── tsconfig.json                     # Strict TypeScript compiler options
│   ├── tailwind.config.js                # Tailwind CSS styling and theme tokens
│   ├── index.html                        # HTML5 entry template
│   └── src/
│       ├── main.tsx                      # React root rendering entry point
│       ├── index.css                     # Base Tailwind stylesheets
│       ├── App.tsx                       # Main coordinated application shell
│       ├── constants/
│       │   └── initialState.ts           # Seed evaluation state, categories & order status constants
│       ├── context/
│       │   └── CampusKartContext.tsx     # Unified reactive state manager and custom hook (`useCampusKart`)
│       ├── services/
│       │   └── api.ts                    # Typed API client for backend integration
│       ├── types/
│       │   └── campuskart.ts             # Domain models & TypeScript interfaces
│       ├── components/
│       │   └── common/
│       │       ├── ShaderBackground.tsx  # Dynamic interactive WebGL/Canvas2D mesh background
│       │       ├── ProductArtwork.tsx    # Category-based SVG product artwork generator
│       │       ├── ToastNotification.tsx # Non-blocking feedback toast system
│       │       ├── ReceiptModal.tsx      # Official transaction & order receipt inspector
│       │       ├── EvaluatorModal.tsx    # Evaluator guide, credentials & demo state reset modal
│       │       └── EvaluatorBar.tsx      # Top ecosystem switcher bar for 4 portals
│       └── pages/
│           ├── student/
│           │   ├── StudentPortal.tsx     # Student sub-nav, quick-jump bar and screen router
│           │   └── screens/              # 16 Dedicated Student screens (Welcome, Auth, Shop, Cart, Checkout, etc.)
│           ├── parent/
│           │   ├── ParentPortal.tsx      # Parent FinTech sub-nav and screen router
│           │   └── screens/              # 14 Dedicated Parent screens (Funding, Limits, Analytics, Statements, etc.)
│           ├── ops/
│           │   ├── OpsPortal.tsx         # Operations control center and tab router
│           │   └── screens/              # 5 Dedicated Ops screens (Overview, Orders, Inventory, Students, Ledger)
│           └── college/
│               ├── CollegePortal.tsx     # Institutional compliance and reporting router
│               └── screens/              # 2 Dedicated College screens (Aggregated Overview, Reports)
│
├── .env.example                          # Environment variables template
└── README.md
```

---

## Running Locally

### 1. Start the Backend API Server
```bash
cd backend
python server.py
```
*Runs on `http://127.0.0.1:8080` by default.*

### 2. Run Backend Integration Tests
```bash
cd backend
python test_backend.py
```

### 3. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
*Access the application at `http://localhost:5173`.*

### 4. Build Frontend for Production
```bash
cd frontend
npm run build
```
