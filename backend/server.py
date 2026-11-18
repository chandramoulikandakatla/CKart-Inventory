#!/usr/bin/env python3
"""
CampusKart Full-Ecosystem Backend Server (Student + Parent + Operations + College)
Authoritative SQLite3 ACID database with role-based access control, PBKDF2-HMAC auth,
integer paise accounting, idempotency protection, and zero fabricated student activity.
"""

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMA_PATH = os.path.join(BASE_DIR, "schema_sqlite.sql")
DB_PATH = os.environ.get("CAMPUSKART_DB_PATH", os.path.join(BASE_DIR, "campuskart.db"))
SESSION_SECRET = os.environ.get("CAMPUSKART_SESSION_SECRET", secrets.token_hex(32)).encode("utf-8")


def hash_secret(secret: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", secret.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return f"{salt}${digest}"


def verify_secret(secret: str, stored: str) -> bool:
    try:
        salt, expected = stored.split("$", 1)
        actual = hashlib.pbkdf2_hmac("sha256", secret.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def sign_token(payload: dict) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    b64 = raw.hex()
    sig = hmac.new(SESSION_SECRET, b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{b64}.{sig}"


def verify_token(token: str) -> dict | None:
    try:
        b64, sig = token.split(".", 1)
        expected = hmac.new(SESSION_SECRET, b64.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(bytes.fromhex(b64).decode("utf-8"))
        if payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
            return None
        return payload
    except Exception:
        return None


def get_conn(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(db_path: str = DB_PATH, seed_catalogue: bool = True) -> None:
    conn = get_conn(db_path)
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())

    if seed_catalogue:
        existing_colleges = conn.execute("SELECT COUNT(*) FROM colleges").fetchone()[0]
        if existing_colleges == 0:
            college_id = "col-scna-01"
            conn.execute(
                """
                INSERT INTO colleges (id, name, institution_code, status, pilot_window, collection_points_json)
                VALUES (?, ?, ?, 'active', ?, ?)
                """,
                (
                    college_id,
                    "Sri Chaitanya & Narayana Junior Academy",
                    "SCNA-HYD-01",
                    "12:30 PM – 01:45 PM (Lunch) & 04:15 PM – 05:30 PM (Dispersal)",
                    json.dumps([
                        "Block A — Ground Floor Smart Kiosk #1",
                        "Block B — Academic Wing Counter #2",
                        "Hostel Gate Dispensary #3",
                    ]),
                ),
            )

            # Empty-State-First: ZERO fabricated purchases, ZERO transactions, ₹0.00 balance
            demo_students = [
                ("stu-101", college_id, "CK-2026-101", "Aarav", "Sharma", "Intermediate Second Year (MPC)", "active", "PASS101", "1234", "Rajesh Sharma", "9999"),
                ("stu-102", college_id, "CK-2026-102", "Diya", "Reddy", "Intermediate First Year (BiPC)", "active", "PASS102", "5678", "Lakshmi Reddy", "8888"),
                ("stu-103", college_id, "CK-2026-103", "Rohan", "Verma", "Intermediate Second Year (MPC)", "inactive", "PASS103", "4321", "Vikram Verma", "7777"),
            ]
            for sid, cid, code, fn, ln, yr, st, pw, pin, parent_name, parent_pin in demo_students:
                conn.execute(
                    """
                    INSERT INTO students (id, college_id, student_code, first_name, last_name, academic_year, account_status, password_hash, pin_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (sid, cid, code, fn, ln, yr, st, hash_secret(pw), hash_secret(pin)),
                )
                conn.execute(
                    "INSERT INTO wallets (id, student_id, balance_paise, currency, status) VALUES (?, ?, 0, 'INR', 'active')",
                    (f"wal-{sid}", sid),
                )
                conn.execute(
                    """
                    INSERT INTO spending_controls (id, student_id, daily_limit_paise, weekly_limit_paise, monthly_limit_paise, category_restrictions_json, enabled)
                    VALUES (?, ?, 50000, 200000, 500000, '[]', 1)
                    """,
                    (f"ctrl-{sid}", sid),
                )
                conn.execute(
                    """
                    INSERT INTO parent_links (id, student_id, parent_account_id, parent_name, parent_pin_hash, relationship, status)
                    VALUES (?, ?, ?, ?, ?, 'Parent / Guardian', 'verified')
                    """,
                    (f"plink-{sid}", sid, f"par-{sid}", parent_name, hash_secret(parent_pin)),
                )

            approved_products = [
                ("PRD-001", college_id, "Whole Wheat Paneer Tikka Wrap", "Fresh grilled cottage cheese cubes with mint chutney in a toasted whole-wheat wrap.", "Food and Snacks", "wrap", 9000, 18, 1, 1, "Lunch Special"),
                ("PRD-002", college_id, "Roasted Almond & Oats Energy Bar", "High-protein study snack with Californian almonds, rolled oats, and organic honey.", "Food and Snacks", "bar", 6000, 35, 1, 0, "Zero Added Sugar"),
                ("PRD-003", college_id, "Chilled Badam Milk & Saffron (200ml)", "Sterilized farm-fresh milk blended with crushed almonds and Kashmir saffron.", "Beverages", "milk", 4500, 25, 1, 1, "Bestseller"),
                ("PRD-004", college_id, "Electrolyte Tender Coconut Water (250ml)", "100% natural tender coconut water with zero preservatives.", "Beverages", "coconut", 5000, 22, 1, 0, "Hydration+"),
                ("PRD-005", college_id, "Classmate Pulse Spiral Notebook (300p)", "70 GSM high-opacity smooth paper for physics derivations & lecture notes.", "Academic Supplies", "notebook", 12000, 40, 1, 1, "JEE/NEET Prep"),
                ("PRD-006", college_id, "Pentonic Gel & Ball Exam Pen Kit (5-Pack)", "Ultra-low viscosity waterproof ink pens for fast exam writing.", "Academic Supplies", "pens", 7500, 50, 1, 0, "Exam Ready"),
                ("PRD-007", college_id, "Dettol Pocket Sanitizer & Wipes Combo", "Herbal hand sanitizer (50ml) paired with 20 antibacterial wipes.", "Personal Care", "hygiene", 8500, 15, 1, 0, "Hygiene"),
                ("PRD-008", college_id, "Nivea Lip Care & Face Wash Travel Pack", "Compact hostel grooming kit with SPF-15 lip balm & oil-control face wash.", "Personal Care", "care", 14000, 4, 1, 0, "Low Stock"),
                ("PRD-009", college_id, "Insulated Stainless Steel Flask (500ml)", "Double-wall vacuum insulated bottle for hot/cold campus hydration.", "Daily Essentials", "flask", 25000, 12, 1, 1, "Campus Essential"),
                ("PRD-010", college_id, "Scientific Exam Pad & Geometry Pouch", "Transparent examination clipboard with non-slip clip & mesh pouch.", "Daily Essentials", "pad", 16000, 0, 1, 0, "Out of Stock"),
                ("PRD-011", college_id, "Lab Record Printing Voucher (50 Pages)", "Prepaid reprographics voucher for B&W/color diagram printing at Block B.", "Other Services", "print", 10000, 100, 1, 1, "Instant Redeem"),
            ]
            for pid, cid, name, desc, cat, img, price_p, stock, avail, feat, tag in approved_products:
                conn.execute(
                    """
                    INSERT INTO products (id, college_id, name, description, category, image_url, price_paise, stock_quantity, is_available, is_featured, offer_tag)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (pid, cid, name, desc, cat, img, price_p, stock, avail, feat, tag),
                )
    conn.close()


class CampusKartAPI(BaseHTTPRequestHandler):
    db_path = DB_PATH

    def _send_json(self, status: int, data: dict) -> None:
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self._send_json(200, {"ok": True})

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

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

    def _build_student_bundle(self, conn: sqlite3.Connection, sid: str) -> dict:
        student = conn.execute("SELECT * FROM students WHERE id = ?", (sid,)).fetchone()
        college = dict(conn.execute("SELECT id, name, institution_code, pilot_window, collection_points_json FROM colleges WHERE id = ?", (student["college_id"],)).fetchone())
        wallet = dict(conn.execute("SELECT id, balance_paise, currency, status, updated_at FROM wallets WHERE student_id = ?", (sid,)).fetchone())
        controls = dict(conn.execute("SELECT * FROM spending_controls WHERE student_id = ?", (sid,)).fetchone())
        parent_link = dict(conn.execute("SELECT parent_account_id, parent_name, relationship, status FROM parent_links WHERE student_id = ?", (sid,)).fetchone())

        txns = [dict(r) for r in conn.execute("SELECT * FROM wallet_transactions WHERE student_id = ? ORDER BY created_at DESC", (sid,)).fetchall()]
        orders = [dict(r) for r in conn.execute("SELECT * FROM orders WHERE student_id = ? ORDER BY created_at DESC", (sid,)).fetchall()]
        for o in orders:
            o["items"] = [dict(it) for it in conn.execute("SELECT * FROM order_items WHERE order_id = ?", (o["id"],)).fetchall()]
        notifs = [dict(r) for r in conn.execute("SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC", (sid,)).fetchall()]

        total_spent_paise = sum(t["amount_paise"] for t in txns if t["transaction_type"] == "purchase" and t["status"] == "completed")
        total_funded_paise = sum(t["amount_paise"] for t in txns if t["transaction_type"] in ("funding", "refund") and t["status"] == "completed")
        purchase_txns = [t for t in txns if t["transaction_type"] == "purchase" and t["status"] == "completed"]
        avg_txn_paise = int(total_spent_paise / len(purchase_txns)) if purchase_txns else 0

        cat_totals: dict[str, int] = {}
        for o in orders:
            if o["fulfilment_status"] == "Cancelled":
                continue
            for it in o["items"]:
                cat = it["category_snapshot"]
                cat_totals[cat] = cat_totals.get(cat, 0) + it["subtotal_paise"]

        return {
            "student": {
                "id": student["id"],
                "student_code": student["student_code"],
                "first_name": student["first_name"],
                "last_name": student["last_name"],
                "academic_year": student["academic_year"],
                "account_status": student["account_status"],
                "college": college,
                "parent_link": parent_link,
            },
            "wallet": wallet,
            "spending_controls": controls,
            "metrics": {
                "total_spent_paise": total_spent_paise,
                "total_funded_paise": total_funded_paise,
                "purchase_count": len(purchase_txns),
                "transaction_count": len(txns),
                "avg_transaction_paise": avg_txn_paise,
                "category_spending": [{"category": k, "amount_paise": v} for k, v in cat_totals.items()],
            },
            "recent_orders": orders[:5],
            "orders": orders,
            "transactions": txns,
            "notifications": notifs,
        }

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        conn = get_conn(self.db_path)

        try:
            if path == "/api/health":
                return self._send_json(200, {"status": "ok", "database": "sqlite3"})

            if path == "/api/products":
                search = (qs.get("search", [""])[0]).strip().lower()
                category = (qs.get("category", ["All"])[0]).strip()
                sort = (qs.get("sort", ["featured"])[0]).strip()
                rows = conn.execute("SELECT * FROM products WHERE is_available = 1").fetchall()
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

            # STUDENT DASHBOARD
            if path == "/api/student/dashboard":
                payload = self._get_auth_payload("student")
                if not payload or not payload.get("pin_verified"):
                    return self._send_json(401, {"error": "Unauthorized student session"})
                stu = conn.execute("SELECT id FROM students WHERE id = ? AND account_status = 'active'", (payload["student_id"],)).fetchone()
                if not stu:
                    return self._send_json(403, {"error": "Student account inactive"})
                return self._send_json(200, self._build_student_bundle(conn, payload["student_id"]))

            # PARENT DASHBOARD
            if path == "/api/parent/dashboard":
                payload = self._get_auth_payload("parent")
                if not payload:
                    return self._send_json(401, {"error": "Unauthorized parent session"})
                return self._send_json(200, self._build_student_bundle(conn, payload["student_id"]))

            # OPERATIONS DASHBOARD
            if path == "/api/ops/dashboard":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                students = [
                    dict(r)
                    for r in conn.execute(
                        """
                        SELECT s.id, s.student_code, s.first_name, s.last_name, s.academic_year, s.account_status,
                               w.balance_paise, p.parent_name, p.parent_account_id
                        FROM students s
                        JOIN wallets w ON w.student_id = s.id
                        LEFT JOIN parent_links p ON p.student_id = s.id
                        """
                    ).fetchall()
                ]
                products = [dict(r) for r in conn.execute("SELECT * FROM products ORDER BY id").fetchall()]
                orders = [dict(r) for r in conn.execute("SELECT o.*, s.student_code, s.first_name || ' ' || s.last_name AS student_name FROM orders o JOIN students s ON o.student_id = s.id ORDER BY o.created_at DESC").fetchall()]
                for o in orders:
                    o["items"] = [dict(it) for it in conn.execute("SELECT * FROM order_items WHERE order_id = ?", (o["id"],)).fetchall()]
                txns = [dict(r) for r in conn.execute("SELECT t.*, s.student_code FROM wallet_transactions t JOIN students s ON t.student_id = s.id ORDER BY t.created_at DESC").fetchall()]
                return self._send_json(200, {
                    "students": students,
                    "products": products,
                    "orders": orders,
                    "transactions": txns,
                })

            # COLLEGE INSTITUTIONAL DASHBOARD (AGGREGATED ONLY — STRICT PRIVACY)
            if path == "/api/college/dashboard":
                payload = self._get_auth_payload("college")
                if not payload:
                    return self._send_json(403, {"error": "College administrator authorization required"})
                cid = payload["college_id"]
                total_students = conn.execute("SELECT COUNT(*) FROM students WHERE college_id = ?", (cid,)).fetchone()[0]
                active_students = conn.execute("SELECT COUNT(*) FROM students WHERE college_id = ? AND account_status = 'active'", (cid,)).fetchone()[0]
                total_orders = conn.execute("SELECT COUNT(*) FROM orders WHERE college_id = ?", (cid,)).fetchone()[0]
                agg_spend_paise = conn.execute("SELECT COALESCE(SUM(total_amount_paise), 0) FROM orders WHERE college_id = ? AND payment_status = 'paid'", (cid,)).fetchone()[0]
                agg_funded_paise = conn.execute(
                    """
                    SELECT COALESCE(SUM(t.amount_paise), 0)
                    FROM wallet_transactions t JOIN students s ON t.student_id = s.id
                    WHERE s.college_id = ? AND t.transaction_type = 'funding' AND t.status = 'completed'
                    """,
                    (cid,),
                ).fetchone()[0]
                cat_rows = conn.execute(
                    """
                    SELECT oi.category_snapshot AS category, SUM(oi.subtotal_paise) AS amount_paise
                    FROM order_items oi JOIN orders o ON oi.order_id = o.id
                    WHERE o.college_id = ? AND o.fulfilment_status != 'Cancelled'
                    GROUP BY oi.category_snapshot
                    """,
                    (cid,),
                ).fetchall()
                return self._send_json(200, {
                    "college_id": cid,
                    "total_students": total_students,
                    "active_students": active_students,
                    "total_orders": total_orders,
                    "aggregate_order_volume_paise": agg_spend_paise,
                    "aggregate_wallet_funding_paise": agg_funded_paise,
                    "category_distribution": [dict(r) for r in cat_rows],
                })

            return self._send_json(404, {"error": "Endpoint not found"})
        finally:
            conn.close()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        conn = get_conn(self.db_path)

        try:
            body = self._read_body()

            # 1. STUDENT AUTH STEP 1
            if path == "/api/auth/login":
                code = str(body.get("student_code", "")).strip().upper()
                password = str(body.get("password", ""))
                row = conn.execute(
                    "SELECT s.*, c.name AS college_name FROM students s JOIN colleges c ON s.college_id = c.id WHERE UPPER(s.student_code) = ?",
                    (code,),
                ).fetchone()
                if not row:
                    return self._send_json(401, {"error": "Student ID not found."})
                if row["account_status"] != "active":
                    return self._send_json(403, {"error": f"Account {row['student_code']} is {row['account_status']}."})
                if not verify_secret(password, row["password_hash"]):
                    return self._send_json(401, {"error": "Invalid student password."})

                pre_token = sign_token({"role": "student", "student_id": row["id"], "pin_verified": False, "exp": datetime.now(timezone.utc).timestamp() + 600})
                return self._send_json(200, {
                    "pre_auth_token": pre_token,
                    "student_preview": {
                        "student_code": row["student_code"],
                        "first_name": row["first_name"],
                        "last_name": row["last_name"],
                        "academic_year": row["academic_year"],
                        "college_name": row["college_name"],
                    },
                })

            # 2. STUDENT AUTH STEP 2 (PIN)
            if path == "/api/auth/verify-pin":
                payload = verify_token(str(body.get("pre_auth_token", "")))
                pin = str(body.get("pin", "")).strip()
                if not payload or payload.get("role") != "student":
                    return self._send_json(401, {"error": "Session expired."})
                row = conn.execute("SELECT * FROM students WHERE id = ? AND account_status = 'active'", (payload["student_id"],)).fetchone()
                if not row or not verify_secret(pin, row["pin_hash"]):
                    return self._send_json(401, {"error": "Incorrect CampusKart PIN."})
                session_token = sign_token({"role": "student", "student_id": row["id"], "pin_verified": True, "exp": datetime.now(timezone.utc).timestamp() + 86400})
                return self._send_json(200, {"session_token": session_token})

            # 3. INDEPENDENT PARENT AUTH
            if path == "/api/parent/auth/login":
                code = str(body.get("student_code", "")).strip().upper()
                parent_pin = str(body.get("parent_pin", "")).strip()
                row = conn.execute(
                    """
                    SELECT s.id AS student_id, s.student_code, p.parent_account_id, p.parent_name, p.parent_pin_hash
                    FROM students s JOIN parent_links p ON p.student_id = s.id
                    WHERE UPPER(s.student_code) = ? AND p.status = 'verified'
                    """,
                    (code,),
                ).fetchone()
                if not row or not verify_secret(parent_pin, row["parent_pin_hash"]):
                    return self._send_json(401, {"error": "Invalid linked Student ID or Parent Access PIN."})
                token = sign_token({
                    "role": "parent",
                    "student_id": row["student_id"],
                    "parent_account_id": row["parent_account_id"],
                    "exp": datetime.now(timezone.utc).timestamp() + 86400,
                })
                return self._send_json(200, {"session_token": token, "parent_name": row["parent_name"]})

            # 4. OPERATIONS AUTH
            if path == "/api/ops/auth/login":
                operator_id = str(body.get("operator_id", "OPS-ADMIN-01")).strip()
                token = sign_token({"role": "ops", "operator_id": operator_id, "exp": datetime.now(timezone.utc).timestamp() + 86400})
                return self._send_json(200, {"session_token": token, "operator_id": operator_id})

            # 5. COLLEGE ADMIN AUTH
            if path == "/api/college/auth/login":
                token = sign_token({"role": "college", "college_id": "col-scna-01", "exp": datetime.now(timezone.utc).timestamp() + 86400})
                return self._send_json(200, {"session_token": token, "college_id": "col-scna-01"})

            # 6. PARENT FUNDING (ATOMIC CREDIT)
            if path == "/api/parent/fund":
                payload = self._get_auth_payload("parent")
                if not payload:
                    return self._send_json(403, {"error": "Parent authorization required"})
                sid = payload["student_id"]
                amount_paise = int(body.get("amount_paise", 0))
                method = str(body.get("method", "UPI (Simulated)"))
                if amount_paise <= 0 or amount_paise > 2_500_000:
                    return self._send_json(400, {"error": "Invalid funding amount."})

                conn.execute("BEGIN IMMEDIATE")
                try:
                    wallet = conn.execute("SELECT * FROM wallets WHERE student_id = ?", (sid,)).fetchone()
                    prev_bal = wallet["balance_paise"]
                    new_bal = prev_bal + amount_paise
                    ref = f"CK-SIM-FUND-{uuid.uuid4().hex[:8].upper()}"
                    conn.execute("UPDATE wallets SET balance_paise = ?, updated_at = datetime('now') WHERE id = ?", (new_bal, wallet["id"]))
                    conn.execute(
                        """
                        INSERT INTO wallet_transactions
                        (id, wallet_id, student_id, transaction_type, amount_paise, direction, previous_balance_paise, new_balance_paise, status, reference, related_order_id, initiating_user_id, description, is_simulated)
                        VALUES (?, ?, ?, 'funding', ?, 'credit', ?, ?, 'completed', ?, NULL, ?, ?, 1)
                        """,
                        (f"txn-{uuid.uuid4().hex[:10]}", wallet["id"], sid, amount_paise, prev_bal, new_bal, ref, payload["parent_account_id"], f"Simulated Parent Funding via {method}"),
                    )
                    conn.execute(
                        "INSERT INTO notifications (id, student_id, type, title, message) VALUES (?, ?, 'wallet', 'Wallet Funded Successfully', ?)",
                        (f"notif-{uuid.uuid4().hex[:8]}", sid, f"₹{amount_paise / 100:.2f} credited via {method} (Simulated). Ref: {ref}"),
                    )
                    conn.execute("COMMIT")
                    return self._send_json(200, {"reference": ref, "previous_balance_paise": prev_bal, "new_balance_paise": new_bal})
                except Exception as exc:
                    conn.execute("ROLLBACK")
                    return self._send_json(500, {"error": str(exc)})

            # 7. PARENT SPENDING CONTROLS PERSISTENCE
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
                conn.execute(
                    """
                    UPDATE spending_controls
                    SET daily_limit_paise = ?, weekly_limit_paise = ?, monthly_limit_paise = ?, category_restrictions_json = ?, enabled = ?, updated_at = datetime('now')
                    WHERE student_id = ?
                    """,
                    (daily, weekly, monthly, restricted, enabled, sid),
                )
                return self._send_json(200, {"ok": True})

            # 8. STUDENT ATOMIC CHECKOUT
            if path == "/api/checkout":
                payload = self._get_auth_payload("student")
                if not payload or not payload.get("pin_verified"):
                    return self._send_json(401, {"error": "Student authorization required"})
                sid = payload["student_id"]
                student = conn.execute("SELECT * FROM students WHERE id = ? AND account_status = 'active'", (sid,)).fetchone()
                if not student:
                    return self._send_json(403, {"error": "Student account inactive"})

                items_req = body.get("items", [])
                fulfilment_method = str(body.get("fulfilment_method", "Campus Kiosk Pickup"))
                collection_point = str(body.get("collection_point", "Block A — Ground Floor Smart Kiosk #1"))
                idempotency_key = str(body.get("idempotency_key", "")).strip() or uuid.uuid4().hex
                simulate_failure = bool(body.get("simulate_failure", False))

                if not items_req:
                    return self._send_json(400, {"error": "Cart is empty."})

                conn.execute("BEGIN IMMEDIATE")
                try:
                    existing_attempt = conn.execute("SELECT * FROM payment_attempts WHERE idempotency_key = ?", (idempotency_key,)).fetchone()
                    if existing_attempt:
                        if existing_attempt["status"] == "succeeded":
                            existing_order = dict(conn.execute("SELECT * FROM orders WHERE id = ?", (existing_attempt["related_order_id"],)).fetchone())
                            conn.execute("ROLLBACK")
                            return self._send_json(200, {"duplicate": True, "order": existing_order, "reference": existing_attempt["reference"]})
                        conn.execute("ROLLBACK")
                        return self._send_json(409, {"error": f"Duplicate payment attempt already {existing_attempt['status']}."})

                    total_paise = 0
                    validated_items = []
                    for req_it in items_req:
                        pid = str(req_it.get("product_id", ""))
                        qty = int(req_it.get("quantity", 0))
                        if qty <= 0:
                            conn.execute("ROLLBACK")
                            return self._send_json(400, {"error": "Quantity must be >= 1."})
                        prod = conn.execute("SELECT * FROM products WHERE id = ?", (pid,)).fetchone()
                        if not prod or not prod["is_available"]:
                            conn.execute("ROLLBACK")
                            return self._send_json(400, {"error": f"Product {pid} is unavailable."})
                        if prod["stock_quantity"] < qty:
                            conn.execute("ROLLBACK")
                            return self._send_json(400, {"error": f"Insufficient stock for {prod['name']}."})
                        sub = prod["price_paise"] * qty
                        total_paise += sub
                        validated_items.append((prod, qty, sub))

                    wallet = conn.execute("SELECT * FROM wallets WHERE student_id = ?", (sid,)).fetchone()
                    if wallet["balance_paise"] < total_paise:
                        conn.execute("ROLLBACK")
                        return self._send_json(402, {"error": "Insufficient wallet balance.", "shortfall_paise": total_paise - wallet["balance_paise"]})

                    ctrl = conn.execute("SELECT * FROM spending_controls WHERE student_id = ?", (sid,)).fetchone()
                    if ctrl and ctrl["enabled"]:
                        restricted = json.loads(ctrl["category_restrictions_json"] or "[]")
                        for prod, _, _ in validated_items:
                            if prod["category"] in restricted:
                                conn.execute("ROLLBACK")
                                return self._send_json(403, {"error": f"Category '{prod['category']}' is restricted by Parent Spending Controls."})
                        if ctrl["daily_limit_paise"] is not None:
                            today_spent = conn.execute(
                                "SELECT COALESCE(SUM(amount_paise), 0) FROM wallet_transactions WHERE student_id = ? AND transaction_type = 'purchase' AND status = 'completed' AND date(created_at) = date('now')",
                                (sid,),
                            ).fetchone()[0]
                            if today_spent + total_paise > ctrl["daily_limit_paise"]:
                                conn.execute("ROLLBACK")
                                return self._send_json(403, {"error": f"Exceeds daily spending limit of ₹{ctrl['daily_limit_paise'] / 100:.2f}."})

                    if simulate_failure:
                        conn.execute(
                            "INSERT INTO payment_attempts (id, student_id, idempotency_key, requested_amount_paise, status, failure_reason) VALUES (?, ?, ?, ?, 'failed', 'Simulated failure')",
                            (f"att-{uuid.uuid4().hex[:8]}", sid, idempotency_key, total_paise),
                        )
                        conn.execute("COMMIT")
                        return self._send_json(402, {"error": "Simulated payment failure: Wallet was NOT debited."})

                    order_id = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}"
                    ref = f"CK-SIM-PAY-{uuid.uuid4().hex[:8].upper()}"
                    prev_bal = wallet["balance_paise"]
                    new_bal = prev_bal - total_paise

                    conn.execute(
                        "INSERT INTO orders (id, student_id, college_id, total_amount_paise, payment_status, fulfilment_status, fulfilment_method, collection_point, idempotency_key, is_simulated) VALUES (?, ?, ?, ?, 'paid', 'Order Placed', ?, ?, ?, 1)",
                        (order_id, sid, student["college_id"], total_paise, fulfilment_method, collection_point, idempotency_key),
                    )
                    for prod, qty, sub in validated_items:
                        conn.execute(
                            "INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, category_snapshot, unit_price_snapshot_paise, quantity, subtotal_paise) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            (f"oi-{uuid.uuid4().hex[:8]}", order_id, prod["id"], prod["name"], prod["category"], prod["price_paise"], qty, sub),
                        )
                        conn.execute("UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = datetime('now') WHERE id = ?", (qty, prod["id"]))

                    conn.execute("UPDATE wallets SET balance_paise = ?, updated_at = datetime('now') WHERE id = ?", (new_bal, wallet["id"]))
                    conn.execute(
                        "INSERT INTO wallet_transactions (id, wallet_id, student_id, transaction_type, amount_paise, direction, previous_balance_paise, new_balance_paise, status, reference, related_order_id, initiating_user_id, description, is_simulated) VALUES (?, ?, ?, 'purchase', ?, 'debit', ?, ?, 'completed', ?, ?, ?, ?, 1)",
                        (f"txn-{uuid.uuid4().hex[:10]}", wallet["id"], sid, total_paise, prev_bal, new_bal, ref, order_id, sid, f"Order {order_id}"),
                    )
                    conn.execute(
                        "INSERT INTO payment_attempts (id, student_id, idempotency_key, requested_amount_paise, status, related_order_id, reference) VALUES (?, ?, ?, ?, 'succeeded', ?, ?)",
                        (f"att-{uuid.uuid4().hex[:8]}", sid, idempotency_key, total_paise, order_id, ref),
                    )
                    conn.execute(
                        "INSERT INTO notifications (id, student_id, type, title, message) VALUES (?, ?, 'order', ?, ?)",
                        (f"notif-{uuid.uuid4().hex[:8]}", sid, f"Order Confirmed ({order_id})", f"₹{total_paise / 100:.2f} debited via simulated wallet. Ref: {ref}"),
                    )
                    conn.execute("COMMIT")
                    return self._send_json(200, {"order_id": order_id, "reference": ref, "total_amount_paise": total_paise, "previous_balance_paise": prev_bal, "new_balance_paise": new_bal})
                except Exception as exc:
                    conn.execute("ROLLBACK")
                    return self._send_json(500, {"error": str(exc)})

            # 9. OPERATIONS: ORDER STATUS UPDATE
            if path == "/api/ops/orders/status":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                order_id = str(body.get("order_id", ""))
                status = str(body.get("status", ""))
                ord_row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
                if not ord_row:
                    return self._send_json(404, {"error": "Order not found."})
                conn.execute("UPDATE orders SET fulfilment_status = ?, updated_at = datetime('now') WHERE id = ?", (status, order_id))
                conn.execute(
                    "INSERT INTO notifications (id, student_id, type, title, message) VALUES (?, ?, 'order', ?, ?)",
                    (f"notif-{uuid.uuid4().hex[:8]}", ord_row["student_id"], f"Order {order_id} Updated", f"Order status updated to '{status}' by {payload['operator_id']}."),
                )
                return self._send_json(200, {"ok": True, "order_id": order_id, "status": status})

            # 10. OPERATIONS: INVENTORY UPDATE
            if path == "/api/ops/products/update":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                pid = str(body.get("product_id", ""))
                stock = int(body.get("stock_quantity", 0))
                avail = 1 if body.get("is_available", True) else 0
                conn.execute("UPDATE products SET stock_quantity = ?, is_available = ?, updated_at = datetime('now') WHERE id = ?", (max(0, stock), avail, pid))
                return self._send_json(200, {"ok": True})

            # 11. OPERATIONS: AUDITED WALLET ADJUSTMENT
            if path == "/api/ops/wallet/adjust":
                payload = self._get_auth_payload("ops")
                if not payload:
                    return self._send_json(403, {"error": "Operations authorization required"})
                sid = str(body.get("student_id", ""))
                amount_paise = int(body.get("amount_paise", 0))
                direction = str(body.get("direction", "credit"))
                txn_type = str(body.get("transaction_type", "adjustment"))
                reason = str(body.get("reason", "")).strip()
                if amount_paise <= 0 or not reason:
                    return self._send_json(400, {"error": "Positive amount and mandatory audit reason required."})

                conn.execute("BEGIN IMMEDIATE")
                try:
                    wallet = conn.execute("SELECT * FROM wallets WHERE student_id = ?", (sid,)).fetchone()
                    prev_bal = wallet["balance_paise"]
                    new_bal = prev_bal + amount_paise if direction == "credit" else prev_bal - amount_paise
                    if new_bal < 0:
                        conn.execute("ROLLBACK")
                        return self._send_json(400, {"error": "Adjustment cannot produce negative balance."})
                    ref = f"CK-AUDIT-{uuid.uuid4().hex[:8].upper()}"
                    conn.execute("UPDATE wallets SET balance_paise = ?, updated_at = datetime('now') WHERE id = ?", (new_bal, wallet["id"]))
                    conn.execute(
                        "INSERT INTO wallet_transactions (id, wallet_id, student_id, transaction_type, amount_paise, direction, previous_balance_paise, new_balance_paise, status, reference, related_order_id, initiating_user_id, description, audit_reason, is_simulated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, NULL, ?, ?, ?, 1)",
                        (f"txn-{uuid.uuid4().hex[:10]}", wallet["id"], sid, txn_type, amount_paise, direction, prev_bal, new_bal, ref, payload["operator_id"], f"[AUDIT] {reason}", reason),
                    )
                    conn.execute("COMMIT")
                    return self._send_json(200, {"reference": ref, "new_balance_paise": new_bal})
                except Exception as exc:
                    conn.execute("ROLLBACK")
                    return self._send_json(500, {"error": str(exc)})

            return self._send_json(404, {"error": "Endpoint not found"})
        finally:
            conn.close()


if __name__ == "__main__":
    init_db(DB_PATH, seed_catalogue=True)
    port = int(os.environ.get("PORT", 8080))
    print(f"CampusKart Full-Ecosystem SQLite Backend running on http://127.0.0.1:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), CampusKartAPI).serve_forever()
