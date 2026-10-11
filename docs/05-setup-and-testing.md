# Hướng dẫn chạy và kiểm thử

## 1. Chuẩn bị

Node.js theo backend/package.json (>= 22.12.0), npm và MongoDB local đang chạy trên 127.0.0.1:27017. Không chỉ cài MongoDB Compass: Compass là công cụ quản lý, không thay thế MongoDB server.

## 2. Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Chỉ copy .env.example khi chưa có .env hoặc chủ động muốn thay cấu hình. Cấu hình local:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fitmanager
CORS_ORIGIN=http://localhost:3000
```

Code chấp nhận MONGO_URI để tương thích cấu hình cũ nhưng ưu tiên MONGODB_URI. Nếu hai biến cùng có, MONGODB_URI được chọn. File .env được đọc từ thư mục backend, không phụ thuộc thư mục gọi lệnh. Server chỉ mở cổng khi database kết nối thành công; thời gian chọn server tối đa 5 giây. Không hiển thị connection URI trong thông báo lỗi khởi động.

## 3. Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

`.env`: `VITE_API_URL=http://localhost:5000/api`. Khởi động lại Vite sau đổi biến môi trường. Truy cập http://localhost:3000. Thanh trạng thái kiểm tra backend/database khi mở ứng dụng; dữ liệu nghiệp vụ vẫn minh họa.

## 4. Xác minh kết nối thực

```powershell
Test-NetConnection 127.0.0.1 -Port 27017
Invoke-RestMethod http://localhost:5000/api/health
```

Thành công cần response success=true và data gồm status=ok, database=connected. Trong DevTools → Network phải thấy request từ React đến /api/health nhận 200. Nếu MongoDB dừng, API phải báo 503 hoặc frontend báo chưa kết nối, không báo lưu nghiệp vụ thành công.

MongoDB tạo database/collection khi có ghi dữ liệu hoặc tạo collection/index; health ping thành công không có nghĩa đã có dữ liệu mẫu. Chưa có seed và chưa có API ghi nghiệp vụ.

## 5. Kiểm thử tự động

```powershell
cd backend
npm test
cd ../frontend
npm run build
npm run lint
```

Bộ backend kiểm tra biến môi trường, cổng/origin không hợp lệ, response/CORS, route thiếu, JSON lỗi, body lớn, health khi database chưa kết nối, promise rejection, che lỗi nội bộ và không mở HTTP khi database không truy cập. Test khởi động dùng URI không kết nối được; đây không phải kiểm thử với fitmanager thật.

## 6. Ma trận UAT mục tiêu

| ID | Liên kết | Tình huống | Kết quả mong đợi |
| --- | --- | --- | --- |
| TC-01 | FR-01 | Đăng ký hợp lệ/email trùng | Tạo member/hash; trùng bị từ chối |
| TC-02 | FR-02 | Sai mật khẩu/tài khoản khóa | Không tạo phiên |
| TC-03 | NFR-01 | Member gọi API admin | 403 |
| TC-04 | FR-04 | Giá âm/thời hạn 0 | 400, không ghi |
| TC-05 | FR-06/07 | Đăng ký gói chưa trả tiền | pending/unpaid; không cho dùng đặt lịch |
| TC-06 | FR-08 | Gói quá hạn/chưa đến ngày bắt đầu | Từ chối đặt lịch |
| TC-07 | BR-07 | PT có 09:00–10:00; đặt 09:30–10:30 | 409 |
| TC-08 | BR-07 | Cùng hội viên đặt hai PT cùng giờ | 409 |
| TC-09 | BR-07 | Hai request đồng thời cùng chỗ | Chỉ một booking hợp lệ |
| TC-10 | FR-09 | Hủy rồi tải lại | cancelled được lưu; lịch sử còn |
| TC-11 | FR-10 | Xác nhận completed hai lần | Không tính thêm buổi |
| TC-12 | FR-11/12 | PT không liên quan sửa giáo án/log | Từ chối; không đổi dữ liệu |
| TC-13 | FR-13 | Review booking chưa completed/đã review | Từ chối |
| TC-14 | FR-13 | Điểm 0, 6, 3.5 | Từ chối theo yêu cầu điểm nguyên |
| TC-15 | FR-14 | Trộn paid và unpaid | Chỉ paid được tính |
| TC-16 | NFR-06 | Reload sau thao tác hợp lệ | Dữ liệu lấy lại từ MongoDB |
| TC-17 | FR-16 | Database dừng | Trạng thái lỗi rõ ràng |

TC-01 đến TC-16 là kế hoạch nghiệp vụ; không ghi là đã pass khi API chưa có. Kết quả chạy thực nằm trong verification.md khi được cập nhật.

## 7. Xử lý lỗi thường gặp

- Connection refused 27017: kiểm tra MongoDB server/service đã chạy; Compass không mở cổng thay server.
- Port 5000/3000 đang dùng: xác định tiến trình, đổi cổng và cập nhật origin/API URL tương ứng.
- CORS: localhost và 127.0.0.1 là hai origin khác nhau; dùng thống nhất localhost:3000.
- API trả 404 cho nghiệp vụ: các endpoint đề xuất chưa được triển khai.
- E11000: xử lý unique index và dữ liệu trùng; không xóa database để che lỗi.
