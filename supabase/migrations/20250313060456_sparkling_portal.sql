/*
  # Remove user_id foreign key constraint

  1. Changes
    - Remove foreign key constraint from incidents table
    - Make user_id nullable to support anonymous users
    - Update RLS policies to handle anonymous users

  2. Security
    - Maintain RLS policies for data access control
    - Allow anonymous incident creation
*/

-- Remove the foreign key constraint
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_user_id_fkey;

-- Make user_id nullable
ALTER TABLE incidents ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to handle anonymous users
DROP POLICY IF EXISTS "Anyone can create incidents" ON incidents;
DROP POLICY IF EXISTS "Users can update their own incidents" ON incidents;

CREATE POLICY "Anyone can create incidents"
  ON incidents
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update incidents they created"
  ON incidents
  FOR UPDATE
  TO public
  USING (
    (user_id IS NULL) OR 
    (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text)
  )
  WITH CHECK (
    (user_id IS NULL) OR 
    (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text)
  );