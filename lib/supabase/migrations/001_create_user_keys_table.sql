CREATE TABLE IF NOT EXISTS user_keys (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_user_keys_user_id ON user_keys(user_id);

ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own keys" ON user_keys
  FOR ALL USING (auth.uid() = user_id);
