/*
  # Fix QR Mappings RLS Policies

  1. Changes
    - Drop existing policies that are not working correctly
    - Add new policies for authenticated users to manage their QR mappings
    - Add user_id column to link mappings to authenticated users
    
  2. Security
    - Enable RLS on qr_mappings table (already enabled)
    - Add policies for:
      - SELECT: Allow public read access
      - INSERT: Allow authenticated users to create mappings
      - UPDATE: Allow authenticated users to update their mappings
      - DELETE: Allow authenticated users to delete their mappings
*/

-- Add user_id column to link mappings to authenticated users
ALTER TABLE qr_mappings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop existing policies
DROP POLICY IF EXISTS "QR mappings are publicly readable" ON qr_mappings;
DROP POLICY IF EXISTS "Users can manage their QR mappings" ON qr_mappings;

-- Create new policies
CREATE POLICY "QR mappings are publicly readable"
ON qr_mappings
FOR SELECT
TO public
USING (true);

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

CREATE POLICY "Users can delete their own QR mappings"
ON qr_mappings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);