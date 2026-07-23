-- Add sms_hash and sms_body columns for SMS import dedup
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS sms_hash TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS sms_body TEXT;
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS sms_hash TEXT;
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS sms_body TEXT;

-- Index for fast dedup lookups
CREATE INDEX IF NOT EXISTS idx_expenses_sms_hash ON expenses(sms_hash);
CREATE INDEX IF NOT EXISTS idx_incomes_sms_hash ON incomes(sms_hash);
