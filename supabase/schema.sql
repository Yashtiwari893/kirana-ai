-- KiranaAI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════
-- TABLE: shops
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  whatsapp_number TEXT UNIQUE NOT NULL,
  eleven_za_api_key TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  working_hours_start TEXT DEFAULT '09:00',
  working_hours_end TEXT DEFAULT '21:00',
  bot_greeting TEXT DEFAULT 'Namaste! Main aapka kirana bot hoon. Order ke liye item aur quantity likhein jaise: 2kg aata, 1 litre tel',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE: products
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_aliases TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'piece',
  category TEXT DEFAULT 'General',
  stock_qty DECIMAL(10,2) DEFAULT 0,
  reorder_level DECIMAL(10,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE: customers
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  whatsapp_number TEXT NOT NULL,
  name TEXT,
  tags TEXT[] DEFAULT '{}',
  total_orders INTEGER DEFAULT 0,
  total_spend DECIMAL(10,2) DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  reorder_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shop_id, whatsapp_number)
);

-- ════════════════════════════════════════
-- TABLE: orders
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'packed', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  raw_message TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- TABLE: broadcasts
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  audience_segment TEXT DEFAULT 'all' CHECK (audience_segment IN ('all', 'regular', 'new', 'premium', 'churned')),
  sent_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════
-- INDEXES for performance
-- ════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_shop_id ON broadcasts(shop_id);

-- ════════════════════════════════════════
-- Row Level Security (RLS)
-- ════════════════════════════════════════
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Shops: Owner can only see their own shop
CREATE POLICY "Owners can manage their shop" ON shops
  FOR ALL USING (auth.uid() = owner_id);

-- Products: Shop owner can manage their products
CREATE POLICY "Shop owners manage products" ON products
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Customers: Shop owner can see their customers
CREATE POLICY "Shop owners manage customers" ON customers
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Orders: Shop owner can manage their orders
CREATE POLICY "Shop owners manage orders" ON orders
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Broadcasts: Shop owner can manage their broadcasts
CREATE POLICY "Shop owners manage broadcasts" ON broadcasts
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- ════════════════════════════════════════
-- Updated_at trigger function
-- ════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
