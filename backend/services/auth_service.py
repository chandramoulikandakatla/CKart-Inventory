"""
CampusKart Authentication & Session Service
Handles dual-factor student authentication, parent login, and role-based token issue.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Tuple
from database.adapter import DatabaseAdapter
from security.crypto import verify_secret
from security.tokens import sign_token, verify_token


class AuthService:
    @staticmethod
    def student_login_step1(db: DatabaseAdapter, code: str, password: str) -> Tuple[int, Dict[str, Any]]:
        clean_code = code.strip().upper()
        row = db.fetchone(
            "SELECT s.*, c.name AS college_name FROM students s JOIN colleges c ON s.college_id = c.id WHERE UPPER(s.student_code) = ?",
            (clean_code,),
        )
        if not row:
            return 401, {"error": "Student ID not found."}
        if row["account_status"] != "active":
            return 403, {"error": f"Account {row['student_code']} is {row['account_status']}."}
        if not verify_secret(password, row["password_hash"]):
            return 401, {"error": "Invalid student password."}

        pre_token = sign_token({
            "role": "student",
            "student_id": row["id"],
            "pin_verified": False,
            "exp": datetime.now(timezone.utc).timestamp() + 600,
        })
        return 200, {
            "pre_auth_token": pre_token,
            "student_preview": {
                "student_code": row["student_code"],
                "first_name": row["first_name"],
                "last_name": row["last_name"],
                "academic_year": row["academic_year"],
                "college_name": row["college_name"],
            },
        }

    @staticmethod
    def student_login_step2_pin(db: DatabaseAdapter, pre_auth_token: str, pin: str) -> Tuple[int, Dict[str, Any]]:
        payload = verify_token(pre_auth_token)
        clean_pin = pin.strip()
        if not payload or payload.get("role") != "student":
            return 401, {"error": "Session expired."}
        row = db.fetchone(
            "SELECT * FROM students WHERE id = ? AND account_status = 'active'",
            (payload["student_id"],),
        )
        if not row or not verify_secret(clean_pin, row["pin_hash"]):
            return 401, {"error": "Incorrect CampusKart PIN."}

        session_token = sign_token({
            "role": "student",
            "student_id": row["id"],
            "pin_verified": True,
            "exp": datetime.now(timezone.utc).timestamp() + 86400,
        })
        return 200, {"session_token": session_token}

    @staticmethod
    def parent_login(db: DatabaseAdapter, code: str, parent_pin: str) -> Tuple[int, Dict[str, Any]]:
        clean_code = code.strip().upper()
        clean_pin = parent_pin.strip()
        row = db.fetchone(
            """
            SELECT s.id AS student_id, s.student_code, p.parent_account_id, p.parent_name, p.parent_pin_hash
            FROM students s JOIN parent_links p ON p.student_id = s.id
            WHERE UPPER(s.student_code) = ? AND p.status = 'verified'
            """,
            (clean_code,),
        )
        if not row or not verify_secret(clean_pin, row["parent_pin_hash"]):
            return 401, {"error": "Invalid linked Student ID or Parent Access PIN."}

        token = sign_token({
            "role": "parent",
            "student_id": row["student_id"],
            "parent_account_id": row["parent_account_id"],
            "exp": datetime.now(timezone.utc).timestamp() + 86400,
        })
        return 200, {"session_token": token, "parent_name": row["parent_name"]}

    @staticmethod
    def ops_login(operator_id: str) -> Tuple[int, Dict[str, Any]]:
        clean_id = (operator_id or "OPS-ADMIN-01").strip()
        token = sign_token({
            "role": "ops",
            "operator_id": clean_id,
            "exp": datetime.now(timezone.utc).timestamp() + 86400,
        })
        return 200, {"session_token": token, "operator_id": clean_id}

    @staticmethod
    def college_login(college_id: str = "col-scna-01") -> Tuple[int, Dict[str, Any]]:
        token = sign_token({
            "role": "college",
            "college_id": college_id,
            "exp": datetime.now(timezone.utc).timestamp() + 86400,
        })
        return 200, {"session_token": token, "college_id": college_id}
