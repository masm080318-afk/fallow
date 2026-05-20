-- Fallow Soil Monitoring Schema
-- Run this in your Supabase SQL editor

-- farms table
CREATE TABLE IF NOT EXISTS farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  alert_threshold INTEGER DEFAULT 30,
  alert_frequency_hours INTEGER DEFAULT 6,
  alerts_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- sensor_nodes table
CREATE TABLE IF NOT EXISTS sensor_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms ON DELETE CASCADE NOT NULL,
  node_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- readings table
CREATE TABLE IF NOT EXISTS readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id TEXT NOT NULL,
  farm_id UUID REFERENCES farms ON DELETE CASCADE,
  moisture_percent INTEGER NOT NULL,
  temperature_f FLOAT NOT NULL,
  raw_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS readings_farm_created_idx ON readings (farm_id, created_at DESC);
CREATE INDEX IF NOT EXISTS readings_node_created_idx ON readings (node_id, created_at DESC);

-- alerts_log table
CREATE TABLE IF NOT EXISTS alerts_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  moisture_at_alert INTEGER,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alerts_farm_sent_idx ON alerts_log (farm_id, sent_at DESC);

-- diagnoses table (to store AI results)
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES farms ON DELETE CASCADE,
  node_id TEXT,
  status TEXT NOT NULL,
  explanation TEXT NOT NULL,
  confidence TEXT NOT NULL,
  days_until_irrigation INTEGER,
  best_watering_window TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS diagnoses_farm_created_idx ON diagnoses (farm_id, created_at DESC);

-- Enable RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users own farms" ON farms;
CREATE POLICY "Users own farms" ON farms FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own sensor_nodes" ON sensor_nodes;
CREATE POLICY "Users own sensor_nodes" ON sensor_nodes FOR ALL USING (
  farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users own readings" ON readings;
CREATE POLICY "Users own readings" ON readings FOR ALL USING (
  farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users own alerts_log" ON alerts_log;
CREATE POLICY "Users own alerts_log" ON alerts_log FOR ALL USING (
  farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users own diagnoses" ON diagnoses;
CREATE POLICY "Users own diagnoses" ON diagnoses FOR ALL USING (
  farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
);

-- Auto-delete readings older than 90 days
CREATE OR REPLACE FUNCTION delete_old_readings() RETURNS void AS $$
BEGIN
  DELETE FROM readings WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule (requires pg_cron extension). Enable in Supabase Dashboard > Extensions
-- SELECT cron.schedule('delete-old-readings', '0 3 * * *', 'SELECT delete_old_readings();');
