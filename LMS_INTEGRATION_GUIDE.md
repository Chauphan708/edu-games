# Hướng dẫn Tích hợp Hệ thống Game vào LMS (Bridge Guide)

Tài liệu này hướng dẫn cách kết nối hệ thống LMS của bạn với ứng dụng Educational Games thông qua cơ chế **Auth Bridge (URL Parameters)**.

## 1. Cơ chế hoạt động
Hệ thống Game sử dụng Supabase Auth. Khi giáo viên từ LMS bấm vào nút mở Game, LMS cần tạo một đường dẫn (Link) có chứa `access_token` và `refresh_token` của giáo viên đó.

Ứng dụng Game sẽ tự động bắt lấy các Token này từ thanh địa chỉ, đăng nhập cho giáo viên và tự động xóa Token khỏi địa chỉ để đảm bảo bảo mật.

---

## 2. Công thức tạo Link (Phía LMS)

Bạn hãy cấu hình phần "Thêm link bất kỳ" của LMS theo định dạng sau:

```text
https://[DOMAIN_GAME]/teacher?access_token=[TOKEN_1]&refresh_token=[TOKEN_2]
```

### Ví dụ mã nguồn giả định cho nút bấm trên LMS (Javascript):
Nếu LMS của bạn cho phép chèn mã Javascript, hãy dùng mẫu này:

```javascript
// Giả định bạn đang ở trong môi trường LMS và đã có token của người dùng
const accessToken = userSession.access_token; 
const refreshToken = userSession.refresh_token;

const gameUrl = `https://edu-games-gamma.vercel.app/teacher?access_token=${accessToken}&refresh_token=${refreshToken}`;

// Mở Game trong tab mới hoặc Iframe
window.open(gameUrl, '_blank');
```

---

## 3. Cấu hình Vercel (Folder Integration)
Nếu bạn muốn Games xuất hiện như một thư mục `/games` bên trong LMS (VD: `domain.com/games`), hãy thêm đoạn code sau vào tệp `vercel.json` của dự án **LMS**:

```json
{
  "rewrites": [
    {
      "source": "/games/:path*",
      "destination": "https://edu-games-gamma.vercel.app/:path*"
    }
  ]
}
```

---

## 4. Kiểm tra (Testing)
Để kiểm tra tích hợp có hoạt động hay không, bạn có thể thử truy cập bằng một Token thật lấy từ console của Supabase:

1. Đăng nhập vào Game thủ công 1 lần.
2. Mở Console (F12) -> Application -> Local Storage.
3. Tìm `sb-[project-id]-auth-token`.
4. Copy `access_token` và `refresh_token`.
5. Thử dán vào Link: `https://.../teacher?access_token=...&refresh_token=...`.

Nếu trang Web hiện ngay danh sách trò chơi mà không hỏi đăng nhập -> Bạn đã tích hợp thành công!
