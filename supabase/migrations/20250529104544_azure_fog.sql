/*
  # Add user_id column to qr_mappings table

  1. Changes
    - Add `user_id` column to `qr_mappings` table
    - Set up foreign key relationship with auth.users table
    - Update RLS policies to use user_id

  2. Security
    - Maintain existing RLS policies
    - Update policies to use auth.uid() for user identification
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'qr_mappings' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE qr_mappings ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update RLS policies to use the new user_id column
DROP POLICY IF EXISTS "QR mappings are publicly readable" ON qr_mappings;
DROP POLICY IF EXISTS "Users can delete their own QR mappings" ON qr_mappings;
DROP POLICY IF EXISTS "Users can insert their own QR mappings" ON qr_mappings;
DROP POLICY IF EXISTS "Users can update their own QR mappings" ON qr_mappings;

-- Recreate policies with proper user_id checks
CREATE POLICY "QR mappings are publicly readable"
  ON qr_mappings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can delete their own QR mappings"
  ON qr_mappings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own QR mappings"
  ON qr_mappings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR mappings"
  ON qr_mappings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);