"""
CampusKart Student Domain Service
Handles student profile bundles, metrics aggregation, and spending controls checks.
"""

import json
from typing import Any, Dict
from database.adapter import DatabaseAdapter


class StudentService:
    @staticmethod
    def build_student_bundle(db: DatabaseAdapter, sid: str) -> Dict[str, Any]:
        student = db.fetchone("SELECT * FROM students WHERE id = ?", (sid,))
        if not student:
            return {}

        college = db.fetchone(
            "SELECT id, name, institution_code, pilot_window, collection_points_json FROM colleges WHERE id = ?",
            (student["college_id"],)
        )
        wallet = db.fetchone(
            "SELECT id, balance_paise, currency, status, updated_at FROM wallets WHERE student_id = ?",
            (sid,)
        )
        controls = db.fetchone("SELECT * FROM spending_controls WHERE student_id = ?", (sid,))
        parent_link = db.fetchone(
            "SELECT parent_account_id, parent_name, relationship, status FROM parent_links WHERE student_id = ?",
            (sid,)
        )

        txns = db.fetchall(
            "SELECT * FROM wallet_transactions WHERE student_id = ? ORDER BY created_at DESC",
            (sid,)
        )
        orders = db.fetchall(
            "SELECT * FROM orders WHERE student_id = ? ORDER BY created_at DESC",
            (sid,)
        )
        for o in orders:
            o["items"] = db.fetchall("SELECT * FROM order_items WHERE order_id = ?", (o["id"],))

        notifs = db.fetchall(
            "SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC",
            (sid,)
        )

        total_spent_paise = sum(
            t["amount_paise"] for t in txns if t["transaction_type"] == "purchase" and t["status"] == "completed"
        )
        total_funded_paise = sum(
            t["amount_paise"] for t in txns if t["transaction_type"] in ("funding", "refund") and t["status"] == "completed"
        )
        purchase_txns = [t for t in txns if t["transaction_type"] == "purchase" and t["status"] == "completed"]
        avg_txn_paise = int(total_spent_paise / len(purchase_txns)) if purchase_txns else 0

        cat_totals: Dict[str, int] = {}
        for o in orders:
            if o["fulfilment_status"] == "Cancelled":
                continue
            for it in o.get("items", []):
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
                "college": college or {},
                "parent_link": parent_link or {},
            },
            "wallet": wallet or {},
            "spending_controls": controls or {},
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
