# Tối ưu MongoDB và profile theo ba vai trò

## 1. Profile

Mọi tài khoản có một User chứa fullName, email, password, phone, gender, dateOfBirth, avatar, role, isActive. Ba role chính thức là **Member**, **PT**, **Admin**; giá trị lưu tương ứng **member**, **trainer**, **admin**. Khách chưa đăng nhập không có role trong database.

TrainerProfile là phần mở rộng 0..1 của User dành cho PT: chuyên môn, chứng chỉ, kinh nghiệm, giá buổi và điểm đánh giá. Member và Admin sử dụng profile chung ở User; không tạo MemberProfile/AdminProfile rỗng hoặc ba collection trùng lặp thông tin. API profile cần trả User và mở rộng PT nếu có; API profile chưa được triển khai. Kiểm tra role của User đích và quyền sở hữu vẫn phải nằm tại service.

## 2. Validation và nhất quán

- Email được kiểm tra định dạng, chuẩn hóa và unique; fullName tối đa 120 ký tự, email tối đa 254.
- Password tối thiểu 8 ký tự, tối đa 72 byte UTF-8 để phù hợp bcrypt; toJSON loại password kể cả khi query chọn trường này.
- Giá VND, thời hạn, hạn mức buổi, số hiệp, số buổi và số đánh giá là số nguyên; rating là số nguyên 1–5.
- Subscription/WorkoutPlan kiểm tra endDate > startDate khi validate/save document.
- Subscription paid phải có paidAt; isValid(at) kiểm tra active, paid và cả ngày bắt đầu/kết thúc. findActiveByMember lọc đầy đủ và chọn ổn định theo endDate/_id giảm dần.
- Booking kiểm tra HH:mm và startTime < endTime; date là ngày lịch YYYY-MM-DD được lưu UTC midnight. Giờ tập hiểu theo Asia/Ho_Chi_Minh. API cần nhận ngày dạng YYYY-MM-DD; không truyền timestamp có offset để suy ra ngày mà không chuyển đổi.
- Tất cả model bật optimisticConcurrency cho document save; cập nhật phiên bản cũ bị từ chối thay vì ghi đè thay đổi mới.
- Review giữ immutable member/trainer/booking; await tính điểm sau save và findOneAndUpdate/findOneAndDelete, hỗ trợ document.deleteOne. Aggregate cast trainerId sang ObjectId để query String không bị bỏ sót.

Update validators trong Mongoose không tự tương đương document validation. Các phép thay đổi khoảng ngày, giờ, password và nghiệp vụ nhiều trường cần load document → gán trường whitelist → save, hoặc service kiểm tra đầy đủ. Bulk/direct driver writes không được bảo vệ bởi hook. Tham khảo [Mongoose validation](https://mongoosejs.com/docs/validation.html).

## 3. Index

| Collection | Index ngoài _id | Mục đích |
| --- | --- | --- |
| users | email unique; role/isActive/createdAt desc | Tìm tài khoản; quản lý theo role |
| trainerprofiles | user unique; isActive/specialties/ratingAverage desc | Danh sách PT theo chuyên môn |
| membershippackages | isActive/price | Danh sách gói hoạt động |
| subscriptions | member/status/endDate desc; paymentStatus/paidAt desc | Gói hội viên; doanh thu theo ngày thu |
| bookings | trainer/date/startTime partial unique; member/date/startTime partial unique | Chặn cùng thời điểm bắt đầu cho PT/hội viên |
| bookings | trainer/date/status/startTime; member/date desc/startTime; subscription/status | Lịch theo người và đếm buổi gói |
| workoutplans | member/status/startDate desc; trainer/member/status | Giáo án theo hội viên/PT |
| progresslogs | member/date desc; trainer/member/date desc | Lịch sử chỉ số |
| reviews | booking unique; trainer/createdAt desc; member/createdAt desc | Một review/buổi; lịch sử đánh giá |

Hai index unique Booking chỉ áp dụng booked/completed/no_show; cancelled không giữ chỗ, cho phép đặt lại. Partial index giới hạn document được index theo điều kiện; xem [MongoDB createIndexes](https://www.mongodb.com/docs/manual/reference/command/createindexes/).

Không dùng TTL cho lịch sử tập, gói và thanh toán. Không tạo index cho mọi field. Các index mới dựa trên truy vấn dự kiến; chưa có số liệu tải thực để tuyên bố tăng tốc bao nhiêu phần trăm. Cần dùng explain/executionStats và đo p95 khi có dữ liệu đủ lớn.

## 4. Áp dụng và kiểm thử

```powershell
cd backend
node scripts/optimize-indexes.js
npm test
node scripts/verify-database.js
```

Migration tạo index khai báo trước; chỉ bỏ legacy trainer_1_date_1_startTime_1 sau khi kiểm tra đúng key/unique và index mới đã tạo thành công. Không gọi syncIndexes để tránh xóa index ngoài phạm vi; không xóa dữ liệu/collection. Nếu ngày booking cũ không chuẩn hóa hoặc unique mới có xung đột, dừng và yêu cầu migration dữ liệu riêng. Không tự sửa lịch sử để khớp schema.

verify-database tạo database tên fitmanager_verification_ với hậu tố ngẫu nhiên; kiểm tra hash, unique, hủy rồi đặt lại, điểm review và optimistic concurrency; chỉ xóa đúng database tạm do lần chạy tạo. fitmanager không được dùng để chèn dữ liệu kiểm thử.

Trong development autoIndex bật; production autoIndex tắt và chạy migration chủ động. Pool tối đa 10 kết nối, minPoolSize=0, serverSelectionTimeoutMS=5000. Các giá trị này là cấu hình nền, cần đo trước khi nâng theo tải.

## 5. Giới hạn còn lại

Index cùng startTime **không chặn mọi khoảng giờ chồng nhau**. Còn cần service kiểm tra khoảng thời gian và cơ chế cạnh tranh giữa request đồng thời cho interval tùy ý. Chưa có foreign-key enforcement, RBAC API, hạn mức buổi nguyên tử, lịch rảnh PT hoặc Payment collection. paidAt giúp lọc ngày thu nhưng chưa có luồng admin ghi nhận thanh toán. Điểm PT là dữ liệu tổng hợp; hook await xử lý luồng thông thường, chưa là transaction nguyên tử giữa Review và TrainerProfile khi nhiều writer cùng lúc. Cần tác vụ đối soát hoặc cơ chế đồng bộ trước vận hành tải cao.
