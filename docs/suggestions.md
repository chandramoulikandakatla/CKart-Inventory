# CampusKart — Engineering & Architectural Suggestions

This document outlines high-impact engineering, optimization, and scaling recommendations for advancing CampusKart from pilot status to a nationwide multi-campus platform.

---

## 1. Backend & Database Architecture

### 1.1 Connection Pooling & Persistent Execution
- **Current State**: Standard library HTTP server opens a new SQLite connection per request or creates transient handles.
- **Suggestion**:
  - Implement a persistent database connection pool (e.g., using `SQLAlchemy`, `asyncpg`, or connection-pooled Supabase PostgreSQL).
  - Enable Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) and synchronous normal mode (`PRAGMA synchronous = NORMAL;`) on SQLite to allow high-concurrency concurrent readers alongside single writers.

### 1.2 Database Abstraction Layer (Repository Pattern)
- **Current State**: SQL queries are embedded directly within request handling blocks in `server.py`.
- **Suggestion**:
  - Decouple business logic from persistence using an abstract `DatabaseAdapter` or Repository pattern.
  - This allows swapping seamlessly between SQLite (for local development/testing) and Supabase PostgreSQL (for production) without changing a single line of domain code.

### 1.3 Asynchronous API Framework
- **Current State**: Built-in synchronous `ThreadingHTTPServer` from Python standard library.
- **Suggestion**:
  - Migrate to `FastAPI` or `Starlette` with `Uvicorn` for native `async`/`await` support.
  - Enhances throughput by 10x–20x, handles non-blocking I/O for external Supabase/PostgREST calls, and provides automatic OpenAPI / Swagger documentation.

---

## 2. Security & Identity Management

### 2.1 Cryptographic Timing Attack Mitigation
- **Current State**: `verify_secret` uses `hmac.compare_digest` for password verification, which is good.
- **Suggestion**:
  - Enforce global rate limiting (e.g. max 5 failed attempts per IP / student code per 15 minutes) using an in-memory leaky bucket or Redis token bucket to completely neutralize credential stuffing and brute-force PIN attacks.

### 2.2 JWT Tokens with Asymmetric Key Pairs (RS256)
- **Current State**: HMAC-SHA256 symmetric tokens signed with a shared server secret.
- **Suggestion**:
  - Shift to RS256 or Ed25519 asymmetric signing where Supabase or the Auth service signs tokens with a private key, and microservices/kiosks can verify authenticity locally with a public key without sharing the secret.

---

## 3. Real-Time Capabilities & Infrastructure

### 3.1 Real-Time WebSocket / Server-Sent Events (SSE)
- **Current State**: Frontend uses client polling or shared local storage reactivity.
- **Suggestion**:
  - Leverage Supabase Realtime (PostgreSQL CDC — Change Data Capture) or WebSocket channels for live order status updates (`Preparing` -> `Ready for Collection`) and instant wallet balance notifications.

### 3.2 In-Memory Caching (Redis / Dragonfly)
- **Current State**: Every catalog query executes a SQL `SELECT`.
- **Suggestion**:
  - Cache catalog items by category with cache invalidation triggered whenever an Operations administrator modifies stock or toggles product availability.
