-- ═══════════════════════════════════════════════════════
-- Cập nhật Database 003: Sửa lỗi SSO cho Học sinh không có Email
-- ═══════════════════════════════════════════════════════

-- 1. Xóa khóa ngoại (Foreign Keys) liên kết với bảng auth.users
ALTER TABLE game_attempts DROP CONSTRAINT IF EXISTS game_attempts_student_id_fkey;
ALTER TABLE game_attempts DROP CONSTRAINT IF EXISTS game_attempts_teacher_id_fkey;

-- 2. Đổi kiểu dữ liệu từ UUID sang TEXT để chứa ID dạng "s_12345" từ LMS
ALTER TABLE game_attempts ALTER COLUMN student_id TYPE TEXT USING student_id::TEXT;
ALTER TABLE game_attempts ALTER COLUMN teacher_id TYPE TEXT USING teacher_id::TEXT;

-- 3. Xóa các chính sách RLS cũ cản trở truy cập
DROP POLICY IF EXISTS "games_attempts_student_view" ON game_attempts;
DROP POLICY IF EXISTS "games_attempts_teacher_view" ON game_attempts;
DROP POLICY IF EXISTS "games_attempts_insert" ON game_attempts;

-- 4. Tạo một chính sách RLS mở rộng cho phép MỌI NGƯỜI thêm điểm (vì học sinh đăng nhập bằng Username không có session auth.users)
CREATE POLICY "games_attempts_allow_all" ON game_attempts
  FOR ALL USING (true) WITH CHECK (true);
