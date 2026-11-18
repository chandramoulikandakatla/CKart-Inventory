"""
CampusKart Cryptographic Primitives
PBKDF2-HMAC password and PIN hashing with timing attack prevention.
"""

import hashlib
import hmac
import secrets


def hash_secret(secret: str, salt: str | None = None) -> str:
    """Hash secret using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        secret.encode("utf-8"),
        salt.encode("utf-8"),
        100_000
    ).hex()
    return f"{salt}${digest}"


def verify_secret(secret: str, stored: str) -> bool:
    """Verify secret against stored salt$digest with constant-time equality check."""
    try:
        salt, expected = stored.split("$", 1)
        actual = hashlib.pbkdf2_hmac(
            "sha256",
            secret.encode("utf-8"),
            salt.encode("utf-8"),
            100_000
        ).hex()
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False
