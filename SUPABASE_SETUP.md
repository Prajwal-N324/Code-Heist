# Supabase Setup Guide for Code Heist Admin Panel

## Step 1: Create Supabase Tables

1. Go to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Open the SQL Editor
4. Copy and paste this SQL schema:

```sql
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

-- Leaderboard table (if not exists)
CREATE TABLE IF NOT EXISTS ch_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team TEXT,
  team_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Click "Run" to execute the SQL

## Step 2: Enable Realtime

1. In Supabase, go to **Database** → **Replication**
2. Under "Realtime" section, enable replication for:
   - `team_config`
   - `team_level_data`

This allows the frontend to receive real-time updates when data changes.

## Step 3: Create RLS Policies (Optional but Recommended)

For security, add Row Level Security policies. In SQL Editor:

```sql
-- Enable RLS
ALTER TABLE team_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_level_data ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated users" ON team_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON team_level_data
  FOR ALL USING (auth.role() = 'authenticated');
```

## Step 4: Check Your Environment Variables

Verify `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## How It Works Now

### Real-Time Sync:
- When you register a new team → stored in `team_config` table
- When you update level questions → stored in `team_level_data` table
- All changes sync automatically across all admin panels viewing the same data
- Leaderboard updates are saved to `ch_leaderboard` table

### Data Flow:
1. Admin updates a level → saves to Supabase
2. Real-time subscription triggers
3. Form re-renders with fresh data from database
4. Other admin panels see the changes immediately

### Export/Import:
- **Export**: Downloads all team configs as JSON from database
- **Import**: Merges JSON back into database (doesn't overwrite)

## Testing Real-Time Sync

1. Open admin panel in two browser tabs
2. In Tab 1: Register a new team (e.g., TEAM-99)
3. In Tab 2: Refresh or watch the team bar - TEAM-99 appears automatically

## Troubleshooting

**No teams appearing?**
- Check that `team_config` table exists in Supabase
- Verify NEXT_PUBLIC_SUPABASE_URL and key are correct
- Check browser console for errors

**Changes not syncing real-time?**
- Verify realtime is enabled for both tables
- Check Supabase logs for errors
- Try refreshing the page

**Import fails?**
- Verify JSON format is valid
- Check that team_id values don't conflict with existing teams
- Review error message in toast notification

## Default Teams

The system comes with defaults:
- TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05, TEAM-06

You can add more using the "+ Add Team" button.
