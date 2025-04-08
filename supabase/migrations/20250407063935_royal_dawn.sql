/*
  # Update incidents table with new fields

  1. Changes
    - Add new columns for enhanced incident tracking
    - Update existing columns for better incident management
    - Add location and duration columns
    - Remove authentication requirements

  2. Security
    - Maintain public access policies
*/

-- Add new columns to incidents table
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS impacted_business text,
ADD COLUMN IF NOT EXISTS root_cause text,
ADD COLUMN IF NOT EXISTS solution_provided text,
ADD COLUMN IF NOT EXISTS incident_start_time timestamptz,
ADD COLUMN IF NOT EXISTS incident_end_time timestamptz,
ADD COLUMN IF NOT EXISTS incident_duration interval 
  GENERATED ALWAYS AS 
    (CASE 
      WHEN incident_end_time IS NOT NULL AND incident_start_time IS NOT NULL 
      THEN incident_end_time - incident_start_time 
      ELSE NULL 
    END) STORED,
ADD COLUMN IF NOT EXISTS intervening_person text,
ADD COLUMN IF NOT EXISTS intervening_team text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS duration text;