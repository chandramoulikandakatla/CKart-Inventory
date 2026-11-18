"""
CampusKart Backend Configuration & Environment Loader
Loads environment variables from .env files without requiring external packages.
"""

import os
import secrets
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
SCHEMA_SQLITE_PATH = BASE_DIR / "schema_sqlite.sql"
SCHEMA_POSTGRES_PATH = BASE_DIR / "schema_postgres_supabase.sql"

def load_env_file(path: Path) -> None:
    """Parse key=value pairs from a .env file and set in os.environ if not already set."""
    if not path.is_file():
        return
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass

# Automatically load from project root .env or backend .env
load_env_file(PROJECT_ROOT / ".env")
load_env_file(BASE_DIR / ".env")

# Server Config
PORT = int(os.environ.get("PORT", "8080"))
HOST = os.environ.get("HOST", "127.0.0.1")
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")

# Security
SESSION_SECRET = os.environ.get(
    "CAMPUSKART_SESSION_SECRET",
    secrets.token_hex(32)
).encode("utf-8")

# Database Configuration
DATABASE_PROVIDER = os.environ.get("DATABASE_PROVIDER", "").lower()
DB_PATH = os.environ.get("CAMPUSKART_DB_PATH", str(BASE_DIR / "campuskart.db"))

# Supabase / PostgreSQL Credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Auto-detect Supabase provider if credentials are provided and not explicitly set
if not DATABASE_PROVIDER:
    if SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY):
        DATABASE_PROVIDER = "supabase"
    elif DATABASE_URL.startswith("postgres"):
        DATABASE_PROVIDER = "postgres"
    else:
        DATABASE_PROVIDER = "sqlite"
