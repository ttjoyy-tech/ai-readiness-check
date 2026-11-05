-- Optional: the Worker creates these tables itself on first use. Use this file only if you prefer to set up the database by hand:
--   npx wrangler d1 execute DB --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  room TEXT NOT NULL,
  ts INTEGER NOT NULL,
  overall INTEGER NOT NULL,
  tier TEXT NOT NULL,
  use_s INTEGER NOT NULL,
  skill_s INTEGER NOT NULL,
  data_s INTEGER NOT NULL,
  resp_s INTEGER NOT NULL,
  mind_s INTEGER NOT NULL,
  sector TEXT,
  level TEXT,
  access TEXT
);
CREATE INDEX IF NOT EXISTS idx_results_room ON results (room, ts);
CREATE TABLE IF NOT EXISTS ai_usage (
  k TEXT PRIMARY KEY,
  d TEXT NOT NULL,
  n INTEGER NOT NULL
);
