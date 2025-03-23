
-- Add RPC functions for application notes
CREATE OR REPLACE FUNCTION get_application_notes(app_id UUID)
RETURNS SETOF application_notes AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM application_notes
  WHERE application_id = app_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_application_note(app_id UUID, note_content TEXT)
RETURNS application_notes AS $$
DECLARE
  new_note application_notes;
BEGIN
  INSERT INTO application_notes (application_id, content, created_by, created_at)
  VALUES (app_id, note_content, auth.uid(), NOW())
  RETURNING * INTO new_note;
  
  RETURN new_note;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC functions for application status history
CREATE OR REPLACE FUNCTION get_application_status_history(app_id UUID)
RETURNS SETOF application_status_history AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM application_status_history
  WHERE application_id = app_id
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_application_status_history(app_id UUID, status_value TEXT)
RETURNS application_status_history AS $$
DECLARE
  new_status application_status_history;
BEGIN
  INSERT INTO application_status_history (application_id, status, date, updated_by)
  VALUES (app_id, status_value, NOW(), auth.uid())
  RETURNING * INTO new_status;
  
  RETURN new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC functions for webhooks
CREATE OR REPLACE FUNCTION get_webhooks()
RETURNS SETOF webhooks AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM webhooks
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_webhook(
  webhook_name TEXT, 
  webhook_url TEXT, 
  webhook_events TEXT[], 
  webhook_active BOOLEAN, 
  webhook_headers JSONB DEFAULT '{}'::JSONB
)
RETURNS webhooks AS $$
DECLARE
  new_webhook webhooks;
BEGIN
  INSERT INTO webhooks (user_id, name, url, events, active, headers, created_at)
  VALUES (auth.uid(), webhook_name, webhook_url, webhook_events, webhook_active, webhook_headers, NOW())
  RETURNING * INTO new_webhook;
  
  RETURN new_webhook;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_webhook(
  webhook_id UUID,
  webhook_name TEXT DEFAULT NULL, 
  webhook_url TEXT DEFAULT NULL, 
  webhook_events TEXT[] DEFAULT NULL, 
  webhook_active BOOLEAN DEFAULT NULL, 
  webhook_headers JSONB DEFAULT NULL
)
RETURNS webhooks AS $$
DECLARE
  updated_webhook webhooks;
BEGIN
  UPDATE webhooks
  SET 
    name = COALESCE(webhook_name, name),
    url = COALESCE(webhook_url, url),
    events = COALESCE(webhook_events, events),
    active = COALESCE(webhook_active, active),
    headers = COALESCE(webhook_headers, headers),
    updated_at = NOW()
  WHERE id = webhook_id AND user_id = auth.uid()
  RETURNING * INTO updated_webhook;
  
  RETURN updated_webhook;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_webhook(webhook_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM webhooks
  WHERE id = webhook_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC functions for matching preferences
CREATE OR REPLACE FUNCTION get_matching_preferences()
RETURNS TABLE(
  job_titles TEXT[],
  locations TEXT[],
  is_remote BOOLEAN,
  min_salary INTEGER,
  max_salary INTEGER,
  threshold INTEGER,
  skills TEXT[]
) AS $$
DECLARE
  prefs record;
  user_skills TEXT[];
BEGIN
  -- Get preferences
  SELECT 
    job_title_pref,
    location_pref,
    remote_pref,
    salary_min,
    salary_max,
    match_threshold
  INTO prefs
  FROM user_preferences
  WHERE user_id = auth.uid();
  
  -- Get skills
  SELECT array_agg(skill) INTO user_skills
  FROM user_skills
  WHERE user_id = auth.uid();
  
  -- Return result
  job_titles := prefs.job_title_pref;
  locations := prefs.location_pref;
  is_remote := prefs.remote_pref;
  min_salary := prefs.salary_min;
  max_salary := prefs.salary_max;
  threshold := prefs.match_threshold;
  skills := user_skills;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_matching_preferences(
  job_titles TEXT[] DEFAULT NULL,
  user_locations TEXT[] DEFAULT NULL,
  is_remote BOOLEAN DEFAULT NULL,
  min_salary INTEGER DEFAULT NULL,
  max_salary INTEGER DEFAULT NULL,
  threshold INTEGER DEFAULT NULL,
  user_skills TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update preferences
  UPDATE user_preferences
  SET 
    job_title_pref = COALESCE(job_titles, job_title_pref),
    location_pref = COALESCE(user_locations, location_pref),
    remote_pref = COALESCE(is_remote, remote_pref),
    salary_min = COALESCE(min_salary, salary_min),
    salary_max = COALESCE(max_salary, salary_max),
    match_threshold = COALESCE(threshold, match_threshold),
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  -- If skills are provided, update them
  IF user_skills IS NOT NULL THEN
    -- Delete existing skills
    DELETE FROM user_skills
    WHERE user_id = auth.uid();
    
    -- Insert new skills
    IF array_length(user_skills, 1) > 0 THEN
      INSERT INTO user_skills (user_id, skill, proficiency, created_at)
      SELECT 
        auth.uid(),
        skill,
        'intermediate',
        NOW()
      FROM unnest(user_skills) AS skill;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC functions for notification settings
CREATE OR REPLACE FUNCTION get_notification_settings()
RETURNS TABLE(
  email_alerts BOOLEAN,
  push_alerts BOOLEAN,
  sms_alerts BOOLEAN,
  telegram_alerts BOOLEAN,
  whatsapp_alerts BOOLEAN
) AS $$
DECLARE
  settings record;
BEGIN
  SELECT 
    email_alerts,
    push_alerts,
    sms_alerts,
    telegram_alerts,
    whatsapp_alerts
  INTO settings
  FROM user_preferences
  WHERE user_id = auth.uid();
  
  email_alerts := settings.email_alerts;
  push_alerts := settings.push_alerts;
  sms_alerts := settings.sms_alerts;
  telegram_alerts := settings.telegram_alerts;
  whatsapp_alerts := settings.whatsapp_alerts;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_notification_settings(
  email_alerts BOOLEAN DEFAULT NULL,
  push_alerts BOOLEAN DEFAULT NULL,
  sms_alerts BOOLEAN DEFAULT NULL,
  telegram_alerts BOOLEAN DEFAULT NULL,
  whatsapp_alerts BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_preferences
  SET 
    email_alerts = COALESCE(update_notification_settings.email_alerts, user_preferences.email_alerts),
    push_alerts = COALESCE(update_notification_settings.push_alerts, user_preferences.push_alerts),
    sms_alerts = COALESCE(update_notification_settings.sms_alerts, user_preferences.sms_alerts),
    telegram_alerts = COALESCE(update_notification_settings.telegram_alerts, user_preferences.telegram_alerts),
    whatsapp_alerts = COALESCE(update_notification_settings.whatsapp_alerts, user_preferences.whatsapp_alerts),
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
