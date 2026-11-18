"""
CampusKart Supabase / PostgreSQL Database Adapter
Integrates with Supabase via PostgREST and Direct PostgreSQL connection pools.
Supports zero-dependency REST queries using urllib.request and psycopg2 when available.
"""

import json
import logging
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path
from .adapter import DatabaseAdapter

logger = logging.getLogger("campuskart.database.supabase")

BASE_DIR = Path(__file__).resolve().parent.parent
SCHEMA_POSTGRES_PATH = BASE_DIR / "schema_postgres_supabase.sql"


class SupabaseAdapter(DatabaseAdapter):
    def __init__(
        self,
        supabase_url: str = "",
        service_role_key: str = "",
        anon_key: str = "",
        database_url: str = ""
    ):
        self.supabase_url = supabase_url.rstrip("/")
        self.service_role_key = service_role_key or anon_key
        self.database_url = database_url
        self._pg_conn = None
        self._in_transaction = False

        # Attempt to initialize direct PostgreSQL connection if psycopg2 is installed and DATABASE_URL is set
        if self.database_url:
            try:
                import psycopg2
                import psycopg2.extras
                self._pg_conn = psycopg2.connect(
                    self.database_url,
                    cursor_factory=psycopg2.extras.RealDictCursor
                )
                self._pg_conn.autocommit = False
                logger.info("Connected to Supabase PostgreSQL via psycopg2 direct connection.")
            except ImportError:
                logger.info("psycopg2 not installed; using Supabase PostgREST REST interface.")
            except Exception as e:
                logger.warning(f"Could not connect via direct PostgreSQL ({e}); falling back to PostgREST.")

    def _rest_request(self, endpoint: str, method: str = "GET", data: Optional[Any] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        """Execute a direct HTTP request to the Supabase PostgREST API."""
        if not self.supabase_url or not self.service_role_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase REST operations.")

        url = f"{self.supabase_url}/rest/v1/{endpoint.lstrip('/')}"
        req_headers = {
            "apikey": self.service_role_key,
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        if headers:
            req_headers.update(headers)

        payload = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=payload, headers=req_headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                res_body = resp.read().decode("utf-8")
                return json.loads(res_body) if res_body else []
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            logger.error(f"Supabase REST error {e.code}: {err_body}")
            raise RuntimeError(f"Supabase request failed ({e.code}): {err_body}")

    def init_schema(self, seed_catalogue: bool = True) -> None:
        """Run schema_postgres_supabase.sql on Supabase if direct connection is active."""
        if self._pg_conn:
            with open(SCHEMA_POSTGRES_PATH, "r", encoding="utf-8") as f:
                with self._pg_conn.cursor() as cur:
                    cur.execute(f.read())
            self._pg_conn.commit()
            logger.info("Supabase PostgreSQL schema applied successfully.")

    def execute(self, query: str, params: Tuple[Any, ...] = ()) -> Any:
        if self._pg_conn:
            pg_query = query.replace("?", "%s")
            with self._pg_conn.cursor() as cur:
                cur.execute(pg_query, params)
            if not self._in_transaction:
                self._pg_conn.commit()
            return None
        raise NotImplementedError("Direct SQL execution requires DATABASE_URL or PostgreSQL driver.")

    def fetchone(self, query: str, params: Tuple[Any, ...] = ()) -> Optional[Dict[str, Any]]:
        if self._pg_conn:
            pg_query = query.replace("?", "%s")
            with self._pg_conn.cursor() as cur:
                cur.execute(pg_query, params)
                row = cur.fetchone()
                return dict(row) if row else None
        raise NotImplementedError("Arbitrary SQL queries over REST require Supabase RPC functions.")

    def fetchall(self, query: str, params: Tuple[Any, ...] = ()) -> List[Dict[str, Any]]:
        if self._pg_conn:
            pg_query = query.replace("?", "%s")
            with self._pg_conn.cursor() as cur:
                cur.execute(pg_query, params)
                rows = cur.fetchall()
                return [dict(r) for r in rows]
        raise NotImplementedError("Arbitrary SQL queries over REST require Supabase RPC functions.")

    def begin_transaction(self) -> None:
        self._in_transaction = True
        if self._pg_conn:
            pass  # psycopg2 transactions begin on first command

    def commit_transaction(self) -> None:
        self._in_transaction = False
        if self._pg_conn:
            self._pg_conn.commit()

    def rollback_transaction(self) -> None:
        self._in_transaction = False
        if self._pg_conn:
            self._pg_conn.rollback()

    def close(self) -> None:
        if self._pg_conn:
            self._pg_conn.close()
            self._pg_conn = None
