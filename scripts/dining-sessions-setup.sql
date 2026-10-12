-- ═════════════════════════════════════════════════════════════════════
-- Hotel Ambrosia — Dining Sessions & Running Bill Setup for Supabase
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ═════════════════════════════════════════════════════════════════════

-- 1. Create dining_sessions table
CREATE TABLE IF NOT EXISTS dining_sessions (
  id TEXT PRIMARY KEY,
  session_number TEXT NOT NULL,
  bill_number TEXT DEFAULT '',
  table_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finalized', 'closed')),
  order_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- 2. Add session_id and order_round to restaurant_orders table if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_orders' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE restaurant_orders ADD COLUMN session_id TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_orders' AND column_name = 'order_round'
  ) THEN
    ALTER TABLE restaurant_orders ADD COLUMN order_round INTEGER DEFAULT 1;
  END IF;
END $$;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dining_sessions_status ON dining_sessions(status);
CREATE INDEX IF NOT EXISTS idx_dining_sessions_table ON dining_sessions(table_number);
CREATE INDEX IF NOT EXISTS idx_dining_sessions_phone ON dining_sessions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_dining_sessions_created_at ON dining_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_session_id ON restaurant_orders(session_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE dining_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Public can insert dining_sessions" ON dining_sessions;
CREATE POLICY "Public can insert dining_sessions" ON dining_sessions 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read dining_sessions" ON dining_sessions;
CREATE POLICY "Public can read dining_sessions" ON dining_sessions 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update dining_sessions" ON dining_sessions;
CREATE POLICY "Public can update dining_sessions" ON dining_sessions 
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can do everything on dining_sessions" ON dining_sessions;
CREATE POLICY "Authenticated admins can do everything on dining_sessions" ON dining_sessions 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE dining_sessions;
