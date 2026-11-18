"""
CampusKart SQLite Database Adapter
Optimized local relational engine with WAL mode, integer paise precision, and immediate transaction locking.
"""

import json
import sqlite3
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path
from .adapter import DatabaseAdapter
from security.crypto import hash_secret

BASE_DIR = Path(__file__).resolve().parent.parent
SCHEMA_PATH = BASE_DIR / "schema_sqlite.sql"


class SQLiteAdapter(DatabaseAdapter):
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._conn: Optional[sqlite3.Connection] = None

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is None:
            self._conn = sqlite3.connect(self.db_path, isolation_level=None)
            self._conn.row_factory = sqlite3.Row
            self._conn.execute("PRAGMA foreign_keys = ON;")
            try:
                self._conn.execute("PRAGMA journal_mode = WAL;")
                self._conn.execute("PRAGMA synchronous = NORMAL;")
            except sqlite3.OperationalError:
                pass
        return self._conn

    def init_schema(self, seed_catalogue: bool = True) -> None:
        conn = self._get_conn()
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            conn.executescript(f.read())

        if seed_catalogue:
            count = conn.execute("SELECT COUNT(*) FROM colleges").fetchone()[0]
            if count == 0:
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

    def execute(self, query: str, params: Tuple[Any, ...] = ()) -> Any:
        return self._get_conn().execute(query, params)

    def fetchone(self, query: str, params: Tuple[Any, ...] = ()) -> Optional[Dict[str, Any]]:
        row = self._get_conn().execute(query, params).fetchone()
        return dict(row) if row else None

    def fetchall(self, query: str, params: Tuple[Any, ...] = ()) -> List[Dict[str, Any]]:
        rows = self._get_conn().execute(query, params).fetchall()
        return [dict(r) for r in rows]

    def begin_transaction(self) -> None:
        self._get_conn().execute("BEGIN IMMEDIATE")

    def commit_transaction(self) -> None:
        self._get_conn().execute("COMMIT")

    def rollback_transaction(self) -> None:
        try:
            self._get_conn().execute("ROLLBACK")
        except sqlite3.OperationalError:
            pass

    def close(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None
