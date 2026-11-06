# Thiết kế cơ sở dữ liệu MongoDB

## 1. Tổng quan

Database local: `fitmanager`. Model được đăng ký qua `backend/src/models/index.js`. Mongoose dùng tên collection mặc định: users, trainerprofiles, membershippackages, subscriptions, bookings, workoutplans, progresslogs, reviews. `_id` là ObjectId. Tất cả model bật timestamps nên có createdAt và updatedAt; `__v` là version key mặc định.

MongoDB không thực thi khóa ngoại. `ref` hỗ trợ populate nhưng không tự kiểm tra document đích tồn tại, đúng vai trò hay thuộc đúng người. Unique là index database, không phải validator Mongoose; chỉ có hiệu lực sau khi index được tạo thành công.

## 2. Từ điển dữ liệu

### User → users

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| fullName | String | Bắt buộc, trim |
| email | String | Bắt buộc, unique, lowercase, trim |
| password | String | Bắt buộc, select:false, hash bcrypt trước save |
| phone | String | Tùy chọn, trim |
| gender | String | male/female/other |
| dateOfBirth | Date | Tùy chọn |
| avatar | String | Tùy chọn, trim |
| role | String | member/trainer/admin; mặc định member |
| isActive | Boolean | Mặc định true |

Đã có kiểm tra định dạng/maxlength email, password 8 ký tự và tối đa 72 byte, toJSON bỏ password. Chưa có chính sách độ mạnh nâng cao hoặc kiểm tra ngày sinh.

### TrainerProfile → trainerprofiles

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| user | ObjectId → User | Bắt buộc, unique |
| specialties | String[] | Trim từng phần tử |
| experienceYears | Number | >= 0 |
| bio | String | Trim |
| certificates | String[] | Trim |
| pricePerSession | Number | Bắt buộc, >= 0 |
| ratingAverage | Number | 0–5, mặc định 0, làm tròn 1 chữ số |
| ratingCount | Number | Mặc định 0 |
| isActive | Boolean | Mặc định true |

Admin service kiểm tra User có role trainer khi tạo/cập nhật hồ sơ. Giá gói là số tiền đăng ký; đặt lịch yêu cầu includesPT, không phát sinh khoản thu PT riêng tự động.

### MembershipPackage → membershippackages

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| name | String | Bắt buộc, trim |
| description | String | Trim |
| durationDays | Number | Bắt buộc, >= 1 |
| price | Number | Bắt buộc, >= 0 |
| sessionLimit | Number/null | Mặc định null (không giới hạn); số >= 1 |
| includesPT | Boolean | Mặc định false |
| isActive | Boolean | Mặc định true |

durationDays/sessionLimit/price đã có kiểm tra số nguyên; sessionLimit vẫn cho phép null.

### Subscription → subscriptions

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| member | ObjectId → User | Bắt buộc |
| package | ObjectId → MembershipPackage | Bắt buộc |
| startDate/endDate | Date | Bắt buộc |
| status | String | pending/active/expired/cancelled; mặc định pending |
| paymentStatus | String | unpaid/paid; mặc định unpaid |
| amount | Number | Bắt buộc, số nguyên >= 0 |
| paidAt | Date | Bắt buộc khi paymentStatus=paid |
| includesPT | Boolean | Snapshot quyền PT tại đăng ký; legacy có thể thiếu |
| sessionLimit | Number/null | Snapshot số nguyên >= 1 hoặc null; legacy có thể thiếu |
| reservedSessions | Number | Số nguyên >= 0; đếm lịch mới đang giữ quota |

amount lưu giá trị đăng ký để không thay đổi theo giá danh mục. `isValid(at)` kiểm tra active/paid và startDate <= at <= endDate. `findActiveByMember()` áp dụng các điều kiện này và sort endDate/_id giảm dần; API cho phép nhiều gói active và yêu cầu chọn subscription cụ thể khi đặt lịch.

### Booking → bookings

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| member | ObjectId → User | Bắt buộc |
| trainer | ObjectId → TrainerProfile | Bắt buộc |
| subscription | ObjectId → Subscription | Bắt buộc |
| date | Date | Bắt buộc |
| startTime/endTime | String | Bắt buộc, trim, kiểm tra HH:mm và endTime > startTime |
| status | String | booked/completed/cancelled/no_show; mặc định booked |
| note | String | Trim |
| quotaReserved | Boolean | Mặc định false; lịch mới giữ quota qua reservedSessions |

Partial unique index theo trainer/date/startTime và member/date/startTime, áp dụng booked/completed/no_show, không giữ chỗ cancelled. date chuẩn hóa UTC midnight khi validate/save; API dùng YYYY-MM-DD. API mới chỉ tạo slot 60 phút tại giờ tròn 08:00–21:00, có precheck khoảng giao nhau với lịch cũ. Unique index bảo vệ cạnh tranh ở các slot cố định.

