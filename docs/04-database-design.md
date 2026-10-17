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

user phải trỏ đến tài khoản trainer theo yêu cầu nghiệp vụ; schema chưa kiểm tra role. Giá PT và cơ chế gói includesPT cần được chốt trước tính tiền.

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

amount lưu giá trị đăng ký để không thay đổi theo giá danh mục. `isValid(at)` kiểm tra active/paid và startDate <= at <= endDate. `findActiveByMember()` áp dụng các điều kiện này và sort endDate/_id giảm dần; chính sách nhiều gói active vẫn cần xác nhận.

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

Partial unique index theo trainer/date/startTime và member/date/startTime, áp dụng booked/completed/no_show, không giữ chỗ cancelled. date chuẩn hóa UTC midnight khi validate/save; API dùng YYYY-MM-DD. Chặn cùng startTime, chưa chặn mọi khoảng giờ chồng nhau.

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

Đã có paidAt. Đề xuất bổ sung: payment reference hoặc Payment collection, snapshot quyền lợi gói tại đăng ký, cơ chế đếm buổi, lịch rảnh PT và quan hệ phân công hội viên. Đây chưa phải schema hiện có. Mọi migration cần kiểm tra dữ liệu cũ, sao lưu và ghi lại thay đổi index.
