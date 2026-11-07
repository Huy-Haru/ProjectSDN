# API Reference — Phần của Anh (anhnthe194418)

> **Phạm vi:** Auth/RBAC, Profile, Trainer schedule/workout, ProgressLog, Review  
> **Base URL:** `http://localhost:5000/api`  
> **Auth:** JWT Bearer — `Authorization: Bearer <token>`

---

## 1. Auth — `/api/auth`

### POST `/api/auth/register`
Đăng ký tài khoản **Member** mới (public, không cần auth).

**Body:**
```json
{
  "fullName": "Nguyễn Văn An",
  "email": "an@example.com",
  "password": "123456",
  "phone": "0901234567",      // optional
  "gender": "male",           // optional: male | female | other
  "dateOfBirth": "2000-01-15" // optional
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Đăng ký thành công!",
  "data": {
    "token": "<JWT>",
    "user": { "_id": "...", "fullName": "...", "email": "...", "role": "member", "isActive": true }
  }
}
```

**Lỗi:**
| Code | Trường hợp |
|------|-----------|
| 400 | Thiếu fullName/email/password, password < 6 ký tự |
| 409 | Email đã tồn tại |

> ⚠️ Server luôn force `role = member`. Không thể tự tạo admin/trainer qua API này.

---

### POST `/api/auth/login`
Đăng nhập bằng email + password.

**Body:** `{ "email": "...", "password": "..." }`

**Response 200:** `{ "token": "<JWT>", "user": { ...userInfo } }`

**Lỗi:**
| Code | Trường hợp |
|------|-----------|
| 400 | Thiếu email/password |
| 401 | Email/password sai |
| 403 | Tài khoản bị khóa |

---

### POST `/api/auth/logout`
Đăng xuất — JWT stateless, server trả xác nhận.  
**Auth:** Không bắt buộc (client xóa token).

---

### GET `/api/auth/me`
Lấy thông tin user đang đăng nhập.  
**Auth:** ✅ Bắt buộc

**Response 200:** `{ "user": { "_id", "fullName", "email", "role", "isActive", ... } }`

---

## 2. Profile — `/api/profile`
**Auth:** ✅ Tất cả endpoints yêu cầu đăng nhập

### GET `/api/profile/me`
Lấy profile cá nhân. Nếu là `trainer` → trả thêm `trainerProfile`.

**Response 200:**
```json
{
  "_id": "...", "fullName": "...", "email": "...", "role": "trainer",
  "trainerProfile": {
    "specialties": ["Gym", "Yoga"],
    "experienceYears": 5,
    "bio": "...",
    "pricePerSession": 300000,
    "ratingAverage": 4.7,
    "ratingCount": 23
  }
}
```

---

### PATCH `/api/profile/me`
Cập nhật thông tin cá nhân — chỉ whitelist fields.

**Whitelist:** `fullName`, `phone`, `gender`, `dateOfBirth`, `avatar`  
> ❌ Không cho sửa: `role`, `isActive`, `email`, `password`

---

### PATCH `/api/profile/trainer`
Trainer tự cập nhật TrainerProfile.  
**Chỉ:** Trainer  
**Whitelist:** `specialties`, `experienceYears`, `bio`, `certificates`, `pricePerSession`  
> ❌ Không cho sửa: `ratingAverage`, `ratingCount`, `isActive`

---

### POST `/api/profile/change-password`
Đổi mật khẩu — luồng riêng, yêu cầu mật khẩu cũ.

**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## 3. Trainer — `/api/trainer`

### GET `/api/trainer/schedule`
PT xem lịch dạy của mình.  
**Auth:** ✅ Trainer only

**Query params:**
- `?status=booked|completed|cancelled|no_show`
- `?date=YYYY-MM-DD`

**Response:** `{ "bookings": [...], "trainerProfileId": "..." }`  
Mỗi booking populate `member` (fullName, email, phone, avatar) và `subscription` (status, paymentStatus).

---

### GET `/api/trainer/members`
PT xem danh sách hội viên liên quan (đã/đang có booking).  
**Auth:** ✅ Trainer only

**Response:** `{ "members": [{ ..., "totalBookings", "completedBookings", "latestBooking" }] }`

---

### POST `/api/trainer/workout-plans`
Tạo giáo án cho member.  
**Auth:** ✅ Trainer only  
**Điều kiện:** Member phải có booking với trainer này.

**Body:**
```json
{
  "memberId": "<User._id>",
  "title": "Giảm mỡ bụng 4 tuần",
  "goal": "Giảm 3kg",
  "startDate": "2026-10-27",
  "endDate": "2026-11-24",
  "items": [
    { "dayOfWeek": "Monday", "exerciseName": "Plank", "sets": 3, "reps": "60s", "note": "..." }
  ]
}
```

---

### GET `/api/trainer/workout-plans`
Danh sách giáo án của PT.  
**Query:** `?memberId=<id>`, `?status=active|completed|cancelled`

