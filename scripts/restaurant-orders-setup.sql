-- ═════════════════════════════════════════════════════════════════════
-- Hotel Ambrosia — Restaurant Orders Setup for Supabase
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ═════════════════════════════════════════════════════════════════════

-- 1. Create restaurant_orders table
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  table_number TEXT DEFAULT '',
  pickup_time TEXT DEFAULT '',
  delivery_address TEXT DEFAULT '',
  delivery_distance_km NUMERIC(5,2) DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  special_instructions TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_status ON restaurant_orders(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_created_at ON restaurant_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_customer_phone ON restaurant_orders(customer_phone);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Allow public (anyone) to create/insert a new order
DROP POLICY IF EXISTS "Public can insert restaurant_orders" ON restaurant_orders;
CREATE POLICY "Public can insert restaurant_orders" ON restaurant_orders 
  FOR INSERT WITH CHECK (true);

-- Allow public to view orders (needed for customer tracking receipt)
DROP POLICY IF EXISTS "Public can read restaurant_orders" ON restaurant_orders;
CREATE POLICY "Public can read restaurant_orders" ON restaurant_orders 
  FOR SELECT USING (true);

-- Allow authenticated users (admin) to update orders (status progression) and delete
DROP POLICY IF EXISTS "Authenticated admins can do everything on restaurant_orders" ON restaurant_orders;
CREATE POLICY "Authenticated admins can do everything on restaurant_orders" ON restaurant_orders 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow public update for seamless status tracking in demo/dev mode if not authenticated
DROP POLICY IF EXISTS "Public can update status on restaurant_orders" ON restaurant_orders;
CREATE POLICY "Public can update status on restaurant_orders" ON restaurant_orders 
  FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_orders;
