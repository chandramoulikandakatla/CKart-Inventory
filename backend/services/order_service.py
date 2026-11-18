"""
CampusKart Order & Inventory Fulfillment Service
Handles atomic checkout, idempotency guarantees, stock deductions, and status workflows.
"""

import json
import uuid
from datetime import datetime
from typing import Any, Dict, Tuple
from database.adapter import DatabaseAdapter


class OrderService:
    @staticmethod
    def checkout(db: DatabaseAdapter, student_payload: Dict[str, Any], body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
        sid = student_payload["student_id"]
        student = db.fetchone("SELECT * FROM students WHERE id = ? AND account_status = 'active'", (sid,))
        if not student:
            return 403, {"error": "Student account inactive"}

        items_req = body.get("items", [])
        fulfilment_method = str(body.get("fulfilment_method", "Campus Kiosk Pickup"))
        collection_point = str(body.get("collection_point", "Block A — Ground Floor Smart Kiosk #1"))
        idempotency_key = str(body.get("idempotency_key", "")).strip() or uuid.uuid4().hex
        simulate_failure = bool(body.get("simulate_failure", False))

        if not items_req:
            return 400, {"error": "Cart is empty."}

        db.begin_transaction()
        try:
            existing_attempt = db.fetchone("SELECT * FROM payment_attempts WHERE idempotency_key = ?", (idempotency_key,))
            if existing_attempt:
                if existing_attempt["status"] == "succeeded":
                    existing_order = db.fetchone("SELECT * FROM orders WHERE id = ?", (existing_attempt["related_order_id"],))
                    db.rollback_transaction()
                    return 200, {
                        "duplicate": True,
                        "order": existing_order,
                        "reference": existing_attempt["reference"],
                    }
                db.rollback_transaction()
                return 409, {"error": f"Duplicate payment attempt already {existing_attempt['status']}."}

            total_paise = 0
            validated_items = []
            for req_it in items_req:
                pid = str(req_it.get("product_id", ""))
                qty = int(req_it.get("quantity", 0))
                if qty <= 0:
                    db.rollback_transaction()
                    return 400, {"error": "Quantity must be >= 1."}
                prod = db.fetchone("SELECT * FROM products WHERE id = ?", (pid,))
                if not prod or not prod["is_available"]:
                    db.rollback_transaction()
                    return 400, {"error": f"Product {pid} is unavailable."}
                if prod["stock_quantity"] < qty:
                    db.rollback_transaction()
                    return 400, {"error": f"Insufficient stock for {prod['name']}."}
                sub = prod["price_paise"] * qty
                total_paise += sub
                validated_items.append((prod, qty, sub))

            wallet = db.fetchone("SELECT * FROM wallets WHERE student_id = ?", (sid,))
            if not wallet or wallet["balance_paise"] < total_paise:
                db.rollback_transaction()
                shortfall = total_paise - (wallet["balance_paise"] if wallet else 0)
                return 402, {"error": "Insufficient wallet balance.", "shortfall_paise": shortfall}

            ctrl = db.fetchone("SELECT * FROM spending_controls WHERE student_id = ?", (sid,))
            if ctrl and ctrl["enabled"]:
                restricted = json.loads(ctrl["category_restrictions_json"] or "[]")
                for prod, _, _ in validated_items:
                    if prod["category"] in restricted:
                        db.rollback_transaction()
                        return 403, {"error": f"Category '{prod['category']}' is restricted by Parent Spending Controls."}
                if ctrl["daily_limit_paise"] is not None:
                    row_spend = db.fetchone(
                        "SELECT COALESCE(SUM(amount_paise), 0) as spend FROM wallet_transactions WHERE student_id = ? AND transaction_type = 'purchase' AND status = 'completed' AND date(created_at) = date('now')",
                        (sid,),
                    )
                    today_spent = row_spend["spend"] if row_spend else 0
                    if today_spent + total_paise > ctrl["daily_limit_paise"]:
                        db.rollback_transaction()
                        return 403, {"error": f"Exceeds daily spending limit of ₹{ctrl['daily_limit_paise'] / 100:.2f}."}

            if simulate_failure:
                db.execute(
                    "INSERT INTO payment_attempts (id, student_id, idempotency_key, requested_amount_paise, status, failure_reason) VALUES (?, ?, ?, ?, 'failed', 'Simulated failure')",
                    (f"att-{uuid.uuid4().hex[:8]}", sid, idempotency_key, total_paise),
                )
                db.commit_transaction()
                return 402, {"error": "Simulated payment failure: Wallet was NOT debited."}

            order_id = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:5].upper()}"
            ref = f"CK-SIM-PAY-{uuid.uuid4().hex[:8].upper()}"
            prev_bal = wallet["balance_paise"]
            new_bal = prev_bal - total_paise

            db.execute(
                "INSERT INTO orders (id, student_id, college_id, total_amount_paise, payment_status, fulfilment_status, fulfilment_method, collection_point, idempotency_key, is_simulated) VALUES (?, ?, ?, ?, 'paid', 'Order Placed', ?, ?, ?, 1)",
                (order_id, sid, student["college_id"], total_paise, fulfilment_method, collection_point, idempotency_key),
            )
            for prod, qty, sub in validated_items:
                db.execute(
                    "INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, category_snapshot, unit_price_snapshot_paise, quantity, subtotal_paise) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (f"oi-{uuid.uuid4().hex[:8]}", order_id, prod["id"], prod["name"], prod["category"], prod["price_paise"], qty, sub),
                )
                db.execute("UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = datetime('now') WHERE id = ?", (qty, prod["id"]))

            db.execute("UPDATE wallets SET balance_paise = ?, updated_at = datetime('now') WHERE id = ?", (new_bal, wallet["id"]))
            db.execute(
                "INSERT INTO wallet_transactions (id, wallet_id, student_id, transaction_type, amount_paise, direction, previous_balance_paise, new_balance_paise, status, reference, related_order_id, initiating_user_id, description, is_simulated) VALUES (?, ?, ?, 'purchase', ?, 'debit', ?, ?, 'completed', ?, ?, ?, ?, 1)",
                (f"txn-{uuid.uuid4().hex[:10]}", wallet["id"], sid, total_paise, prev_bal, new_bal, ref, order_id, sid, f"Order {order_id}"),
            )
            db.execute(
                "INSERT INTO payment_attempts (id, student_id, idempotency_key, requested_amount_paise, status, related_order_id, reference) VALUES (?, ?, ?, ?, 'succeeded', ?, ?)",
                (f"att-{uuid.uuid4().hex[:8]}", sid, idempotency_key, total_paise, order_id, ref),
            )
            db.execute(
                "INSERT INTO notifications (id, student_id, type, title, message) VALUES (?, ?, 'order', ?, ?)",
                (f"notif-{uuid.uuid4().hex[:8]}", sid, f"Order Confirmed ({order_id})", f"₹{total_paise / 100:.2f} debited via simulated wallet. Ref: {ref}"),
            )
            db.commit_transaction()
            return 200, {
                "order_id": order_id,
                "reference": ref,
                "total_amount_paise": total_paise,
                "previous_balance_paise": prev_bal,
                "new_balance_paise": new_bal,
            }
        except Exception as exc:
            db.rollback_transaction()
            return 500, {"error": str(exc)}

    @staticmethod
    def update_order_status(db: DatabaseAdapter, ops_payload: Dict[str, Any], order_id: str, status: str) -> Tuple[int, Dict[str, Any]]:
        ord_row = db.fetchone("SELECT * FROM orders WHERE id = ?", (order_id,))
        if not ord_row:
            return 404, {"error": "Order not found."}
        db.execute("UPDATE orders SET fulfilment_status = ?, updated_at = datetime('now') WHERE id = ?", (status, order_id))
        db.execute(
            "INSERT INTO notifications (id, student_id, type, title, message) VALUES (?, ?, 'order', ?, ?)",
            (f"notif-{uuid.uuid4().hex[:8]}", ord_row["student_id"], f"Order {order_id} Updated", f"Order status updated to '{status}' by {ops_payload['operator_id']}."),
        )
        return 200, {"ok": True, "order_id": order_id, "status": status}

    @staticmethod
    def update_product_inventory(db: DatabaseAdapter, product_id: str, stock_quantity: int, is_available: bool) -> Tuple[int, Dict[str, Any]]:
        avail = 1 if is_available else 0
        db.execute(
            "UPDATE products SET stock_quantity = ?, is_available = ?, updated_at = datetime('now') WHERE id = ?",
            (max(0, stock_quantity), avail, product_id),
        )
        return 200, {"ok": True}
