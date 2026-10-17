# Biên bản xác minh — 11/10/2026

Nhánh làm việc: HuyNHHE190724. Kết quả được ghi từ lệnh chạy và trình duyệt trên máy local; không phải kết quả triển khai production.

| Kiểm tra | Kết quả | Minh chứng/giới hạn |
| --- | --- | --- |
| Gộp origin/anhnthe194418 | Đã có trong lịch sử | git merge trả Already up to date |
| Gộp origin/hieunhhe187023 | Đã có trong lịch sử | git merge trả Already up to date |
| MongoDB local fitmanager | Kết nối thành công | 127.0.0.1:27017, ping thành công |
| Express health | HTTP 200 | success=true, data.status=ok, data.database=connected |
| Browser → React → Express → MongoDB | Thành công | Edge headless nhận response 200 và UI hiển thị đã kết nối |
| Backend npm test | 15/15 đạt | HTTP/middleware/config và validation model |
| Integration database riêng | Đạt | Hash, unique, hủy/đặt lại, review aggregate, optimistic concurrency, health |
| Migration index fitmanager | Đạt | Tạo index mới và thay duy nhất legacy booking index; không xóa document |
| Frontend npm run build | Đạt | Build sau đồng bộ dependency |
| Lint file frontend đã sửa | Đạt | App.jsx, ConnectionStatus.jsx, services/api.js |
| Lint toàn frontend | Chưa đạt | Lỗi có sẵn: import/biến chưa dùng và setState trong effect của modal |
| 11 file draw.io | XML/ref hợp lệ | Context DFD, UML use case, 4 workflow swimlane, ERD/database liên kết; PNG/SVG xem nhanh |
| Kế hoạch 4 tuần | Đã kiểm tra phân bổ | Huy–Admin, Hiếu–Member, Anh–PT/Auth; 26 SP/người, 78 SP/nhóm |
| API nghiệp vụ/UAT đầy đủ | Chưa thực hiện | API auth/CRUD/RBAC chưa được triển khai |

## Response thực nhận

```json
{
  "success": true,
  "message": "Success",
  "data": { "status": "ok", "database": "connected" }
}
```

## Minh chứng giao diện

![React kiểm tra API và MongoDB thành công](connection-verification.png)

Backend và Vite dùng trong kiểm thử trình duyệt là tiến trình tạm và được dừng sau kiểm tra. Chạy `npm run dev` ở hai thư mục để sử dụng ứng dụng tiếp.

8 collection nghiệp vụ: users, trainerprofiles, membershippackages, subscriptions, bookings, workoutplans, progresslogs, reviews. Collection user cũ rỗng được giữ nguyên. Không seed dữ liệu nghiệp vụ vào fitmanager. Dữ liệu kiểm thử được ghi vào database tên ngẫu nhiên fitmanager_verification_... và dọn đúng database đó.

Index và validation là cải thiện nền dữ liệu, chưa chứng minh hiệu năng tải thực và chưa giải quyết mọi khoảng giờ chồng nhau. React nghiệp vụ vẫn dùng dữ liệu mẫu; ảnh kết nối không phải bằng chứng CRUD đã hoạt động.
