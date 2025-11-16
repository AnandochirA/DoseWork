-- SPARK Session Database Schema for Supabase

-- Users table (integrates with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('spark', 'wave', 'popcorn', 'rsd')),
  current_step TEXT NOT NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  llm_context TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session events for analytics
CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  step TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_session_type ON sessions(session_type);
CREATE INDEX idx_session_events_session_id ON session_events(session_id);
CREATE INDEX idx_session_events_timestamp ON session_events(timestamp);

-- Analytics aggregation table (updated periodically)
CREATE TABLE IF NOT EXISTS user_analytics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  emotion_frequency JSONB DEFAULT '{}',
  action_frequency JSONB DEFAULT '{}',
  insight_keywords TEXT[] DEFAULT '{}',
  last_session_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY users_own_data ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY sessions_own_data ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY events_own_sessions ON session_events
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY analytics_own_data ON user_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON user_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
