-- Add image_url field to categories table
ALTER TABLE categories
ADD COLUMN image_url TEXT;

-- Create artisans table
CREATE TABLE artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for artisans table
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;

-- Admin can manage artisans
CREATE POLICY "Admins can manage artisans" ON artisans
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public can read artisans
CREATE POLICY "Public can read artisans" ON artisans
  FOR SELECT
  USING (true);

-- Create index on artisans created_at for sorting
CREATE INDEX idx_artisans_created_at ON artisans(created_at);
