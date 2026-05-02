-- Add explicit live session timing fields
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

UPDATE public.meetings
SET
  start_time = COALESCE(start_time, scheduled_at),
  duration_minutes = COALESCE(duration_minutes, 60),
  end_time = COALESCE(end_time, scheduled_at + INTERVAL '60 minutes')
WHERE start_time IS NULL OR duration_minutes IS NULL OR end_time IS NULL;

ALTER TABLE public.meetings
  ALTER COLUMN start_time SET NOT NULL,
  ALTER COLUMN duration_minutes SET NOT NULL,
  ALTER COLUMN end_time SET NOT NULL;
