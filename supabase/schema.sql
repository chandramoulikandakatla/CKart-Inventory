-- ==============================================================================
-- CampusKart PostgreSQL / Supabase Production Schema & Seed Data
-- ==============================================================================
-- Single self-contained idempotent script for Supabase SQL Editor.
-- Monetary values stored in integer paise (BIGINT) to eliminate rounding errors.
-- Includes full DDL, RLS policies, RPC functions, and 74 curated products.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Table Definitions
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    institution_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    pilot_window TEXT NOT NULL,
    collection_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
    student_code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    account_status TEXT NOT NULL CHECK (account_status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    pin_hash TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parent_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_account_id UUID NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'Guardian',
    status TEXT NOT NULL CHECK (status IN ('verified', 'pending', 'revoked')) DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, parent_account_id)
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    balance_paise BIGINT NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('active', 'frozen')) DEFAULT 'active',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    price_paise BIGINT NOT NULL CHECK (price_paise > 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
    total_amount_paise BIGINT NOT NULL CHECK (total_amount_paise > 0),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'paid',
    fulfilment_status TEXT NOT NULL CHECK (fulfilment_status IN ('Order Placed', 'Payment Confirmed', 'Accepted', 'Preparing', 'Ready for Collection', 'Completed', 'Cancelled')) DEFAULT 'Order Placed',
    fulfilment_method TEXT NOT NULL DEFAULT 'Campus Kiosk Pickup',
    collection_point TEXT NOT NULL DEFAULT 'Main Canteen Counter 1',
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot TEXT NOT NULL DEFAULT '',
    category_snapshot TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_paise BIGINT NOT NULL DEFAULT 0,
    subtotal_paise BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL,
    amount_paise BIGINT NOT NULL,
    direction TEXT DEFAULT 'credit',
    previous_balance_paise BIGINT DEFAULT 0,
    new_balance_paise BIGINT DEFAULT 0,
    balance_after_paise BIGINT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    reference TEXT,
    reference_id TEXT,
    reference_type TEXT,
    description TEXT,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spending_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    daily_limit_paise BIGINT DEFAULT 50000,
    weekly_limit_paise BIGINT DEFAULT 200000,
    monthly_limit_paise BIGINT DEFAULT 500000,
    restricted_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    low_balance_threshold_paise BIGINT DEFAULT 15000,
    instant_txn_notification BOOLEAN DEFAULT true,
    spending_alerts_enabled BOOLEAN DEFAULT true,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order', 'wallet', 'alert', 'system')) DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Row Level Security (RLS) & Policies
-- ------------------------------------------------------------------------------

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DO $$
BEGIN
    DROP POLICY IF EXISTS "allow_read_colleges" ON colleges;
    DROP POLICY IF EXISTS "allow_read_products" ON products;
    DROP POLICY IF EXISTS "allow_all_products" ON products;
    DROP POLICY IF EXISTS "allow_all_students" ON students;
    DROP POLICY IF EXISTS "allow_all_wallets" ON wallets;
    DROP POLICY IF EXISTS "allow_all_orders" ON orders;
    DROP POLICY IF EXISTS "allow_all_order_items" ON order_items;
    DROP POLICY IF EXISTS "allow_all_wallet_transactions" ON wallet_transactions;
    DROP POLICY IF EXISTS "allow_all_spending_controls" ON spending_controls;
    DROP POLICY IF EXISTS "allow_all_notifications" ON notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Permissive policies for application access via Supabase Client
CREATE POLICY "allow_read_colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "allow_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "allow_all_products" ON products FOR ALL USING (true);
CREATE POLICY "allow_all_students" ON students FOR ALL USING (true);
CREATE POLICY "allow_all_wallets" ON wallets FOR ALL USING (true);
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (true);
CREATE POLICY "allow_all_order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "allow_all_wallet_transactions" ON wallet_transactions FOR ALL USING (true);
CREATE POLICY "allow_all_spending_controls" ON spending_controls FOR ALL USING (true);
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 3. Atomic Database Functions (RPCs)
-- ------------------------------------------------------------------------------

-- Function 1: fund_student_wallet
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
        direction, previous_balance_paise, new_balance_paise, balance_after_paise,
        status, reference, reference_id, reference_type, description
    ) VALUES (
        v_wallet.id, p_student_id, 'CREDIT', p_amount_paise,
        'credit', v_wallet.balance_paise, v_new_balance, v_new_balance,
        'completed', v_ref, v_ref, 'PARENT_FUNDING', 'Parent Wallet Top-up via ' || p_method
    );

    RETURN jsonb_build_object(
        'success', true,
        'reference', v_ref,
        'previous_balance_paise', v_wallet.balance_paise,
        'new_balance_paise', v_new_balance
    );
