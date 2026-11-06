# Luồng đặt lịch PT của Member

## Quy tắc nghiệp vụ

- Member sử dụng gói của chính mình, đã thanh toán và được kích hoạt; toàn bộ buổi tập phải nằm trong thời hạn gói.
- Gói phải kèm PT. Đăng ký mới lưu `includesPT` và `sessionLimit` tại thời điểm mua; sửa danh mục không đổi quyền lợi đã mua. Đăng ký cũ chưa có hai trường này tạm dùng giá trị của gói liên kết.
- Ca mới dài 60 phút, bắt đầu vào giờ tròn từ 08:00 đến 21:00 theo giờ Việt Nam. Booking.date tiếp tục lưu ngày lịch ở 00:00 UTC; giờ buổi tập được diễn giải theo UTC+7.
- PT phải hoạt động ở cả User và TrainerProfile. Không đặt trùng ca của PT hoặc Member; cũng kiểm tra giao nhau với lịch cũ không theo giờ tròn.
- Lịch booked, completed, no_show đều chiếm hạn mức. Lịch cancelled không chiếm hạn mức.
- Member chỉ hủy lịch của mình, trạng thái booked, trước giờ bắt đầu. Member không có thao tác tự xác nhận hoàn thành.
- Admin hủy lịch cũng hoàn hạn mức. Gọi hủy lại cùng lịch không hoàn thêm buổi.

## API

Tất cả đường dẫn sau yêu cầu đăng nhập role member:

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET | /api/member/trainers | PT đang hoạt động, chỉ thông tin công khai |
| GET | /api/member/bookings | Lịch của tài khoản hiện tại |
| POST | /api/member/bookings | Đặt ca với subscriptionId, trainerId, date (YYYY-MM-DD), startTime (HH:00), note |
| POST | /api/member/bookings/:id/cancel | Hủy lịch của mình |

Backend tự xác định member, endTime, status; không nhận các trường này từ client.

## Hạn mức và khôi phục

`Subscription.reservedSessions` đếm các lịch mới giữ hạn mức; `Booking.quotaReserved` đánh dấu lịch thuộc cơ chế này. Lịch cũ chưa được đánh dấu được đếm riêng, không cần đổi dữ liệu cũ để sử dụng.

Giữ hạn mức dùng cập nhật có điều kiện nguyên tử trên Subscription; tạo Booking thất bại sẽ bù lại bộ đếm. Unique indexes ngăn hai yêu cầu giữ cùng ca. Hủy dùng optimistic concurrency để một yêu cầu thắng mới hoàn buổi.

MongoDB local standalone không hỗ trợ transaction nhiều document. Việc ghi bộ đếm và Booking không phải một transaction; lỗi kết nối hoặc dừng tiến trình đúng giữa hai bước có thể gây lệch bộ đếm. Cần đối soát sau sự cố; không tuyên bố bảo đảm nguyên tử qua sự cố. Khi triển khai replica set nên chuyển toàn bộ thao tác sang transaction.

Chạy từ thư mục backend:

```text
npm run db:quota
```

Lệnh mặc định chỉ báo các chênh lệch, không thay đổi dữ liệu. Để sửa: dừng toàn bộ API và tác vụ khác ghi database, sao lưu database, rồi chạy:

```text
npm run db:quota -- --apply --writers-stopped
```

Đối soát tính lại bộ đếm từ các Booking được đánh dấu và chưa hủy. Chỉ mở lại các tác vụ ghi sau khi đối soát xong. Cờ writers-stopped là xác nhận của người vận hành, không tự kiểm tra hoặc dừng tiến trình.

## Kiểm chứng

- `npm run test:booking`: quyền sở hữu, gói chưa thanh toán, định dạng ngày/ca, giới hạn buổi, hai yêu cầu đồng thời, hai Member tranh ca PT, hoàn buổi khi Member/Admin hủy, hủy lặp, lịch đã bắt đầu, PT khóa, chế độ đối soát chỉ đọc và sửa có bảo vệ.
- `npm run test:member`, `npm run test:integration` và 17 bài backend: đạt.
- Frontend lint và production build: đạt.
- Edge UAT: Member chọn PT/gói, đặt lịch, tải lại trang, hủy và xác minh MongoDB hoàn hạn mức; các kịch bản Admin/PT hiện có vẫn đạt.

Các kiểm thử dùng database ngẫu nhiên riêng và tự dọn; không ghi dữ liệu kiểm thử vào fitmanager.
