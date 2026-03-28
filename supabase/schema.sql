-- ============================================================
-- BarbadosBespoke — Supabase Database Schema
-- Run this in the Supabase SQL Editor for your NEW project.
-- ============================================================

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  date                  TEXT NOT NULL,
  events                JSONB NOT NULL DEFAULT '[]',
  total_cost_bbd        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_duration_minutes INTEGER NOT NULL DEFAULT 0,
  preferences           JSONB NOT NULL DEFAULT '{}',
  special_notes         TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);


-- Locations table (pre-seeded curated Barbados spots)
CREATE TABLE IF NOT EXISTS locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  address       TEXT NOT NULL,
  lat           DECIMAL(10, 7),
  lng           DECIMAL(10, 7),
  category      TEXT NOT NULL DEFAULT 'general',
  qr_code_id    TEXT UNIQUE NOT NULL,  -- short code e.g. "BRGT-001"
  stamp_emoji   TEXT NOT NULL DEFAULT '📍',
  stamp_name    TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Locations are publicly readable (needed for QR scan check-ins by unauthenticated users)
CREATE POLICY "Locations are publicly readable"
  ON locations FOR SELECT
  USING (true);


-- Check-ins table
CREATE TABLE IF NOT EXISTS checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  plan_id       UUID REFERENCES plans(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, location_id, plan_id)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins"
  ON checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- Seed: Example curated Barbados locations
-- Replace / extend with real spots before launch.
-- ============================================================
INSERT INTO locations (name, address, lat, lng, category, qr_code_id, stamp_emoji, stamp_name) VALUES
  ('Bridgetown Rum Vault',      'Cavans Lane, Bridgetown, St. Michael', 13.0975, -59.6131, 'rum',     'BRGT-001', '🥃', 'Rum Vault Stamp'),
  ('Oistins Fish Fry',          'Oistins Bay Gardens, Christ Church',   13.0666, -59.5489, 'food',    'OIST-001', '🐟', 'Oistins Fish Fry Stamp'),
  ('Garrison Savannah',         'Garrison, St. Michael',                13.0822, -59.6043, 'history', 'GARR-001', '🏇', 'Garrison Stamp'),
  ('Barbados Museum',           'Garrison, St. Michael, BB14038',       13.0818, -59.6058, 'culture', 'BMUS-001', '🏛️', 'Museum Stamp'),
  ('Accra Beach',               'Rockley, Christ Church',               13.0620, -59.5968, 'beach',   'ACCR-001', '🏖️', 'Accra Beach Stamp'),
  ('Paynes Bay Beach',          'Paynes Bay, St. James',                13.1660, -59.6434, 'beach',   'PAYN-001', '🌊', 'Paynes Bay Stamp'),
  ('Holetown Monument',         'Second Street, Holetown, St. James',   13.1920, -59.6414, 'history', 'HOLE-001', '🗿', 'Holetown Stamp'),
  ('Speightstown Fishing Pier', 'Queen Street, Speightstown, St. Peter', 13.2500, -59.6481, 'food',   'SPEI-001', '🎣', 'Speightstown Stamp'),
  ('Flower Forest',             'Richmond Plantation, St. Joseph',      13.1947, -59.5531, 'nature',  'FLOW-001', '🌺', 'Flower Forest Stamp'),
  ('Bathsheba Beach',           'Bathsheba, St. Joseph',                13.2085, -59.5267, 'nature',  'BATH-001', '🪨', 'Bathsheba Stamp')
ON CONFLICT (qr_code_id) DO NOTHING;
