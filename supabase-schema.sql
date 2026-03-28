-- Supabase schema adjustments for Code-Heist

-- teams table: link each team to a seeded question set
ALTER TABLE IF EXISTS teams
ADD COLUMN IF NOT EXISTS question_set_id INT;
ALTER TABLE IF EXISTS teams
ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE IF EXISTS teams
ADD COLUMN IF NOT EXISTS access_code TEXT;

-- rounds table: allow multiple question sets, e.g. Set A and Set B
ALTER TABLE IF EXISTS rounds
ADD COLUMN IF NOT EXISTS set_id INT;
ALTER TABLE IF EXISTS rounds
ADD COLUMN IF NOT EXISTS mission_text TEXT;
ALTER TABLE IF EXISTS rounds
ADD COLUMN IF NOT EXISTS code_snippet TEXT;
ALTER TABLE IF EXISTS rounds
ADD COLUMN IF NOT EXISTS correct_answer TEXT;

-- settings table: ensure event_live exists and can be toggled
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value BOOLEAN NOT NULL
);

-- seed default event_live flag if missing
INSERT INTO settings (key, value)
VALUES ('event_live', false)
ON CONFLICT (key) DO NOTHING;

-- seed default AI strictness flag if missing
INSERT INTO settings (key, value)
VALUES ('ai_strictness', false)
ON CONFLICT (key) DO NOTHING;
