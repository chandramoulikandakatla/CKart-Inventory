"""
CampusKart Database Engine Factory
Auto-discovers and provides the active database adapter (SQLite or Supabase).
"""

from config import (
    DATABASE_PROVIDER,
    DB_PATH,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY,
    DATABASE_URL,
)
from .adapter import DatabaseAdapter
from .sqlite_adapter import SQLiteAdapter
from .supabase_adapter import SupabaseAdapter


def get_database_adapter(provider: str = "", custom_db_path: str = "") -> DatabaseAdapter:
    """Instantiate and return the configured DatabaseAdapter."""
    active_provider = provider or DATABASE_PROVIDER

    if active_provider in ("supabase", "postgres"):
        return SupabaseAdapter(
            supabase_url=SUPABASE_URL,
            service_role_key=SUPABASE_SERVICE_ROLE_KEY,
            anon_key=SUPABASE_ANON_KEY,
            database_url=DATABASE_URL,
        )

    # Default to SQLite
    target_path = custom_db_path or DB_PATH
    return SQLiteAdapter(db_path=target_path)


__all__ = ["DatabaseAdapter", "SQLiteAdapter", "SupabaseAdapter", "get_database_adapter"]
