/*
  # Enable net extension and update notification trigger

  1. Changes
    - Enable the net extension for HTTP requests
    - Update the trigger function to use proper HTTP request handling
    - Add error handling for the notification process

  2. Security
    - Maintain existing security policies
    - Ensure proper error handling
*/

-- Enable the net extension
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Update the notification function to use http extension
CREATE OR REPLACE FUNCTION handle_critical_incident()
RETURNS trigger AS $$
BEGIN
  IF NEW.priority = 'P0' THEN
    -- Call the Edge Function via webhook using http extension
    PERFORM
      extensions.http_post(
        url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/notify-critical-incident'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
        ),
        body := jsonb_build_object('record', row_to_json(NEW))::text
      );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent the incident from being created
    RAISE WARNING 'Failed to send notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;