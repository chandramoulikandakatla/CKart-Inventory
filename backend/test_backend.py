#!/usr/bin/env python3
"""
Full-Ecosystem Acceptance Tests for CampusKart (Student + Parent + Operations + College).
Exercises real HTTP requests against ThreadingHTTPServer + SQLite3 ACID database.
"""

import json
import os
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

import server


class CampusKartEcosystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp_dir = tempfile.TemporaryDirectory()
        cls.db_path = os.path.join(cls.tmp_dir.name, "test_ecosystem.db")
        server.DB_PATH = cls.db_path
        server.CampusKartAPI.db_path = cls.db_path
        server.init_db(cls.db_path, seed_catalogue=True)

        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.CampusKartAPI)
        cls.port = cls.httpd.server_address[1]
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.tmp_dir.cleanup()

    def _req(self, method: str, path: str, body: dict | None = None, token: str | None = None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(f"{self.base_url}{path}", data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode("utf-8"))

    def test_01_empty_state_and_independent_auth(self):
        # Student token cannot access Parent or Ops endpoints
        st1, d1 = self._req("POST", "/api/auth/login", {"student_code": "CK-2026-101", "password": "PASS101"})
        self.assertEqual(st1, 200)
        st2, d2 = self._req("POST", "/api/auth/verify-pin", {"pre_auth_token": d1["pre_auth_token"], "pin": "1234"})
        self.assertEqual(st2, 200)
        stu_tok = d2["session_token"]

        st_priv, _ = self._req("GET", "/api/ops/dashboard", token=stu_tok)
        self.assertEqual(st_priv, 403)

        # Student starts at ₹0.00, 0 orders, 0 transactions
        _, dash = self._req("GET", "/api/student/dashboard", token=stu_tok)
        self.assertEqual(dash["wallet"]["balance_paise"], 0)
        self.assertEqual(len(dash["orders"]), 0)
        self.assertEqual(len(dash["transactions"]), 0)

        # Parent cannot log in with student's PIN (1234); must use Parent PIN (9999)
        st_bad_par, _ = self._req("POST", "/api/parent/auth/login", {"student_code": "CK-2026-101", "parent_pin": "1234"})
        self.assertEqual(st_bad_par, 401)
        st_par, par_res = self._req("POST", "/api/parent/auth/login", {"student_code": "CK-2026-101", "parent_pin": "9999"})
        self.assertEqual(st_par, 200)
        self.assertTrue(bool(par_res["session_token"]))

    def test_02_cross_portal_scenarios_a_through_e_and_college_privacy(self):
        # Authenticate all 4 portals independently
        _, d1 = self._req("POST", "/api/auth/login", {"student_code": "CK-2026-101", "password": "PASS101"})
        _, d2 = self._req("POST", "/api/auth/verify-pin", {"pre_auth_token": d1["pre_auth_token"], "pin": "1234"})
        stu_tok = d2["session_token"]

        _, par_auth = self._req("POST", "/api/parent/auth/login", {"student_code": "CK-2026-101", "parent_pin": "9999"})
        par_tok = par_auth["session_token"]

        _, ops_auth = self._req("POST", "/api/ops/auth/login", {"operator_id": "OPS-LEAD-01"})
        ops_tok = ops_auth["session_token"]

        _, col_auth = self._req("POST", "/api/college/auth/login", {})
        col_tok = col_auth["session_token"]

        # SCENARIO B: Parent funds shared student wallet (+₹1,000.00 = 100000 paise)
        st_fund, fund_res = self._req("POST", "/api/parent/fund", {"amount_paise": 100000, "method": "UPI"}, token=par_tok)
        self.assertEqual(st_fund, 200)
        self.assertEqual(fund_res["new_balance_paise"], 100000)

        # Student sees updated ₹1,000.00 balance immediately
        _, stu_dash = self._req("GET", "/api/student/dashboard", token=stu_tok)
        self.assertEqual(stu_dash["wallet"]["balance_paise"], 100000)

        # SCENARIO A: Student places an order (PRD-001 ₹90 + PRD-003 ₹45 = ₹135 = 13500 paise)
        st_chk, chk_res = self._req("POST", "/api/checkout", {
            "items": [{"product_id": "PRD-001", "quantity": 1}, {"product_id": "PRD-003", "quantity": 1}],
            "idempotency_key": "idem-eco-1",
        }, token=stu_tok)
        self.assertEqual(st_chk, 200)
        order_id = chk_res["order_id"]
        self.assertEqual(chk_res["new_balance_paise"], 86500)

        # Duplicate idempotency key does not double-debit
        st_dup, dup_res = self._req("POST", "/api/checkout", {
            "items": [{"product_id": "PRD-001", "quantity": 1}],
            "idempotency_key": "idem-eco-1",
        }, token=stu_tok)
        self.assertEqual(st_dup, 200)
        self.assertTrue(dup_res["duplicate"])

        # Parent sees purchase in transaction history & order list
        _, par_dash = self._req("GET", "/api/parent/dashboard", token=par_tok)
        self.assertEqual(par_dash["wallet"]["balance_paise"], 86500)
        self.assertEqual(len(par_dash["orders"]), 1)
        self.assertEqual(len(par_dash["transactions"]), 2)

        # SCENARIO C: Operations updates order status -> Student & Parent see it
        st_ord_upd, _ = self._req("POST", "/api/ops/orders/status", {"order_id": order_id, "status": "Ready for Collection"}, token=ops_tok)
        self.assertEqual(st_ord_upd, 200)
        _, stu_dash2 = self._req("GET", "/api/student/dashboard", token=stu_tok)
        self.assertEqual(stu_dash2["orders"][0]["fulfilment_status"], "Ready for Collection")

        # SCENARIO D: Parent sets category restriction ('Beverages') -> Student checkout blocked
        self._req("POST", "/api/parent/spending-controls", {
            "daily_limit_paise": 50000,
            "category_restrictions": ["Beverages"],
            "enabled": True,
        }, token=par_tok)
        st_blocked, blk_res = self._req("POST", "/api/checkout", {
            "items": [{"product_id": "PRD-003", "quantity": 1}],
            "idempotency_key": "idem-eco-blocked",
        }, token=stu_tok)
        self.assertEqual(st_blocked, 403)
        self.assertIn("restricted", blk_res["error"].lower())

        # SCENARIO E: Operations records audited wallet adjustment (+₹50 = 5000 paise)
        st_adj, adj_res = self._req("POST", "/api/ops/wallet/adjust", {
            "student_id": "stu-101",
            "amount_paise": 5000,
            "direction": "credit",
            "transaction_type": "refund",
            "reason": "Kiosk spill replacement credit",
        }, token=ops_tok)
        self.assertEqual(st_adj, 200)
        self.assertEqual(adj_res["new_balance_paise"], 91500)

        # COLLEGE PRIVACY CHECK: Aggregated metrics only, no individual student PII/orders
        st_col, col_dash = self._req("GET", "/api/college/dashboard", token=col_tok)
        self.assertEqual(st_col, 200)
        self.assertEqual(col_dash["total_orders"], 1)
        self.assertEqual(col_dash["aggregate_order_volume_paise"], 13500)
        self.assertNotIn("orders", col_dash)
        self.assertNotIn("students", col_dash)
        self.assertNotIn("transactions", col_dash)


if __name__ == "__main__":
    unittest.main(verbosity=2)