### GET `/api/trainer/workout-plans/:planId`
Chi tiết một giáo án (phải là của PT đang đăng nhập).

### PATCH `/api/trainer/workout-plans/:planId`
Cập nhật giáo án.  
**Whitelist:** `title`, `goal`, `startDate`, `endDate`, `items`, `status`

---

### GET `/api/trainer/member/workout-plans`
Member xem giáo án của mình (tất cả PT tạo).  
**Auth:** ✅ Member only

---

## 4. Booking Result & Detail — `/api/bookings`

### PATCH `/api/bookings/:bookingId/result` ⭐ A3.1
Xác nhận kết quả buổi tập.  
**Auth:** ✅ Trainer (liên quan) hoặc Admin

**Body:**
```json
{
  "status": "completed",   // hoặc "no_show"
  "note": "Học viên tiến bộ tốt",
  "weight": 68.5,          // optional — ghi vào ProgressLog
  "bodyFat": 17.2,         // optional
  "height": 170,           // optional
  "attendedSessions": 1    // optional
}
```

**Điều kiện:**
- Booking phải ở trạng thái `booked` (không được `cancelled`/`completed`)
- Chỉ PT có `trainerProfile._id === booking.trainer` được confirm
- Nếu `completed` → tự động upsert ProgressLog (idempotent theo member+trainer+ngày)

**Response:** `{ "booking": {...}, "progressLog": {...} | null }`

---

### GET `/api/bookings/:bookingId`
Chi tiết một booking.  
**Auth:** Member (sở hữu), Trainer (liên quan), Admin

---

## 5. Progress Log — `/api/progress`

### GET `/api/progress`
Xem ProgressLog theo quyền.  
**Auth:** ✅ Bắt buộc

| Role | Quyền xem |
|------|-----------|
| Member | Chỉ log của mình |
| Trainer | Log của HV liên quan (`?memberId=<id>`) hoặc tất cả HV của mình |
| Admin | Tất cả (`?memberId=<id>` optional) |

---

### POST `/api/progress`
Ghi ProgressLog thủ công.  
**Auth:** ✅ Trainer hoặc Admin  
**Tính năng:** Idempotent — upsert theo member+trainer+ngày

**Body:**
```json
{
  "memberId": "<User._id>",
  "date": "2026-10-27",   // optional, default: today
  "weight": 68.5,
  "bodyFat": 17.2,
  "height": 170,
  "note": "Học viên cải thiện tốt",
  "attendedSessions": 1
}
```

---

## 6. Review — `/api/reviews`

### POST `/api/reviews` ⭐ A3.2
Member gửi đánh giá PT.  
**Auth:** ✅ Member only

**Điều kiện:**
1. `booking.member === req.user._id` — phải là booking của mình
2. `booking.status === completed`
3. Booking chưa có review (unique per booking)
4. `rating` phải là số nguyên 1–5

**Body:**
```json
{
  "bookingId": "<Booking._id>",
  "rating": 5,
  "comment": "PT rất nhiệt tình và chuyên nghiệp!"
}
```

**Response 201:** `{ "review": { "_id", "rating", "comment", "member", "trainer", "createdAt" } }`

**Lỗi:**
| Code | Trường hợp |
|------|-----------|
| 400 | Thiếu bookingId/rating, rating ngoài 1-5 |
| 403 | Booking không phải của member, không phải completed |
| 409 | Đã review booking này rồi |

---

### GET `/api/reviews/my-trainer-reviews`
PT xem tất cả reviews về mình.  
**Auth:** ✅ Trainer only

**Response:** `{ "reviews": [...], "summary": { "ratingAverage": 4.7, "ratingCount": 23 } }`

---

### GET `/api/reviews/trainer/:trainerId`
Xem reviews và điểm tổng hợp của PT (public).  
**Auth:** ❌ Không cần

---

### GET `/api/reviews/booking/:bookingId`
Review của một booking cụ thể.  
**Auth:** ✅ Member sở hữu, Trainer liên quan, Admin

---

## 7. Quy tắc chung

### Response format chuẩn
```json
{
  "success": true | false,
  "message": "Thông báo",
  "data": { ... }
}
```

### Error codes
| HTTP | Ý nghĩa |
|------|---------|
| 400 | Dữ liệu đầu vào không hợp lệ |
| 401 | Chưa đăng nhập / token hết hạn |
| 403 | Không có quyền (sai role / không phải owner) |
| 404 | Resource không tồn tại |
| 409 | Trùng lặp (email, booking đã review) |
| 500 | Lỗi server — không lộ chi tiết nội bộ |

### Bảo mật
- ❌ Lỗi 500 không lộ stack trace, DB URI, password
- ❌ Không cho client tự đặt `role` / `isActive` / `ratingAverage`
- ✅ Password hash bcrypt, không bao giờ trả về trong response
- ✅ JWT kiểm tra tài khoản còn active sau mỗi request (`authenticate` middleware)
- ✅ Tài khoản bị khóa (`isActive=false`) → 403 ngay cả khi token còn hạn
