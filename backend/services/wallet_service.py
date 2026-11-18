"""
CampusKart Wallet & Ledger Service
Handles atomic wallet funding, audited manual adjustments, and ledger entries.
"""

import uuid
from typing import Any, Dict, Tuple
from database.adapter import DatabaseAdapter


class WalletService:
    @staticmethod
    def fund_wallet(
        db: DatabaseAdapter,
        parent_payload: Dict[str, Any],
        amount_paise: int,
        method: str = "UPI (Simulated)"
    ) -> Tuple[int, Dict[str, Any]]:
        sid = parent_payload["student_id"]
        if amount_paise <= 0 or amount_paise > 2_500_000:
            return 400, {"error": "Invalid funding amount."}

        db.begin_transaction()
        try:
            wallet = db.fetchone("SELECT * FROM wallets WHERE student_id = ?", (sid,))
            if not wallet:
                db.rollback_transaction()
                return 404, {"error": "Student wallet not found."}

            prev_bal = wallet["balance_paise"]
            new_bal = prev_bal + amount_paise
            ref = f"CK-SIM-FUND-{uuid.uuid4().hex[:8].upper()}"

            db.execute("UPDATE wallets SET balance_paise = ?, updated_at = datetime('now') WHERE id = ?", (new_bal, wallet["id"]))
            db.execute(
                """
                INSERT INTO wallet_transactions
                (id, wallet_id, student_id, transaction_type, amount_paise, direction, previous_balance_paise, new_balance_paise, status, reference, related_order_id, initiating_user_id, description, is_simulated)
                VALUES (?, ?, ?, 'funding', ?, 'credit', ?, ?, 'completed', ?, NULL, ?, ?, 1)
                """,
                (
                    f"txn-{uuid.uuid4().hex[:10]}",
                    wallet["id"],
                    sid,
                    amount_paise,
                    prev_bal,
                    new_bal,
                    ref,
                    parent_payload["parent_account_id"],
                    f"Simulated Parent Funding via {method}",
                ),
            )
            db.execute(
                "INSERT INTO notifications (id, student_id, type, title, message) VALUES (?, ?, 'wallet', 'Wallet Funded Successfully', ?)",
                (
                    f"notif-{uuid.uuid4().hex[:8]}",
                    sid,
                    f"₹{amount_paise / 100:.2f} credited via {method} (Simulated). Ref: {ref}",
                ),
            )
            db.commit_transaction()
            return 200, {
                "reference": ref,
                "previous_balance_paise": prev_bal,
                "new_balance_paise": new_bal,
            }
        except Exception as exc:
            db.rollback_transaction()
            return 500, {"error": str(exc)}

    @staticmethod
    def adjust_wallet_audited(
        db: DatabaseAdapter,
        ops_payload: Dict[str, Any],
        student_id: str,
        amount_paise: int,
        direction: str = "credit",
        txn_type: str = "adjustment",
        reason: str = ""
    ) -> Tuple[int, Dict[str, Any]]:
        clean_reason = reason.strip()
        if amount_paise <= 0 or not clean_reason:
            return 400, {"error": "Positive amount and mandatory audit reason required."}

        db.begin_transaction()
        try:
            wallet = db.fetchone("SELECT * FROM wallets WHERE student_id = ?", (student_id,))
            if not wallet:
                db.rollback_transaction()
                return 404, {"error": "Student wallet not found."}

            prev_bal = wallet["balance_paise"]
            new_bal = prev_bal + amount_paise if direction == "credit" else prev_bal - amount_paise
            if new_bal < 0:
                db.rollback_transaction()
                return 400, {"error": "Adjustment cannot produce negative balance."}

            ref = f"CK-AUDIT-{uuid.uuid4().hex[:8].upper()}"
            db.execute("UPDATE wallets SET balance_paise = ?, updated_at = datetime('now') WHERE id = ?", (new_bal, wallet["id"]))
            db.execute(
                """
                INSERT INTO wallet_transactions (id, wallet_id, student_id, transaction_type, amount_paise, direction, previous_balance_paise, new_balance_paise, status, reference, related_order_id, initiating_user_id, description, audit_reason, is_simulated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, NULL, ?, ?, ?, 1)
                """,
                (
                    f"txn-{uuid.uuid4().hex[:10]}",
                    wallet["id"],
                    student_id,
                    txn_type,
                    amount_paise,
                    direction,
                    prev_bal,
                    new_bal,
                    ref,
                    ops_payload["operator_id"],
                    f"[AUDIT] {clean_reason}",
                    clean_reason,
                ),
            )
            db.commit_transaction()
            return 200, {"reference": ref, "new_balance_paise": new_bal}
        except Exception as exc:
            db.rollback_transaction()
            return 500, {"error": str(exc)}