END;
$$;

-- Function 2: process_checkout
CREATE OR REPLACE FUNCTION process_checkout(
    p_student_id UUID,
    p_college_id UUID,
    p_items JSONB,
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
    v_item RECORD;
    v_product RECORD;
    v_total_paise BIGINT := 0;
    v_prev_balance BIGINT;
    v_new_balance BIGINT;
    v_order_id UUID;
    v_ref TEXT;
BEGIN
    -- Idempotency check
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, total_amount_paise INTO v_existing_order
        FROM orders
        WHERE idempotency_key = p_idempotency_key;

        IF FOUND THEN
            SELECT balance_paise INTO v_prev_balance FROM wallets WHERE student_id = p_student_id;
            RETURN jsonb_build_object(
                'order_id', v_existing_order.id,
                'reference', 'REPLAY',
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
            quantity, unit_price_paise, subtotal_paise
        ) VALUES (
            v_order_id, v_item.product_id, v_product.name, v_product.category,
            v_item.quantity, v_product.price_paise, v_product.price_paise * v_item.quantity
        );
    END LOOP;

    -- Record transaction
    INSERT INTO wallet_transactions (
        wallet_id, student_id, transaction_type, amount_paise,
        direction, previous_balance_paise, new_balance_paise, balance_after_paise,
        status, reference, reference_id, reference_type, description, related_order_id
    ) VALUES (
        v_wallet.id, p_student_id, 'DEBIT', v_total_paise,
        'debit', v_prev_balance, v_new_balance, v_new_balance,
        'completed', v_ref, v_ref, 'STUDENT_PURCHASE', 'Purchase at campus smart counter', v_order_id
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

-- ------------------------------------------------------------------------------
-- 4. Initial Seed Data
-- ------------------------------------------------------------------------------

-- Default College
INSERT INTO colleges (id, name, institution_code, status, pilot_window, collection_points)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Sri Chaitanya & Narayana Junior Academy',
    'SCNA-HYD-01',
    'active',
    '12:30 PM - 01:45 PM & 04:15 PM - 05:30 PM',
    '["Block A Smart Kiosk #1", "Block B Academic Wing #2", "Hostel Gate Dispensary #3"]'::jsonb
)
ON CONFLICT (institution_code) DO NOTHING;

-- Default Students
INSERT INTO students (id, college_id, student_code, first_name, last_name, academic_year, account_status)
VALUES
    ('s0000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000001', 'CK-2026-101', 'Aarav', 'Sharma', 'Intermediate Second Year (MPC)', 'active'),
    ('s0000000-0000-0000-0000-000000000102', 'c0000000-0000-0000-0000-000000000001', 'CK-2026-102', 'Diya', 'Reddy', 'Intermediate First Year (BiPC)', 'active'),
    ('s0000000-0000-0000-0000-000000000103', 'c0000000-0000-0000-0000-000000000001', 'CK-2026-103', 'Rohan', 'Verma', 'Intermediate Second Year (MPC)', 'active')
ON CONFLICT (student_code) DO NOTHING;

-- Student Wallets
INSERT INTO wallets (id, student_id, balance_paise, status)
VALUES
    ('w0000000-0000-0000-0000-000000000101', 's0000000-0000-0000-0000-000000000101', 0, 'active'),
    ('w0000000-0000-0000-0000-000000000102', 's0000000-0000-0000-0000-000000000102', 0, 'active'),
    ('w0000000-0000-0000-0000-000000000103', 's0000000-0000-0000-0000-000000000103', 0, 'active')
ON CONFLICT (student_id) DO NOTHING;

-- Spending Controls
INSERT INTO spending_controls (student_id, daily_limit_paise, weekly_limit_paise, monthly_limit_paise)
VALUES
    ('s0000000-0000-0000-0000-000000000101', 50000, 200000, 500000),
    ('s0000000-0000-0000-0000-000000000102', 35000, 150000, 350000),
    ('s0000000-0000-0000-0000-000000000103', 40000, 150000, 300000)
ON CONFLICT (student_id) DO NOTHING;

-- 74 Final Products Catalog across 15 Categories
INSERT INTO products (id, college_id, name, description, category, image_url, price_paise, stock_quantity, is_available)
VALUES
('p0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Bingo Original Style', 'Thin cut, crispy golden potato chips seasoned with fine rock salt.', 'Chips', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400', 2000, 50, true),
  ('p0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Bingo Mad Angles', 'Triangle-shaped crispy corn snacks with tangy mango pickle spice blend.', 'Chips', 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&q=80&w=400', 2000, 45, true),
  ('p0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Lay''s', 'India''s favorite ridged potato chips seasoned with vibrant aromatic spices.', 'Chips', 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&q=80&w=400', 2000, 60, true),
  ('p0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Kurkure', 'Crunchy puffed corn curls packed with authentic zesty Indian tadka spices.', 'Chips', 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?auto=format&fit=crop&q=80&w=400', 2000, 55, true),
  ('p0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Too Yumm!', 'Guilt-free crunchy baked multigrain chips seasoned with Spanish tomato.', 'Chips', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400', 2500, 40, true),
  ('p0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Britannia Toastea', 'Crispy twice-baked premium wheat rusks infused with aromatic cardamom.', 'Rusks & Wafers', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', 3500, 40, true),
  ('p0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'Parel Real Elaichi Rusk', 'Golden baked crunchy tea rusks enriched with real ground green cardamom.', 'Rusks & Wafers', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', 3000, 35, true),
  ('p0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'Dukes Waffy Chocolate Wafer', 'Multi-layered crispy wafer biscuits loaded with velvety cocoa cream.', 'Rusks & Wafers', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400', 4500, 30, true),
  ('p0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'Dukes Waffy Choco Wafer Roll', 'Crispy tubular wafer rolls filled with rich molten chocolate cream.', 'Rusks & Wafers', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400', 5000, 25, true),
  ('p0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'Britannia Treat Rich Cream Strawberry', 'Crunchy golden crust biscuits filled with smooth sweet strawberry cream.', 'Rusks & Wafers', 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&q=80&w=400', 3000, 35, true),
  ('p0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'Cornitos Tomato Mexicana Crisps', 'Stone-ground crunchy corn nachos tossed in tangy tomato and herbs.', 'Nachos', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=400', 4000, 35, true),
  ('p0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000001', 'Doritos Dinamita Sizzling Hot', 'Rolled tortilla chips exploding with intense spicy chili and zesty lime.', 'Nachos', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400', 5000, 30, true),
  ('p0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000001', 'Doritos Cheese', 'Iconic triangular corn tortilla chips generously coated with cheddar cheese.', 'Nachos', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=400', 4000, 45, true),
  ('p0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000001', 'Cornitos Peri Peri', 'Crisp corn nachos dusted with bold African peri-peri chili blend.', 'Nachos', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400', 4000, 30, true),
  ('p0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000001', 'Bingo Mad Angles Pizza Nachos', 'Triangle corn crisps packed with Italian oregano, mozzarella notes, and tomato.', 'Nachos', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=400', 3500, 35, true),
  ('p0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000001', 'Let''s Try Onion Bhujia', 'Crispy besan bhujia elevated with caramelized roasted onion seasoning.', 'Bhujia & Mixtures', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400', 4500, 25, true),
  ('p0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000001', 'Haldiram''s Aloo Bhujia', 'Crispy spicy potato and gram flour sev seasoned with cool mint and spices.', 'Bhujia & Mixtures', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400', 4000, 65, true),
  ('p0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000001', 'Haldiram''s Khatta Meetha', 'Blend of sev, puffed rice, green peas, peanuts, and sago nuts.', 'Bhujia & Mixtures', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400', 4000, 50, true),
  ('p0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000001', 'Haldiram''s Moong Dal Namkeen', 'Lightly fried and salted yellow split moong dal, crisp and savory.', 'Bhujia & Mixtures', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400', 4500, 40, true),
  ('p0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000001', 'Haldiram''s Mixture Namkeen', 'Assorted spicy savory mix with cornflakes, gram sev, and roasted nuts.', 'Bhujia & Mixtures', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400', 4000, 45, true),
  ('p0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000001', 'Slurrp Farm Choco Crunch', 'Healthy ragi and jowar chocolate cereal stars with zero refined sugar.', 'Breakfast Cereals', 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&q=80&w=400', 18000, 20, true),
  ('p0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000001', 'Kellogg''s Multigrain Chocos', 'Crunchy multigrain chocolate scoops packed with protein and dietary fiber.', 'Breakfast Cereals', 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=400', 12000, 35, true),
  ('p0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000001', 'Kellogg''s Corn Flakes', 'Golden crispy toasted flakes of sun-ripened corn fortified with essential iron.', 'Breakfast Cereals', 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&q=80&w=400', 11000, 30, true),
  ('p0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000001', 'Kellogg''s Double Chocolate Fills', 'Crispy grain pillows filled with rich double chocolate cream.', 'Breakfast Cereals', 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=400', 16000, 25, true),
  ('p0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000001', 'Tata Soulfull Ragi Bites', 'Nutritious finger millet ragi bites with smooth melt-in-mouth vanilla center.', 'Breakfast Cereals', 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&q=80&w=400', 13000, 25, true),
  ('p0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000001', 'Snickers', 'Milk chocolate bar packed with roasted crunchy peanuts, caramel, and nougat.', 'Chocolate', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=400', 4500, 50, true),
  ('p0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000001', 'Munch', 'Crispy crunchy wafer layers coated with smooth sweet chocolate.', 'Chocolate', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=400', 2000, 60, true),
  ('p0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000001', 'Lotte Choco Pie', 'Soft fluffy baked sponge biscuits filled with stretchy marshmallow cream.', 'Chocolate', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400', 3500, 40, true),
  ('p0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000001', 'KitKat', 'Crispy 4-finger chocolate wafer bar designed for study session pauses.', 'Chocolate', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=400', 3000, 55, true),
  ('p0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000001', 'Dairy Milk', 'Pure rich creamy milk chocolate bar, the quintessential sweet indulgence.', 'Chocolate', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=400', 4000, 70, true),
  ('p0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000001', 'Hide & Seek Chocolate Chips', 'Rich dark cocoa cookies studded with decadent melted chocolate chips.', 'Biscuits', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400', 3500, 45, true),
  ('p0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000001', 'Britannia Good Day Pista Badam', 'Buttery golden baked biscuits enriched with slivers of pistachios and almonds.', 'Biscuits', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400', 3000, 50, true),
  ('p0000000-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000001', 'Britannia Good Day Cashew', 'Sweet melt-in-the-mouth cookies sprinkled with roasted cashew nut crunch.', 'Biscuits', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400', 3000, 55, true),
  ('p0000000-0000-0000-0000-000000000034', 'c0000000-0000-0000-0000-000000000001', 'Dark Fantasy', 'Crispy cocoa crust cookie enclosing a rich molten chocolate center.', 'Biscuits', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400', 4500, 40, true),
  ('p0000000-0000-0000-0000-000000000035', 'c0000000-0000-0000-0000-000000000001', 'Mom''s Magic', 'Aromatic buttery cookies baked with toasted nut pieces for a homestyle taste.', 'Biscuits', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400', 2500, 45, true),
  ('p0000000-0000-0000-0000-000000000036', 'c0000000-0000-0000-0000-000000000001', 'Dove Cream', 'Gentle skin-cleansing beauty bar infused with rich moisturizing cream.', 'Bathing Soaps', 'https://images.unsplash.com/photo-1607006314592-3c13f631ef89?auto=format&fit=crop&q=80&w=400', 5500, 40, true),
  ('p0000000-0000-0000-0000-000000000037', 'c0000000-0000-0000-0000-000000000001', 'Santoor Skin', 'Enriched with natural sandalwood and turmeric for glowing skin.', 'Bathing Soaps', 'https://images.unsplash.com/photo-1607006314592-3c13f631ef89?auto=format&fit=crop&q=80&w=400', 3800, 45, true),
  ('p0000000-0000-0000-0000-000000000038', 'c0000000-0000-0000-0000-000000000001', 'Medimix Ayurvedic', 'Herbal soap bar with 18 medicinal plant extracts to prevent acne and body odor.', 'Bathing Soaps', 'https://images.unsplash.com/photo-1607006314592-3c13f631ef89?auto=format&fit=crop&q=80&w=400', 4200, 35, true),
  ('p0000000-0000-0000-0000-000000000039', 'c0000000-0000-0000-0000-000000000001', 'Fiama Blackcurrant', 'Cooling transparent gel soap with conditioning blackcurrant and jojoba oil.', 'Bathing Soaps', 'https://images.unsplash.com/photo-1607006314592-3c13f631ef89?auto=format&fit=crop&q=80&w=400', 6500, 30, true),
  ('p0000000-0000-0000-0000-000000000040', 'c0000000-0000-0000-0000-000000000001', 'Himalaya Neem & Turmeric', 'Herbal neem formulation protecting campus scholars from dust and bacteria.', 'Bathing Soaps', 'https://images.unsplash.com/photo-1607006314592-3c13f631ef89?auto=format&fit=crop&q=80&w=400', 4500, 40, true),
  ('p0000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000001', 'L''Oréal Paris Extraordinary Oil', 'Multi-benefit floral oil serum giving instant shine and frizz control.', 'Hair Oil & Serum', 'https://images.unsplash.com/photo-1608248597359-0a6d0c9f170d?auto=format&fit=crop&q=80&w=400', 19900, 25, true),
  ('p0000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000001', 'Bajaj Almond Drops Hair Oil', 'Non-sticky sweet almond oil strengthening hair roots without oily residue.', 'Hair Oil & Serum', 'https://images.unsplash.com/photo-1608248597359-0a6d0c9f170d?auto=format&fit=crop&q=80&w=400', 7500, 35, true),
  ('p0000000-0000-0000-0000-000000000043', 'c0000000-0000-0000-0000-000000000001', 'Parachute Coconut Oil', 'Pure edible-grade coconut oil nourishing dry scalps and hair shafts.', 'Hair Oil & Serum', 'https://images.unsplash.com/photo-1608248597359-0a6d0c9f170d?auto=format&fit=crop&q=80&w=400', 5000, 50, true),
  ('p0000000-0000-0000-0000-000000000044', 'c0000000-0000-0000-0000-000000000001', 'Parachute Advanced Aloe Vera', 'Lightweight coconut oil blended with soothing organic aloe vera extracts.', 'Hair Oil & Serum', 'https://images.unsplash.com/photo-1608248597359-0a6d0c9f170d?auto=format&fit=crop&q=80&w=400', 6500, 35, true),
  ('p0000000-0000-0000-0000-000000000045', 'c0000000-0000-0000-0000-000000000001', 'Dabur Amla Hair Oil', 'Enriched with real amla fruit extracts for strong, dark, and resilient hair.', 'Hair Oil & Serum', 'https://images.unsplash.com/photo-1608248597359-0a6d0c9f170d?auto=format&fit=crop&q=80&w=400', 6000, 40, true),
  ('p0000000-0000-0000-0000-000000000046', 'c0000000-0000-0000-0000-000000000001', 'TRESemmé Keratin Smooth', 'Salon quality keratin and argan oil shampoo delivering silk-smooth locks.', 'Shampoo & Conditioner', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=400', 16000, 30, true),
  ('p0000000-0000-0000-0000-000000000047', 'c0000000-0000-0000-0000-000000000001', 'Meera Strong & Healthy', 'Traditional herbal shampoo bar preventing hair fall and breakage.', 'Shampoo & Conditioner', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=400', 8500, 35, true),
  ('p0000000-0000-0000-0000-000000000048', 'c0000000-0000-0000-0000-000000000001', 'Mediker Anti-Lice', 'Gentle herbal solution with active natural ingredients for scalp hygiene.', 'Shampoo & Conditioner', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=400', 7000, 25, true),
  ('p0000000-0000-0000-0000-000000000049', 'c0000000-0000-0000-0000-000000000001', 'L''Oréal Paris Shampoo', 'Ceramide formula repairing dry, dull, brittle and coarse hair strands.', 'Shampoo & Conditioner', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=400', 18000, 30, true),
  ('p0000000-0000-0000-0000-000000000050', 'c0000000-0000-0000-0000-000000000001', 'Head & Shoulders Cool Menthol', 'Invigorating menthol shampoo eliminating 100% visible dandruff flakes.', 'Shampoo & Conditioner', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=400', 14000, 45, true),
  ('p0000000-0000-0000-0000-000000000051', 'c0000000-0000-0000-0000-000000000001', 'Sirona Disposable Period Pants', 'Ultra-absorbent disposable period panties for full nighttime reassurance.', 'Feminine Care', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 19900, 25, true),
  ('p0000000-0000-0000-0000-000000000052', 'c0000000-0000-0000-0000-000000000001', 'Stayfree Secure Nights', 'Night sanitary napkins with deep absorbent channels and odor control.', 'Feminine Care', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 9500, 40, true),
  ('p0000000-0000-0000-0000-000000000053', 'c0000000-0000-0000-0000-000000000001', 'Whisper Choice Stain', 'Soft non-chafing wings preventing side leakage during long lectures.', 'Feminine Care', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 6000, 50, true),
  ('p0000000-0000-0000-0000-000000000054', 'c0000000-0000-0000-0000-000000000001', 'Whisper Choice Nights', 'Extended length night pads with gel-lock core for worry-free sleep.', 'Feminine Care', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 8000, 45, true),
  ('p0000000-0000-0000-0000-000000000055', 'c0000000-0000-0000-0000-000000000001', 'Plush Teen', 'Hypoallergenic pure organic cotton sanitary pads for delicate young skin.', 'Feminine Care', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 12000, 30, true),
  ('p0000000-0000-0000-0000-000000000056', 'c0000000-0000-0000-0000-000000000001', 'Banana', 'Fresh naturally ripened bananas providing sustained classroom potassium energy.', 'Fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400', 4000, 40, true),
  ('p0000000-0000-0000-0000-000000000057', 'c0000000-0000-0000-0000-000000000001', 'Apple', 'Sweet, crunchy and antioxidant-packed handpicked red apples.', 'Fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400', 7000, 35, true),
  ('p0000000-0000-0000-0000-000000000058', 'c0000000-0000-0000-0000-000000000001', 'Orange', 'Juicy, easy-to-peel citrus oranges packed with natural Vitamin C.', 'Fruits', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=400', 5000, 35, true),
  ('p0000000-0000-0000-0000-000000000059', 'c0000000-0000-0000-0000-000000000001', 'Grapes', 'Crisp and juicy sweet green table grapes, washed and packed fresh.', 'Fruits', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=400', 6500, 30, true),
  ('p0000000-0000-0000-0000-000000000060', 'c0000000-0000-0000-0000-000000000001', 'Dragon Fruit', 'Nutritious vibrant dragon fruit with crisp mildly sweet flesh.', 'Fruits', 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&q=80&w=400', 9500, 20, true),
  ('p0000000-0000-0000-0000-000000000061', 'c0000000-0000-0000-0000-000000000001', 'Almonds', 'Premium grade crunchy whole almonds rich in protein and Vitamin E.', 'Dry Fruits', 'https://images.unsplash.com/photo-1508061252966-f72fb98279fe?auto=format&fit=crop&q=80&w=400', 14000, 35, true),
  ('p0000000-0000-0000-0000-000000000062', 'c0000000-0000-0000-0000-000000000001', 'Cashews', 'Rich buttery whole cashew nuts, perfect for study breaks and mental focus.', 'Dry Fruits', 'https://images.unsplash.com/photo-1509912760195-56a9354009cf?auto=format&fit=crop&q=80&w=400', 16000, 30, true),
  ('p0000000-0000-0000-0000-000000000063', 'c0000000-0000-0000-0000-000000000001', 'Walnuts', 'Omega-3 rich vacuum-packed walnut halves supporting brain memory function.', 'Dry Fruits', 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400', 18000, 25, true),
  ('p0000000-0000-0000-0000-000000000064', 'c0000000-0000-0000-0000-000000000001', 'Pistachios', 'Crispy in-shell Iranian pistachios roasted with Himalayan mineral salt.', 'Dry Fruits', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=400', 17500, 25, true),
  ('p0000000-0000-0000-0000-000000000065', 'c0000000-0000-0000-0000-000000000001', 'Raisins', 'Naturally sweet sun-dried seedless golden raisins high in natural iron.', 'Dry Fruits', 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=400', 8500, 40, true),
  ('p0000000-0000-0000-0000-000000000066', 'c0000000-0000-0000-0000-000000000001', 'Rin Ala', 'Advanced bleach formula giving blinding shine to white uniforms and lab coats.', 'Laundry Care', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400', 4500, 35, true),
  ('p0000000-0000-0000-0000-000000000067', 'c0000000-0000-0000-0000-000000000001', 'Comfort Morning Fresh', 'Fragrance booster and fabric conditioner providing all-day fresh scent.', 'Laundry Care', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 7500, 40, true),
  ('p0000000-0000-0000-0000-000000000068', 'c0000000-0000-0000-0000-000000000001', 'Surf Excel Easy Wash Powder', 'Superfine powder dissolving fast to remove stubborn hostel ink and mud stains.', 'Laundry Care', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400', 8500, 50, true),
  ('p0000000-0000-0000-0000-000000000069', 'c0000000-0000-0000-0000-000000000001', 'Tide Plus Double Power', 'Double power stain removal formula keeping hostel clothes bright and fresh.', 'Laundry Care', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400', 7000, 45, true),
  ('p0000000-0000-0000-0000-000000000070', 'c0000000-0000-0000-0000-000000000001', 'Ariel Powder', 'High performance deep cleaning detergent powder for college washing machines.', 'Laundry Care', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400', 9900, 35, true),
  ('p0000000-0000-0000-0000-000000000071', 'c0000000-0000-0000-0000-000000000001', 'Dettol Antiseptic', 'Trusted antiseptic liquid for cuts, bites, shaving and laundry hygiene.', 'Disinfectants', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 6500, 45, true),
  ('p0000000-0000-0000-0000-000000000072', 'c0000000-0000-0000-0000-000000000001', 'Dettol Original Multi-use', 'Antibacterial multi-surface disinfectant spray killing 99.9% illness germs.', 'Disinfectants', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 9900, 30, true),
  ('p0000000-0000-0000-0000-000000000073', 'c0000000-0000-0000-0000-000000000001', 'Dettol Lime Fresh', 'Floor and hostel room cleaning disinfectant with long-lasting lime fragrance.', 'Disinfectants', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=400', 7500, 35, true),
  ('p0000000-0000-0000-0000-000000000074', 'c0000000-0000-0000-0000-000000000001', 'Savlon Germ Protection', 'Chlorhexidine and cetrimide antiseptic healing liquid that does not sting on cuts.', 'Disinfectants', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400', 5500, 40, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    price_paise = EXCLUDED.price_paise,
    stock_quantity = EXCLUDED.stock_quantity,
    is_available = EXCLUDED.is_available;

-- ------------------------------------------------------------------------------
-- 5. Permissions & PostgREST Schema Cache Refresh
-- ------------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Notify PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';
