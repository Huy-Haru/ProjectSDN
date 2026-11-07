# Biên bản Kiểm thử & Kịch bản Demo — Anh (anhnthe194418)

**Ngày lập:** 27/10/2026  
**Module:** Auth/RBAC, Profile, PT Schedule/WorkoutPlan, ProgressLog, Review  
**Môi trường:** localhost:5000 (backend) + localhost:3000 (frontend)

---

## I. Kết quả Unit/Integration Test (node --test)

### Test file: `test/backend.test.js` (có sẵn)
| # | Test case | Kết quả |
|---|-----------|---------|
| 1 | Environment rejects missing DB, bad ports | ✅ PASS |
| 2 | HTTP routes return consistent responses | ✅ PASS |
| 3 | Express 4 forwards rejected promises to error handler | ✅ PASS |
| 4 | Unexpected errors do not expose internal details | ✅ PASS |
| 5 | Server exits instead of opening HTTP when MongoDB unreachable | ✅ PASS |

### Test file: `test/auth-security.test.js` (A4.1)
| # | Test case | Kết quả |
|---|-----------|---------|
| 1 | JWT signToken + verifyToken round-trip | ✅ PASS |
| 2 | JWT token giả mạo bị từ chối | ✅ PASS |
| 3 | JWT token bị sửa payload bị từ chối | ✅ PASS |
| 4 | Middleware: không có Authorization header → 401 | ✅ PASS |
| 5 | Middleware: Authorization Bearer sai format → 401 | ✅ PASS |
| 6 | Middleware: JWT hết hạn → 401 với thông báo rõ ràng | ✅ PASS |
| 7 | Middleware: JWT token giả (sai secret) → 401 | ✅ PASS |
| 8 | RBAC: authorize() chặn đúng role không được phép | ✅ PASS |
| 9 | RBAC: không có req.user khi gọi authorize() → 403 | ✅ PASS |
| 10 | Error handler: lỗi không kiểm soát không lộ stack/DB URI | ✅ PASS |
| 11 | Error handler: AppError(403) không lộ thông tin nội bộ | ✅ PASS |
| 12 | Register: không cho truyền role/isActive vào body | ✅ PASS |
| 13 | Response utils: sendSuccess trả đúng cấu trúc | ✅ PASS |
| 14 | Response utils: status 200 mặc định | ✅ PASS |
| 15 | Ownership: bookingId không thuộc member hiện tại → 403 | ✅ PASS |
| 16 | Ownership: trainer không liên quan → không được confirm | ✅ PASS |
| 17 | Review: rating phải là số nguyên 1-5 | ✅ PASS |
| 18 | Review: booking status phải là completed | ✅ PASS |
| 19 | Booking result: chỉ completed và no_show được confirm | ✅ PASS |
| 20 | Booking result: không chuyển ngược từ completed | ✅ PASS |

**Tổng: 25/25 PASS — 0 FAIL**

---

## II. Checklist kiểm thử thủ công (UAT)

### Auth & Session
- [x] Đăng ký tài khoản mới → nhận JWT, role tự động = `member`
- [x] Đăng nhập đúng → nhận JWT + user info
- [x] Đăng nhập sai password → 401 (không lộ email tồn tại hay không)
- [x] Tải lại trang → phục hồi phiên qua `/auth/me` + token localStorage
- [x] Đăng xuất → token bị xóa, request tiếp theo bị từ chối
- [x] Token hết hạn → 401 với message "hết hạn"
- [x] Tài khoản bị Admin khóa → 403 dù token còn hạn

### Cross-role access (truy cập chéo vai trò)
- [x] Guest truy cập `/api/auth/me` → 401
- [x] Member truy cập `/api/trainer/schedule` → 403
- [x] Member truy cập `/api/bookings/:id/result` → 403
- [x] Trainer truy cập admin dashboard API → 403
- [x] PT A xem lịch của PT B → 0 kết quả (filter theo trainer profile)
- [x] PT A confirm booking của PT B → 403

### Profile
- [x] Lấy profile → không có `password` trong response
- [x] Cập nhật profile với `role: admin` trong body → bị bỏ qua, role không đổi
- [x] Trainer xem profile → có `trainerProfile` kèm theo
- [x] Trainer cập nhật `ratingAverage` → bị bỏ qua (whitelist)
- [x] Đổi mật khẩu với mật khẩu cũ sai → 400

### WorkoutPlan
- [x] PT tạo giáo án cho member có booking → 201
- [x] PT tạo giáo án cho member không liên quan → 403
- [x] Member xem giáo án của mình → chỉ thấy của mình
- [x] PT A cập nhật giáo án của PT B → 404 (not found)

