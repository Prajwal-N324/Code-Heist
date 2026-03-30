-- Code Heist Admin Configuration Schema

-- Teams table - stores team metadata
CREATE TABLE IF NOT EXISTS team_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT UNIQUE NOT NULL,
  team_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Level Data - stores level-specific configuration per team
CREATE TABLE IF NOT EXISTS team_level_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES team_config(team_id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  answer TEXT,
  letter TEXT,
  next_location TEXT,
  hint TEXT,
  question TEXT,
  task TEXT,
  synonym_sheet JSONB,
  correct_synonyms JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, level)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_team_level_data_team_id ON team_level_data(team_id);
CREATE INDEX IF NOT EXISTS idx_team_level_data_level ON team_level_data(level);

-- Enable realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE team_config;
ALTER PUBLICATION supabase_realtime ADD TABLE team_level_data;

-- Leaderboard table (existing)
CREATE TABLE IF NOT EXISTS ch_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team TEXT,
  team_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
