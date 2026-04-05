# Kế hoạch Đồng bộ Cấu trúc Câu hỏi: LMS ↔ Edu Game

Chào bạn, đây là kế hoạch để khiến việc nhập liệu câu hỏi trở nên "không khoảng cách" giữa hai hệ thống.

## 🚀 Mục tiêu
Đưa cấu trúc câu hỏi của dự án **Educational Games** về cùng một "ngôn ngữ" với **OpenLMS**, giúp việc lấy câu hỏi từ Ngân hàng LMS sang Game đạt độ tiện dụng cao nhất.

---

## 🛠️ Các thay đổi kỹ thuật chi tiết

### 1. Đồng bộ hóa Kiểu dữ liệu (Types)
Tôi sẽ sửa tệp `src/types/supabase.ts` để đổi tên các thuộc tính:
- Đổi từ `text` (nội dung câu hỏi) thành **`content`** (giống LMS).
- Đổi từ `options` (danh sách đáp án) thành **`answers`** (giống Đấu trường LMS).
- Đổi từ `correctAnswer` (vị trí đúng) thành **`correct_index`** (giống LMS).
- Thêm các trường: `id`, `imageUrl`, `difficulty`, `subject`, `topic`.

### 2. Cập nhật mã nguồn 23 Trò chơi
- Tôi sẽ quét toàn bộ thư mục `src/games/` để cập nhật code giao diện của 23 trò chơi (Ví dụ: `q.text` đổi thành `q.content`).
- Đảm bảo các logic như tính điểm, kiểm tra đáp án đúng vẫn hoạt động hoàn hảo với tên biến mới.

### 3. Tính năng "Nhập từ LMS"
- Tôi sẽ thêm một nút **"Lấy từ Ngân hàng LMS"** vào trang tạo Game.
- Khi bấm nút, một cửa sổ hiện ra cho phép bạn chọn các câu hỏi đã có sẵn từ bảng `question_bank` của dự án LMS.

---

## 🧪 Kế hoạch Kiểm tra (Verification)
1. **Kiểm tra Code**: Đảm bảo không còn lỗi đỏ trong dự án sau khi đổi tên biến.
2. **Kiểm tra Thực tế**: 
    - Thử tạo Game bằng cách nhập tay (Cấu trúc mới).
    - Thử tạo Game bằng cách "hút" dữ liệu từ LMS sang.

---
**Bạn hãy mở tệp này trong máy tính (educational-games/implementation_plan_sync.md) để xem kỹ nhé! Nếu bạn thấy phương án này đã ổn, hãy nhắn "Đồng ý" để tôi bắt đầu thực hiện ngay!**
