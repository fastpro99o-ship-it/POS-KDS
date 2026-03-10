-- ==========================================
-- RESTAURANT POS PROFESSIONAL SCHEMA
-- ==========================================

-- 1. EXTENSIONS (Optional but recommended)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    station TEXT DEFAULT 'Kitchen',
    emoji TEXT,
    available BOOLEAN DEFAULT true,
    categories TEXT[], -- Array of categories
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE (Main Tracking)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    table_number TEXT,
    type TEXT DEFAULT 'Dine-In', -- Dine-In, Carry-Out, Delivery
    status TEXT DEFAULT 'pending', -- pending, preparing, ready, completed, cancelled
    total_amount DECIMAL(10,2) DEFAULT 0,
    items JSONB NOT NULL, -- Detailed snapshot of items sold
    payment_method TEXT DEFAULT 'Cash',
    notes TEXT,
    waiter_name TEXT,
    preparation_start_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    restaurant_name TEXT DEFAULT 'PARIS FOOD',
    address TEXT,
    phone TEXT,
    currency TEXT DEFAULT 'DH',
    tax_percent DECIMAL(5,2) DEFAULT 0,
    header_message TEXT,
    footer_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INITIAL SETTINGS DATA
INSERT INTO settings (id, restaurant_name) 
VALUES (1, 'PARIS FOOD')
ON CONFLICT (id) DO NOTHING;

-- 6. SECURITY: ENABLE REALTIME (Crucial for KDS)
-- Note: Run these manually in Supabase SQL editor if needed
-- alter publication supabase_realtime add table orders;
-- alter publication supabase_realtime add table menu_items;
