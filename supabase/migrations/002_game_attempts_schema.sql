-- ═══════════════════════════════════════════════════════
-- Cập nhật Database: Bảng điểm tích luỹ & Thống kê
-- ═══════════════════════════════════════════════════════

-- Thêm class_id vào rooms để định danh Lớp học (lấy từ LMS)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS class_id UUID;

-- Tạo Bảng lưu điểm số của Game (Riêng biệt với bài thi LMS)
CREATE TABLE IF NOT EXISTS game_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id        UUID, -- (Lưu mã lớp học để giáo viên dễ lọc biểu đồ)
  room_id         UUID REFERENCES rooms(id) ON DELETE SET NULL,
  game_id         UUID REFERENCES games(id) ON DELETE SET NULL,
  game_type       TEXT NOT NULL,
  topic           TEXT,
  score           INT DEFAULT 0, -- Điểm tích lũy (ví dụ: đúng 5 câu x Heso = 5đ)
  accuracy_rate   FLOAT DEFAULT 0, -- Độ chính xác. (Ví dụ: 80.5 %)
  time_spent_sec  INT DEFAULT 0,
  details         JSONB DEFAULT '[]', -- Chi tiết học sinh sai câu nào
  played_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Bật bảo mật RLS
ALTER TABLE game_attempts ENABLE ROW LEVEL SECURITY;

-- Chính sách: Giáo viên được xem toàn bộ điểm do học sinh mình quản lý nộp. Học sinh chỉ thấy điểm của bản thân
CREATE POLICY "games_attempts_teacher_view" ON game_attempts
  FOR SELECT USING (teacher_id = auth.uid());
  
CREATE POLICY "games_attempts_student_view" ON game_attempts
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "games_attempts_insert" ON game_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid() OR teacher_id = auth.uid());
