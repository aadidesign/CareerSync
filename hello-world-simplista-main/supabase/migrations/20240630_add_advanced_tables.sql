
-- Application notes table
CREATE TABLE IF NOT EXISTS application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Application status history table
CREATE TABLE IF NOT EXISTS application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  headers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Add needed columns to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS push_alerts BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_alerts BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS match_threshold INTEGER DEFAULT 60;

-- Create row level security policies
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- RLS for application_notes
CREATE POLICY "Users can view their own application notes"
  ON application_notes
  FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own application notes"
  ON application_notes
  FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own application notes"
  ON application_notes
  FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own application notes"
  ON application_notes
  FOR DELETE
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- RLS for application_status_history
CREATE POLICY "Users can view their own application status history"
  ON application_status_history
  FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own application status history"
  ON application_status_history
  FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- RLS for webhooks
CREATE POLICY "Users can view their own webhooks"
  ON webhooks
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own webhooks"
  ON webhooks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own webhooks"
  ON webhooks
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own webhooks"
  ON webhooks
  FOR DELETE
  USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS application_notes_application_id_idx ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS application_status_history_application_id_idx ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS applications_user_id_status_idx ON applications(user_id, status);
CREATE INDEX IF NOT EXISTS applications_applied_at_idx ON applications(applied_at);
