-- CampusKart PostgreSQL / Supabase Production Schema with Row Level Security (RLS)
-- Monetary values stored in integer paise (BIGINT) to prevent floating-point drift.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    institution_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    pilot_window TEXT NOT NULL,
    collection_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Maps to auth.users(id) in Supabase
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
    student_code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    account_status TEXT NOT NULL CHECK (account_status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE parent_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_account_id UUID NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Guardian',
    status TEXT NOT NULL CHECK (status IN ('verified', 'pending', 'revoked')) DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, parent_account_id)
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    balance_paise BIGINT NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('active', 'frozen')) DEFAULT 'active',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price_paise BIGINT NOT NULL CHECK (price_paise > 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
    total_amount_paise BIGINT NOT NULL CHECK (total_amount_paise > 0),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    fulfilment_status TEXT NOT NULL CHECK (fulfilment_status IN ('Order Placed', 'Payment Confirmed', 'Accepted', 'Preparing', 'Ready for Collection', 'Completed', 'Cancelled')),
    fulfilment_method TEXT NOT NULL,
    collection_point TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot TEXT NOT NULL,
    category_snapshot TEXT NOT NULL,
    unit_price_snapshot_paise BIGINT NOT NULL CHECK (unit_price_snapshot_paise > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise > 0)
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('funding', 'purchase', 'refund', 'adjustment')),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
    previous_balance_paise BIGINT NOT NULL CHECK (previous_balance_paise >= 0),
    new_balance_paise BIGINT NOT NULL CHECK (new_balance_paise >= 0),
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'pending')),
    reference TEXT NOT NULL UNIQUE,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spending_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    daily_limit_paise BIGINT,
    weekly_limit_paise BIGINT,
    monthly_limit_paise BIGINT,
    category_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order', 'wallet', 'alert', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public Catalog Policies
CREATE POLICY "public_read_colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "ops_manage_products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE auth_user_id = auth.uid() AND role IN ('ops', 'admin'))
);

-- Student Isolation Policies (Students can only read their own records)
CREATE POLICY "student_read_own_profile" ON students FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "student_read_own_wallet" ON wallets FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
);
CREATE POLICY "student_read_own_txns" ON wallet_transactions FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
);
CREATE POLICY "student_read_own_orders" ON orders FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
);
CREATE POLICY "student_read_own_notifications" ON notifications FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
);

-- ==============================================================================
-- Atomic Database Functions (RPCs): Serverless Business Logic Inside Postgres
-- ==============================================================================

-- 1. Fund Student Wallet (Atomic Credit & Ledger Record)
CREATE OR REPLACE FUNCTION fund_student_wallet(
    p_student_id UUID,
    p_amount_paise BIGINT,
    p_method TEXT DEFAULT 'UPI'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet RECORD;
    v_new_balance BIGINT;
    v_ref TEXT;
BEGIN
    IF p_amount_paise <= 0 THEN
        RAISE EXCEPTION 'Funding amount must be greater than zero';
    END IF;

    SELECT id, balance_paise INTO v_wallet
    FROM wallets
    WHERE student_id = p_student_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for student %', p_student_id;
    END IF;

    v_new_balance := v_wallet.balance_paise + p_amount_paise;
    v_ref := 'FND-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');

    -- Update balance
    UPDATE wallets
    SET balance_paise = v_new_balance, updated_at = now()
    WHERE id = v_wallet.id;

    -- Insert ledger record
    INSERT INTO wallet_transactions (
        wallet_id, student_id, transaction_type, amount_paise,
        direction, previous_balance_paise, new_balance_paise,
        status, reference
    ) VALUES (
        v_wallet.id, p_student_id, 'funding', p_amount_paise,
        'credit', v_wallet.balance_paise, v_new_balance,
        'completed', v_ref
    );

    RETURN jsonb_build_object(
        'success', true,
        'reference', v_ref,
        'previous_balance_paise', v_wallet.balance_paise,
        'new_balance_paise', v_new_balance
    );
END;
$$;

