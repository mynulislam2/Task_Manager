-- Add sms_body column for storing raw SMS text
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS sms_body TEXT;
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS sms_body TEXT;
