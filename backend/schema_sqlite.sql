-- CampusKart SQLite Database Schema (Integer Paise Monetary Precision)
-- Authoritative shared ledger across Student, Parent, Operations, and College portals

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    institution_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    pilot_window TEXT NOT NULL,
    collection_points_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
    student_code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    account_status TEXT NOT NULL CHECK (account_status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    password_hash TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parent_links (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_account_id TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_pin_hash TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Guardian',
    status TEXT NOT NULL CHECK (status IN ('verified', 'pending', 'revoked')) DEFAULT 'verified',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(student_id, parent_account_id)
);

CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    balance_paise INTEGER NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('active', 'frozen')) DEFAULT 'active',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price_paise INTEGER NOT NULL CHECK (price_paise > 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
    is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
    offer_tag TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
    total_amount_paise INTEGER NOT NULL CHECK (total_amount_paise > 0),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    fulfilment_status TEXT NOT NULL CHECK (fulfilment_status IN ('Order Placed', 'Payment Confirmed', 'Accepted', 'Preparing', 'Ready for Collection', 'Completed', 'Cancelled')),
    fulfilment_method TEXT NOT NULL,
    collection_point TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    is_simulated INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot TEXT NOT NULL,
    category_snapshot TEXT NOT NULL,
    unit_price_snapshot_paise INTEGER NOT NULL CHECK (unit_price_snapshot_paise > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_paise INTEGER NOT NULL CHECK (subtotal_paise > 0)
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('funding', 'purchase', 'refund', 'adjustment')),
    amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
    direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
    previous_balance_paise INTEGER NOT NULL CHECK (previous_balance_paise >= 0),
    new_balance_paise INTEGER NOT NULL CHECK (new_balance_paise >= 0),
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'pending')),
    reference TEXT NOT NULL UNIQUE,
    related_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    initiating_user_id TEXT NOT NULL DEFAULT 'system',
    description TEXT NOT NULL,
    audit_reason TEXT,
    is_simulated INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL UNIQUE,
    requested_amount_paise INTEGER NOT NULL CHECK (requested_amount_paise > 0),
    status TEXT NOT NULL CHECK (status IN ('initiated', 'succeeded', 'failed')),
    failure_reason TEXT,
    related_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    reference TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS spending_controls (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    daily_limit_paise INTEGER CHECK (daily_limit_paise IS NULL OR daily_limit_paise >= 0),
    weekly_limit_paise INTEGER CHECK (weekly_limit_paise IS NULL OR weekly_limit_paise >= 0),
    monthly_limit_paise INTEGER CHECK (monthly_limit_paise IS NULL OR monthly_limit_paise >= 0),
    category_restrictions_json TEXT NOT NULL DEFAULT '[]',
    enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order', 'wallet', 'alert', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_wallets_student ON wallets(student_id);
CREATE INDEX IF NOT EXISTS idx_txns_student_created ON wallet_transactions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_student_created ON orders(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_college_cat ON products(college_id, category, is_available);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id, created_at DESC);
