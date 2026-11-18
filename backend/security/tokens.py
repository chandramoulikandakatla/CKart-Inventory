"""
CampusKart HMAC-SHA256 Session Token Management
Provides tamper-proof, time-bound session tokens.
"""

import hashlib
import hmac
import json
from datetime import datetime, timezone
from config import SESSION_SECRET


def sign_token(payload: dict) -> str:
    """Generate a cryptographically signed session token."""
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    b64 = raw.hex()
    sig = hmac.new(SESSION_SECRET, b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{b64}.{sig}"


def verify_token(token: str) -> dict | None:
    """Verify session token signature and check expiration timestamp."""
    try:
        if not token or "." not in token:
            return None
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