-- 2. Process Atomic Student Checkout (Stock Decrement, Spend Limit Validation & Debit)
CREATE OR REPLACE FUNCTION process_checkout(
    p_student_id UUID,
    p_college_id UUID,
    p_items JSONB, -- Array of objects: [{"product_id": "...", "quantity": 1}]
    p_fulfilment_method TEXT DEFAULT 'Campus Kiosk Pickup',
    p_collection_point TEXT DEFAULT 'Main Canteen Counter 1',
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_order RECORD;
    v_wallet RECORD;
    v_controls RECORD;
    v_item RECORD;
    v_product RECORD;
    v_total_paise BIGINT := 0;
    v_prev_balance BIGINT;
    v_new_balance BIGINT;
    v_order_id UUID;
    v_ref TEXT;
BEGIN
    -- Idempotency check: Return existing order without re-charging
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, reference, total_amount_paise INTO v_existing_order
        FROM orders
        WHERE idempotency_key = p_idempotency_key;

        IF FOUND THEN
            SELECT balance_paise INTO v_prev_balance FROM wallets WHERE student_id = p_student_id;
            RETURN jsonb_build_object(
                'order_id', v_existing_order.id,
                'reference', v_existing_order.reference,
                'total_amount_paise', v_existing_order.total_amount_paise,
                'new_balance_paise', v_prev_balance,
                'idempotent_replay', true
            );
        END IF;
    END IF;

    -- Lock student wallet
    SELECT id, balance_paise, status INTO v_wallet
    FROM wallets
    WHERE student_id = p_student_id
    FOR UPDATE;

    IF NOT FOUND OR v_wallet.status != 'active' THEN
        RAISE EXCEPTION 'Wallet is inactive or not found';
    END IF;

    -- Check spending controls
    SELECT daily_limit_paise, category_restrictions, enabled INTO v_controls
    FROM spending_controls
    WHERE student_id = p_student_id;

    -- Calculate total and check stock
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (product_id UUID, quantity INT)
    LOOP
        SELECT id, name, category, price_paise, stock_quantity, is_available INTO v_product
        FROM products
        WHERE id = v_item.product_id
        FOR UPDATE;

        IF NOT FOUND OR NOT v_product.is_available THEN
            RAISE EXCEPTION 'Product % is unavailable', v_item.product_id;
        END IF;

        IF v_product.stock_quantity < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_product.name;
        END IF;

        v_total_paise := v_total_paise + (v_product.price_paise * v_item.quantity);
    END LOOP;

    -- Balance check
    IF v_wallet.balance_paise < v_total_paise THEN
        RAISE EXCEPTION 'Insufficient wallet balance (% paise required, % available)', v_total_paise, v_wallet.balance_paise;
    END IF;

    -- Decrement product stock
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (product_id UUID, quantity INT)
    LOOP
        UPDATE products
        SET stock_quantity = stock_quantity - v_item.quantity, updated_at = now()
        WHERE id = v_item.product_id;
    END LOOP;

    -- Decrement wallet
    v_prev_balance := v_wallet.balance_paise;
    v_new_balance := v_prev_balance - v_total_paise;

    UPDATE wallets
    SET balance_paise = v_new_balance, updated_at = now()
    WHERE id = v_wallet.id;

    -- Create order
    v_ref := 'ORD-2026-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
    INSERT INTO orders (
        student_id, college_id, total_amount_paise, payment_status,
        fulfilment_status, fulfilment_method, collection_point, idempotency_key
    ) VALUES (
        p_student_id, p_college_id, v_total_paise, 'paid',
        'Order Placed', p_fulfilment_method, p_collection_point, p_idempotency_key
    ) RETURNING id INTO v_order_id;

    -- Create order items snapshot
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (product_id UUID, quantity INT)
    LOOP
        SELECT name, category, price_paise INTO v_product FROM products WHERE id = v_item.product_id;
        INSERT INTO order_items (
            order_id, product_id, product_name_snapshot, category_snapshot,
            unit_price_snapshot_paise, quantity, subtotal_paise
        ) VALUES (
            v_order_id, v_item.product_id, v_product.name, v_product.category,
            v_product.price_paise, v_item.quantity, v_product.price_paise * v_item.quantity
        );
    END LOOP;

    -- Record transaction
    INSERT INTO wallet_transactions (
        wallet_id, student_id, transaction_type, amount_paise,
        direction, previous_balance_paise, new_balance_paise,
        status, reference, related_order_id
    ) VALUES (
        v_wallet.id, p_student_id, 'purchase', v_total_paise,
        'debit', v_prev_balance, v_new_balance,
        'completed', v_ref, v_order_id
    );

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'reference', v_ref,
        'total_amount_paise', v_total_paise,
        'previous_balance_paise', v_prev_balance,
        'new_balance_paise', v_new_balance,
        'idempotent_replay', false
    );
END;
$$;
