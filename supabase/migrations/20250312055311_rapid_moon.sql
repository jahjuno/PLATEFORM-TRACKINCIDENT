/*
  # Update RLS policies for anonymous access

  1. Changes
    - Modify existing RLS policies to allow anonymous access
    - Add new policy for anonymous users to create incidents
    - Add new policy for anonymous users to read incidents

  2. Security
    - Allow anonymous access while maintaining basic security
    - Ensure users can only modify their own incidents
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all incidents" ON incidents;
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;
DROP POLICY IF EXISTS "Users can update their incidents" ON incidents;

-- Create new policies that allow anonymous access
CREATE POLICY "Anyone can read incidents"
  ON incidents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create incidents"
  ON incidents
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own incidents"
  ON incidents
  FOR UPDATE
  TO public
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);