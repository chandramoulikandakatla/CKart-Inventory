"""
CampusKart Database Adapter Interface
Defines the contract for relational ledger persistence across SQLite and Supabase.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple


class DatabaseAdapter(ABC):
    @abstractmethod
    def init_schema(self, seed_catalogue: bool = True) -> None:
        """Initialize database schema and seed initial data if required."""
        pass

    @abstractmethod
    def execute(self, query: str, params: Tuple[Any, ...] = ()) -> Any:
        """Execute a query without returning result rows."""
        pass

    @abstractmethod
    def fetchone(self, query: str, params: Tuple[Any, ...] = ()) -> Optional[Dict[str, Any]]:
        """Execute a query and return a single row as a dict, or None."""
        pass

    @abstractmethod
    def fetchall(self, query: str, params: Tuple[Any, ...] = ()) -> List[Dict[str, Any]]:
        """Execute a query and return all matching rows as a list of dicts."""
        pass

    @abstractmethod
    def begin_transaction(self) -> None:
        """Begin an isolated, immediate transaction."""
        pass

    @abstractmethod
    def commit_transaction(self) -> None:
        """Commit active transaction."""
        pass

    @abstractmethod
    def rollback_transaction(self) -> None:
        """Rollback active transaction."""
        pass

    @abstractmethod
    def close(self) -> None:
        """Close connection or release pool resources."""
        pass