### Booking Result & ProgressLog
- [x] PT confirm `completed` → booking status cập nhật + ProgressLog được tạo
- [x] PT confirm cùng booking lần 2 → 400 (status không phải `booked`)
- [x] PT confirm booking của PT khác → 403
- [x] Admin confirm bất kỳ booking → 200
- [x] ProgressLog tạo cùng ngày cùng trainer+member → upsert, không tạo trùng
- [x] Member xem ProgressLog → chỉ thấy của mình
- [x] PT xem ProgressLog của HV không liên quan → 403

### Review
- [x] Member review booking `completed` của mình → 201
- [x] Member review booking `booked` (chưa xong) → 400
- [x] Member review booking của member khác → 403
- [x] Member gửi review lần 2 cho cùng booking → 409
- [x] Rating = 6 → 400 validation error
- [x] Rating = 1.5 (không nguyên) → 400
- [x] Sau khi review → PT xem dashboard thấy rating cập nhật

---

## III. Kịch bản Demo — PT & Auth

### Kịch bản 1: Guest đăng ký và thử truy cập trái phép

```
1. Mở trang FitManager → chưa đăng nhập
2. Nhấn "Đăng ký" → điền fullName, email, password
3. Server tạo tài khoản role=member, trả JWT
4. [Thử vi phạm] Dùng Postman gửi GET /api/trainer/schedule với token member
   → Kết quả: 403 "Bạn không có quyền thực hiện thao tác này."
5. [Thử vi phạm] Gửi POST /api/auth/register với body { role: "admin" }
   → Kết quả: tài khoản được tạo nhưng role = member (không phải admin)
```

**Kết quả phải thấy:** Member được tạo; truy cập Admin/Trainer API bị từ chối.

---

### Kịch bản 2: PT xem lịch, xác nhận buổi tập, ghi tiến độ

```
Tài khoản demo PT: trainer_demo@fitmanager.vn (đã có booking với member)

1. Đăng nhập với tài khoản PT → redirect đến Trainer Dashboard
   → Thấy lịch hôm nay, số học viên, rating thật từ DB

2. Vào "Lịch Dạy" → thấy danh sách bookings của mình (API thật)
   → Lọc theo ngày hôm nay hoặc theo trạng thái "Chờ dạy"

3. Nhấn "Xác nhận" trên buổi tập đang chờ:
   - Chọn kết quả: "Hoàn thành"
   - Nhập cân nặng: 67.5 kg, tỷ lệ mỡ: 18.2%
   - Nhấn "Xác nhận kết quả"
   → Booking status → completed; ProgressLog được ghi vào DB

4. Vào "Học viên" → chọn học viên vừa tập → nhấn "Tạo giáo án"
   → Điền tiêu đề, thêm bài tập → lưu
   → WorkoutPlan được lưu vào MongoDB

5. [Thử vi phạm] PT cố xem lịch của PT khác:
   → API /api/trainer/schedule chỉ trả bookings của mình → 0 kết quả nếu không có
```

---

### Kịch bản 3: Member xem tiến độ và gửi đánh giá

```
Tài khoản demo Member: member_demo@fitmanager.vn

1. Đăng nhập → redirect Member Dashboard
2. Vào "Tiến độ" → thấy lịch sử chỉ số (cân nặng, body fat) từ DB
   → Không có mock data, chỉ có dữ liệu PT đã ghi sau buổi tập

3. [Demo đánh giá] Member vào lịch tập → tìm buổi đã "completed"
   → Nhấn "Đánh giá" → chọn 5 sao, nhập nhận xét → Gửi
   → Review được lưu vào DB, PT nhận được ngay trên dashboard

4. [Thử gửi lại] Nhấn "Đánh giá" lần 2 cho cùng buổi
   → Thông báo lỗi: "Bạn đã đánh giá buổi tập này rồi."

5. Tải lại trang → dữ liệu tiến độ vẫn còn (lấy từ MongoDB, không mất)
```

---

### Kịch bản 4: Kiểm tra tài khoản bị khóa

```
1. Admin khóa tài khoản trainer_demo (isActive = false)
2. PT thử dùng JWT cũ (còn hạn) để gọi API
   → Kết quả: 403 "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
3. Frontend tự động đăng xuất khi nhận 403
```

---

## IV. Hạn chế còn lại

| # | Hạn chế | Ghi chú |
|---|---------|---------|
| 1 | Refresh token chưa có | JWT stateless, logout = xóa localStorage |
| 2 | Upload avatar chưa tích hợp (chỉ lưu URL string) | Cần file upload service |
| 3 | ProgressLog chưa có field `bookingId` trực tiếp | Tìm bằng member+trainer+date |
| 4 | Review chỉ Member gửi được; chưa có edit/delete | Theo yêu cầu MVP |
| 5 | Test DB-dependent cần MongoDB test instance | Các test logic đã cover |
