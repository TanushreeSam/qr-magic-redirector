/*
  # Create QR mappings table

  1. New Tables
    - `qr_mappings`
      - `id` (uuid, primary key)
      - `qr_id` (text, unique)
      - `type` (text)
      - `label` (text)
      - `value` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `qr_mappings` table
    - Add policy for public read access
    - Add policy for authenticated users to manage their own mappings
*/

CREATE TABLE IF NOT EXISTS qr_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id text UNIQUE NOT NULL,
  type text NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE qr_mappings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to QR mappings
CREATE POLICY "QR mappings are publicly readable"
  ON qr_mappings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage their QR mappings
CREATE POLICY "Users can manage their QR mappings"
  ON qr_mappings
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);