### WorkoutPlan → workoutplans

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| trainer/member | ObjectId → TrainerProfile/User | Bắt buộc |
| title | String | Bắt buộc, trim |
| goal | String | Trim |
| startDate/endDate | Date | Bắt buộc |
| items | Subdocument[] | Bài tập nhúng, có _id mặc định |
| status | String | active/completed/cancelled; mặc định active |

Mỗi items gồm dayOfWeek (String), exerciseName (String bắt buộc), sets (Number bắt buộc), reps (String bắt buộc), note (String). dayOfWeek chưa có enum; sets có min 1/integer; khoảng ngày có endDate > startDate khi validate/save.

### ProgressLog → progresslogs

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| member | ObjectId → User | Bắt buộc |
| trainer | ObjectId → TrainerProfile | Tùy chọn |
| date | Date | Bắt buộc, mặc định Date.now |
| weight | Number | >= 0, đơn vị kg |
| bodyFat | Number | 0–100, đơn vị % |
| height | Number | >= 0, đơn vị cm |
| note | String | Trim |
| attendedSessions | Number | >= 0, mặc định 0 |

attendedSessions tại một log không phải bộ đếm gói hoặc sổ tiêu thụ buổi đáng tin cậy. Cần quy định đây là snapshot hay số buổi cộng dồn để tránh cộng lặp.

ProgressLog bổ sung requestId (String, bất biến) và requestHash (String, bất biến, select:false). Unique partial index trainer/member/requestId chỉ áp dụng khi requestId là string; dữ liệu cũ không có mã không xung đột. Hash và mã yêu cầu bị loại khỏi response JSON. Xem [chống gửi trùng](18-progress-idempotency.md).

### Review → reviews

| Trường | Kiểu | Ràng buộc hiện có |
| --- | --- | --- |
| member | ObjectId → User | Bắt buộc |
| trainer | ObjectId → TrainerProfile | Bắt buộc |
| booking | ObjectId → Booking | Bắt buộc, unique |
| rating | Number | Bắt buộc, số nguyên 1–5 |
| comment | String | Trim |

Aggregate cast trainerId ObjectId và tính ratingAverage/ratingCount về TrainerProfile. Hook save được await; hook findOneAndUpdate/findOneAndDelete và document.deleteOne cũng tính lại. member/trainer/booking immutable. Bulk update/delete và direct driver không đi qua các hook này; ghi đồng thời vẫn cần đối soát.

## 3. Quan hệ và cardinality

| Quan hệ | Cardinality logic | Ràng buộc |
| --- | --- | --- |
| User → TrainerProfile | 1 → 0..1 | TrainerProfile.user required + unique; User không bắt buộc có profile |
| User → Subscription | 1 → 0..N | Subscription.member required |
| MembershipPackage → Subscription | 1 → 0..N | Subscription.package required |
| User → Booking | 1 → 0..N | Booking.member required |
| TrainerProfile → Booking | 1 → 0..N | Booking.trainer required |
| Subscription → Booking | 1 → 0..N | Booking.subscription required |
| User/TrainerProfile → WorkoutPlan | Mỗi bên 1 → 0..N | Hai ref required |
| User → ProgressLog | 1 → 0..N | member required |
| TrainerProfile → ProgressLog | 0..1 PT/log; mỗi PT có 0..N log | trainer optional |
| Booking → Review | 1 → 0..1 | Review.booking required + unique |
| User/TrainerProfile → Review | Mỗi bên 1 → 0..N | Hai ref required |
| WorkoutPlan → items | 1 → 0..N embedded | Không phải collection riêng |

Cardinality là mục tiêu dữ liệu; ngoại trừ unique index, MongoDB không tự bảo đảm các liên kết này. ERD thể hiện quan hệ logic, database diagram thể hiện collection/field/ref và items nhúng.

## 4. Index hiện có và đề xuất

Hiện có: `_id`; email/user/booking unique; hai partial unique Booking và các compound index trong [tài liệu tối ưu](06-mongodb-optimization.md). Migration kiểm tra và thay legacy booking index có phạm vi, không dùng syncIndexes.

Các query index đã khai báo và áp dụng qua migration; cần đo explain/p95 khi có dữ liệu thực. Index không thay thế cơ chế chống chồng khoảng giờ khi có request đồng thời.

## 5. Dữ liệu mẫu và migration

Thứ tự tạo mẫu: User → TrainerProfile/MembershipPackage → Subscription → Booking → WorkoutPlan/ProgressLog/Review. Dùng ObjectId thật và hash password qua save. Không dùng trực tiếp id mock trong React. Seed phải idempotent và không tạo tài khoản admin với mật khẩu công khai cố định trong môi trường triển khai.

Đã có paidAt. Đã có snapshot quyền lợi và bộ đếm buổi cho đăng ký mới. Lịch cũ chưa đánh dấu quota được đếm riêng; xem [quy tắc và khôi phục](12-member-booking.md). Chưa có Payment collection/reference ngân hàng, lịch rảnh PT hoặc collection phân công hội viên riêng. Mọi migration cần kiểm tra dữ liệu cũ, sao lưu và ghi lại thay đổi index.
