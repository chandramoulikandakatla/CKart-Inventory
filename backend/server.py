#!/usr/bin/env python3
"""
CampusKart High-Performance Modular Backend Server
Authoritative Relational Ledger supporting SQLite (local) and Supabase / PostgreSQL (cloud).
Provides dual-factor auth, integer paise precision, idempotency protection, and role isolation.
"""

import json
import logging
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

# Internal Modules
import config
from security import hash_secret, verify_secret, sign_token, verify_token
from database import DatabaseAdapter, get_database_adapter
from services import AuthService, WalletService, OrderService, StudentService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("campuskart.server")

# For test_backend.py backwards compatibility
DB_PATH = config.DB_PATH


def init_db(db_path: str = config.DB_PATH, seed_catalogue: bool = True) -> None:
    """Initialize database schema and populate seed data."""
    adapter = get_database_adapter(custom_db_path=db_path)
    adapter.init_schema(seed_catalogue=seed_catalogue)
    adapter.close()


class CampusKartAPI(BaseHTTPRequestHandler):
    db_path = config.DB_PATH

    def _get_adapter(self) -> DatabaseAdapter:
        """Obtain a database adapter instance configured for this request."""
        return get_database_adapter(custom_db_path=self.db_path)

    def _send_json(self, status: int, data: dict) -> None:
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", config.ALLOWED_ORIGINS)
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self._send_json(200, {"ok": True})

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return {}

    def _get_auth_payload(self, required_role: str | None = None) -> dict | None:
        auth_header = self.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        payload = verify_token(auth_header[7:].strip())
        if not payload:
            return None
        if required_role and payload.get("role") != required_role:
            return None
        return payload

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        db = self._get_adapter()

        try:
            # 1. Health & Database Provider Status
            if path == "/api/health":
                return self._send_json(200, {
                    "status": "ok",
                    "database": config.DATABASE_PROVIDER,
                    "supabase_configured": bool(config.SUPABASE_URL or config.DATABASE_URL),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })

            # 2. Product Catalogue Discovery
            if path == "/api/products":
                search = (qs.get("search", [""])[0]).strip().lower()
                category = (qs.get("category", ["All"])[0]).strip()
                sort = (qs.get("sort", ["featured"])[0]).strip()
                rows = db.fetchall("SELECT * FROM products WHERE is_available = 1")
                items = []
                for r in rows:
                    if category != "All" and r["category"] != category:
                        continue
                    if search and search not in r["name"].lower() and search not in r["description"].lower():
                        continue
                    items.append(dict(r))

                if sort == "price_asc":
                    items.sort(key=lambda x: x["price_paise"])
                elif sort == "price_desc":
                    items.sort(key=lambda x: -x["price_paise"])
                elif sort == "stock":
                    items.sort(key=lambda x: -x["stock_quantity"])
                else:
                    items.sort(key=lambda x: (-x["is_featured"], x["id"]))
                return self._send_json(200, {"products": items})

            # 3. Student Dashboard
            if path == "/api/student/dashboard":
                payload = self._get_auth_payload("student")
                if not payload or not payload.get("pin_verified"):
                    return self._send_json(401, {"error": "Unauthorized student session"})
                stu = db.fetchone(
                    "SELECT id FROM students WHERE id = ? AND account_status = 'active'",
                    (payload["student_id"],)
                )
                if not stu:
                    return self._send_json(403, {"error": "Student account inactive"})
                bundle = StudentService.build_student_bundle(db, payload["student_id"])
                return self._send_json(200, bundle)

            # 4. Parent Dashboard
            if path == "/api/parent/dashboard":
                payload = self._get_auth_payload("parent")
                if not payload:
                    return self._send_json(401, {"error": "Unauthorized parent session"})
                bundle = StudentService.build_student_bundle(db, payload["student_id"])
                return self._send_json(200, bundle)

            # 5. Operations Control Dashboard
            if path == "/api/ops/dashboard":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                students = db.fetchall(
                    """
                    SELECT s.id, s.student_code, s.first_name, s.last_name, s.academic_year, s.account_status,
                           w.balance_paise, p.parent_name, p.parent_account_id
                    FROM students s
                    JOIN wallets w ON w.student_id = s.id
                    LEFT JOIN parent_links p ON p.student_id = s.id
                    """
                )
                products = db.fetchall("SELECT * FROM products ORDER BY id")
                orders = db.fetchall(
                    """
                    SELECT o.*, s.student_code, s.first_name || ' ' || s.last_name AS student_name
                    FROM orders o JOIN students s ON o.student_id = s.id
                    ORDER BY o.created_at DESC
                    """
                )
                for o in orders:
                    o["items"] = db.fetchall("SELECT * FROM order_items WHERE order_id = ?", (o["id"],))
                txns = db.fetchall(
                    """
                    SELECT t.*, s.student_code
                    FROM wallet_transactions t JOIN students s ON t.student_id = s.id
                    ORDER BY t.created_at DESC
                    """
                )
                return self._send_json(200, {
                    "students": students,
                    "products": products,
                    "orders": orders,
                    "transactions": txns,
                })

            # 6. College Institutional Dashboard (Aggregated Only — Privacy Preserving)
            if path == "/api/college/dashboard":
                payload = self._get_auth_payload("college")
                if not payload:
                    return self._send_json(403, {"error": "College administrator authorization required"})
                cid = payload["college_id"]
                r1 = db.fetchone("SELECT COUNT(*) as cnt FROM students WHERE college_id = ?", (cid,))
                r2 = db.fetchone("SELECT COUNT(*) as cnt FROM students WHERE college_id = ? AND account_status = 'active'", (cid,))
                r3 = db.fetchone("SELECT COUNT(*) as cnt FROM orders WHERE college_id = ?", (cid,))
                r4 = db.fetchone("SELECT COALESCE(SUM(total_amount_paise), 0) as spend FROM orders WHERE college_id = ? AND payment_status = 'paid'", (cid,))
                r5 = db.fetchone(
                    """
                    SELECT COALESCE(SUM(t.amount_paise), 0) as funded
                    FROM wallet_transactions t JOIN students s ON t.student_id = s.id
                    WHERE s.college_id = ? AND t.transaction_type = 'funding' AND t.status = 'completed'
                    """,
                    (cid,),
                )
                cat_rows = db.fetchall(
                    """
                    SELECT oi.category_snapshot AS category, SUM(oi.subtotal_paise) AS amount_paise
                    FROM order_items oi JOIN orders o ON oi.order_id = o.id
                    WHERE o.college_id = ? AND o.fulfilment_status != 'Cancelled'
                    GROUP BY oi.category_snapshot
                    """,
                    (cid,),
                )
                return self._send_json(200, {
                    "college_id": cid,
                    "total_students": r1["cnt"] if r1 else 0,
                    "active_students": r2["cnt"] if r2 else 0,
                    "total_orders": r3["cnt"] if r3 else 0,
                    "aggregate_order_volume_paise": r4["spend"] if r4 else 0,
                    "aggregate_wallet_funding_paise": r5["funded"] if r5 else 0,
                    "category_distribution": cat_rows,
                })

            return self._send_json(404, {"error": "Endpoint not found"})
        finally:
            db.close()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        db = self._get_adapter()

        try:
            body = self._read_body()

            # 1. Student Auth Step 1 (Credentials)
            if path == "/api/auth/login":
                status, data = AuthService.student_login_step1(
                    db,
                    str(body.get("student_code", "")),
                    str(body.get("password", ""))
                )
                return self._send_json(status, data)

            # 2. Student Auth Step 2 (PIN Verification)
            if path == "/api/auth/verify-pin":
                status, data = AuthService.student_login_step2_pin(
                    db,
                    str(body.get("pre_auth_token", "")),
                    str(body.get("pin", ""))
                )
                return self._send_json(status, data)

            # 3. Independent Parent Auth
            if path == "/api/parent/auth/login":
                status, data = AuthService.parent_login(
                    db,
                    str(body.get("student_code", "")),
                    str(body.get("parent_pin", ""))
                )
                return self._send_json(status, data)

            # 4. Operations Auth
            if path == "/api/ops/auth/login":
                status, data = AuthService.ops_login(str(body.get("operator_id", "OPS-ADMIN-01")))
                return self._send_json(status, data)

            # 5. College Admin Auth
            if path == "/api/college/auth/login":
                status, data = AuthService.college_login(str(body.get("college_id", "col-scna-01")))
                return self._send_json(status, data)

            # 6. Parent Funding (Atomic Credit)
            if path == "/api/parent/fund":
                payload = self._get_auth_payload("parent")
                if not payload:
                    return self._send_json(403, {"error": "Parent authorization required"})
                status, data = WalletService.fund_wallet(
                    db,
                    payload,
                    int(body.get("amount_paise", 0)),
                    str(body.get("method", "UPI (Simulated)"))
                )
                return self._send_json(status, data)

            # 7. Parent Spending Controls
            if path == "/api/parent/spending-controls":
                payload = self._get_auth_payload("parent")
                if not payload:
                    return self._send_json(403, {"error": "Parent authorization required"})
                sid = payload["student_id"]
                daily = body.get("daily_limit_paise")
                weekly = body.get("weekly_limit_paise")
                monthly = body.get("monthly_limit_paise")
                restricted = json.dumps(body.get("category_restrictions", []))
                enabled = 1 if body.get("enabled", True) else 0
                db.execute(
                    """
                    UPDATE spending_controls
                    SET daily_limit_paise = ?, weekly_limit_paise = ?, monthly_limit_paise = ?, category_restrictions_json = ?, enabled = ?, updated_at = datetime('now')
                    WHERE student_id = ?
                    """,
                    (daily, weekly, monthly, restricted, enabled, sid),
                )
                return self._send_json(200, {"ok": True})

            # 8. Student Atomic Checkout
            if path == "/api/checkout":
                payload = self._get_auth_payload("student")
                if not payload or not payload.get("pin_verified"):
                    return self._send_json(401, {"error": "Student authorization required"})
                status, data = OrderService.checkout(db, payload, body)
                return self._send_json(status, data)

            # 9. Operations: Order Status Update
            if path == "/api/ops/orders/status":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                status, data = OrderService.update_order_status(
                    db,
                    payload,
                    str(body.get("order_id", "")),
                    str(body.get("status", ""))
                )
                return self._send_json(status, data)

            # 10. Operations: Inventory Stock Update
            if path == "/api/ops/products/update":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                status, data = OrderService.update_product_inventory(
                    db,
                    str(body.get("product_id", "")),
                    int(body.get("stock_quantity", 0)),
                    bool(body.get("is_available", True))
                )
                return self._send_json(status, data)

            # 11. Operations: Audited Wallet Adjustment
            if path == "/api/ops/wallet/adjust":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                status, data = WalletService.adjust_wallet_audited(
                    db,
                    payload,
                    str(body.get("student_id", "")),
                    int(body.get("amount_paise", 0)),
                    str(body.get("direction", "credit")),
                    str(body.get("transaction_type", "adjustment")),
                    str(body.get("reason", ""))
                )
                return self._send_json(status, data)

            return self._send_json(404, {"error": "Endpoint not found"})
        finally:
            db.close()


if __name__ == "__main__":
    init_db(config.DB_PATH, seed_catalogue=True)
    logger.info(f"CampusKart Modular Backend ({config.DATABASE_PROVIDER.upper()}) running on http://{config.HOST}:{config.PORT}")
    ThreadingHTTPServer((config.HOST, config.PORT), CampusKartAPI).serve_forever()
