/*
  # Create incidents management tables

  1. New Tables
    - `incidents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `platform` (text)
      - `status` (enum)
      - `priority` (enum)
      - `responsible_team` (text)
      - `created_at` (timestamp)
      - `resolved_at` (timestamp, nullable)
      - `rca_document` (text, nullable)
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `incidents` table
    - Add policies for:
      - Users can read all incidents
      - Users can create incidents
      - Users can update incidents they created
*/

-- Create enum types for status and priority
CREATE TYPE incident_status AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE incident_priority AS ENUM ('P0', 'P1', 'P2', 'P3', 'P4');

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  platform text NOT NULL,
  status incident_status NOT NULL DEFAULT 'NEW',
  priority incident_priority NOT NULL,
  responsible_team text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  rca_document text,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Add constraint to ensure resolved_at is only set when status is RESOLVED or CLOSED
  CONSTRAINT resolved_at_status_check CHECK (
    (status IN ('RESOLVED', 'CLOSED') AND resolved_at IS NOT NULL) OR
    (status NOT IN ('RESOLVED', 'CLOSED') AND resolved_at IS NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all incidents"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create incidents"
  ON incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX incidents_user_id_idx ON incidents(user_id);
CREATE INDEX incidents_status_idx ON incidents(status);
CREATE INDEX incidents_priority_idx ON incidents(priority);
CREATE INDEX incidents_created_at_idx ON incidents(created_at);