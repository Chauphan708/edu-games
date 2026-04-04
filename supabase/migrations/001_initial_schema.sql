-- ═══════════════════════════════════════════════════════
-- Educational Games Platform - Initial Schema
-- Run this in Supabase SQL Editor (same project as LMS)
-- ═══════════════════════════════════════════════════════

-- Cài đặt GV (extend từ auth.users của LMS — đã tồn tại)
CREATE TABLE IF NOT EXISTS teacher_settings (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gemini_api_key  TEXT,
  display_name    TEXT,
  school          TEXT,
  preferences     JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Định nghĩa game (template câu hỏi, tái sử dụng nhiều lần)
CREATE TABLE IF NOT EXISTS games (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  game_type   TEXT NOT NULL,
  group_name  TEXT NOT NULL,
  questions   JSONB NOT NULL DEFAULT '[]',
  settings    JSONB DEFAULT '{}',
  is_public   BOOLEAN DEFAULT FALSE,
  play_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Phòng chơi (1 phiên live)
CREATE TABLE IF NOT EXISTS rooms (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code        VARCHAR(6) UNIQUE NOT NULL,
  game_id          UUID REFERENCES games(id) ON DELETE SET NULL,
  teacher_id       UUID NOT NULL REFERENCES auth.users(id),
  status           TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'playing', 'paused', 'ended')),
  current_question INT DEFAULT 0,
  game_state       JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  started_at       TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ
);

-- Index để tìm room nhanh theo code (chỉ phòng đang mở)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_active_code 
  ON rooms(room_code) WHERE status != 'ended';

-- Người chơi trong phòng
CREATE TABLE IF NOT EXISTS participants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id),
  player_name  TEXT NOT NULL,
  avatar_seed  TEXT DEFAULT gen_random_uuid()::TEXT,
  team_id      TEXT,
  score        INT DEFAULT 0,
  streak       INT DEFAULT 0,
  best_streak  INT DEFAULT 0,
  is_ready     BOOLEAN DEFAULT FALSE,
  joined_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Lịch sử trả lời
CREATE TABLE IF NOT EXISTS submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id   UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_index   INT NOT NULL,
  answer           JSONB NOT NULL,
  is_correct       BOOLEAN,
  points_earned    INT DEFAULT 0,
  response_time_ms INT,
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, participant_id, question_index)
);

-- Kết quả tổng kết
CREATE TABLE IF NOT EXISTS session_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID REFERENCES rooms(id),
  game_id         UUID REFERENCES games(id),
  teacher_id      UUID REFERENCES auth.users(id),
  final_scores    JSONB NOT NULL DEFAULT '[]',
  question_stats  JSONB DEFAULT '[]',
  player_count    INT,
  duration_sec    INT,
  completed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE teacher_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_results ENABLE ROW LEVEL SECURITY;

-- teacher_settings: chỉ chính chủ
CREATE POLICY "teacher_settings_own" ON teacher_settings
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- games: GV quản lý game riêng; mọi người xem public
CREATE POLICY "games_select" ON games
  FOR SELECT USING (teacher_id = auth.uid() OR is_public = TRUE);
CREATE POLICY "games_insert" ON games
  FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "games_update" ON games
  FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "games_delete" ON games
  FOR DELETE USING (teacher_id = auth.uid());

-- rooms: GV quản lý phòng; HS xem phòng đang mở
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (teacher_id = auth.uid() OR status IN ('waiting', 'playing'));
CREATE POLICY "rooms_insert" ON rooms
  FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "rooms_update" ON rooms
  FOR UPDATE USING (teacher_id = auth.uid());

-- participants: join nếu phòng mở; xem trong phòng
CREATE POLICY "participants_select" ON participants
  FOR SELECT USING (TRUE);
CREATE POLICY "participants_insert" ON participants
  FOR INSERT WITH CHECK (
    room_id IN (SELECT id FROM rooms WHERE status IN ('waiting', 'playing'))
  );
CREATE POLICY "participants_update" ON participants
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- submissions: tự submit; GV xem phòng mình
CREATE POLICY "submissions_select" ON submissions
  FOR SELECT USING (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
    OR room_id IN (SELECT id FROM rooms WHERE teacher_id = auth.uid())
  );
CREATE POLICY "submissions_insert" ON submissions
  FOR INSERT WITH CHECK (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
  );

-- session_results: GV xem kết quả
CREATE POLICY "results_select" ON session_results
  FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "results_insert" ON session_results
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

-- ═══════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════

-- Sinh room_code 6 ký tự (bỏ O,0,I,1 dễ nhầm)
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code VARCHAR(6) := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_games_updated BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_teacher_settings_updated BEFORE UPDATE ON teacher_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
