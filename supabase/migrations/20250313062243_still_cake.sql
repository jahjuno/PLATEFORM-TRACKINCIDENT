/*
  # Add Database Trigger for Critical Incident Notifications

  1. Changes
    - Add function to handle incident notifications
    - Create trigger for new P0 incidents
    - Set up webhook for email notifications

  2. Security
    - Function runs with security definer
    - Webhook calls are authenticated
*/

-- Create the notification function
CREATE OR REPLACE FUNCTION handle_critical_incident()
RETURNS trigger AS $$
BEGIN
  IF NEW.priority = 'P0' THEN
    -- Call the Edge Function via webhook
    PERFORM
      net.http_post(
        url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/notify-critical-incident'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
        ),
        body := jsonb_build_object('record', row_to_json(NEW))
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS critical_incident_notification ON incidents;
CREATE TRIGGER critical_incident_notification
  AFTER INSERT ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION handle_critical_incident();