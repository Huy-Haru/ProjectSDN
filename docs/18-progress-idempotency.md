# Chống lưu trùng tiến độ khi gửi lại

## Hành vi

POST /api/trainer/members/:memberId/progress hỗ trợ requestId tùy chọn. Giao diện PT mới luôn tạo mã riêng cho lần ghi nhận, giữ nguyên mã nếu gửi lại cùng nội dung sau lỗi trong khi form vẫn mở, và tạo mã mới sau thành công hoặc khi nội dung thay đổi.

- Cùng PT, học viên, requestId và dữ liệu chuẩn hóa: trả bản ghi đã lưu với cùng _id; không tạo thêm document. Response vẫn là 201 để tương thích hợp đồng hiện có.
- Cùng mã nhưng nội dung khác: 409, không ghi đè bản cũ.
- Hai yêu cầu cùng mã đến đồng thời: unique partial index bảo vệ; yêu cầu gặp duplicate đọc lại bản thắng và kiểm tra hash trước khi trả kết quả.
- Kiểm tra tài khoản/PT hoạt động và quan hệ học viên vẫn chạy trước khi replay, không dùng mã yêu cầu để bỏ qua quyền.
- attendedSessions giữ ảnh chụp của lần lưu đầu, không tự tính lại khi replay dù trạng thái buổi tập đã thay đổi.

requestId nhận 16–100 ký tự chữ/số/gạch ngang/gạch dưới; form dùng UUID ngẫu nhiên. requestHash là SHA-256 của ngày, các chỉ số và nhận xét đã chuẩn hóa, không bao gồm trường chủ sở hữu client gửi hoặc số buổi server tính. Hai trường metadata không được đưa ra response JSON.

## Tương thích và triển khai

Client cũ không gửi requestId vẫn tạo bản ghi mới mỗi POST; không có bảo đảm chống trùng cho client đó. Form hiện giữ mã trong bộ nhớ khi vẫn mở, chưa khôi phục mã/bản nháp sau đóng form hoặc tải lại trang. Không dùng một mã cố định cho mọi lần đo.

Index mới: progress_request_unique, unique trên trainer/member/requestId, partialFilterExpression requestId có kiểu string. Bản ghi cũ thiếu requestId không cần sửa hoặc xóa. Khi triển khai cần áp dụng index bằng lệnh có sẵn trong backend:

```text
npm run db:indexes
```

Hành vi chống cạnh tranh phụ thuộc index được tạo thành công. Công cụ migration bổ sung index, không dùng syncIndexes để xóa index khác. Backup/restore giữ nguyên metadata và index.

## Kiểm thử

- test:progress: replay cùng _id, mã sai, mã bị tái sử dụng với nội dung khác, hai yêu cầu đồng thời chỉ một document, metadata không lộ, ảnh chụp số buổi không đổi khi replay.
- Edge UAT: chuyển tiếp request thật tới backend để lưu, sau đó giả lập phản hồi 503; form gửi lại dùng cùng mã và database vẫn chỉ một bản ghi.
- Backend 17/17, test:archive, frontend lint/build: đạt. Các luồng giáo án, lịch, đánh giá và Admin trong browser suite vẫn đạt.

Kiểm thử chỉ sử dụng database tạm riêng và tự dọn, không tạo dữ liệu kiểm thử trong fitmanager.
