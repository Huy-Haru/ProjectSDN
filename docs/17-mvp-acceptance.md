# Đối chiếu MVP và kế hoạch 4 tuần

Cập nhật 23/10/2026, nhánh tích hợp HuyNHHE190724. Phân công gốc giữ nguyên Huy–Admin, Hiếu–Member, Anh–PT/Auth. Bảng này ghi hiện trạng sản phẩm và bằng chứng kỹ thuật, không xác nhận khối lượng cá nhân, thời gian thực tế hoặc chữ ký nghiệm thu.

## 1. Truy vết công việc

| Mã kế hoạch | Hiện trạng kỹ thuật | Bằng chứng |
|---|---|---|
| H1.1 | Response/role/API đã thống nhất trong mã; thỏa thuận/review nhóm cần xác nhận riêng | docs/03, middleware Auth/errorHandler |
| H1.2/H1.3 | CRUD/khóa gói, Member và PT bằng API thật | test:integration, browser UAT Admin |
| H2.1/H2.2 | Xác nhận paid/paidAt và quản lý lịch theo quyền | test:integration, test:booking, browser |
| H3.1/H3.2 | Doanh thu theo paidAt và validation/quyền | test:integration; docs/08–09 |
| H4.1/H4.2 | Build/lint, CI, archive/restore DB tạm, hướng dẫn vận hành | npm test, test:archive, CI; hosting chưa nghiệm thu |
| M1.1/M1.2/M1.3 | Danh mục thật; đăng ký pending/unpaid; chính sách slot/quota và client | test:member, docs/12, docs/14 |
| M2.1/M3.2 | Đặt/hủy/xem lịch đúng chủ, hiệu lực, cạnh tranh ca/quota | test:booking; đối soát sau sự cố standalone |
| M3.1 | Tổng quan, giáo án, tiến độ, Review dùng API; Member không tự completed | browser UAT; docs/13–15 |
| M4.1 | Reload/loading/error/empty và luồng Member đã tự động kiểm tra | Browser UAT: Admin 390px, 14 màn Member/PT 375px và form bàn phím; còn nghiệm thu thiết bị thật/trình đọc màn hình |
| M4.2 | Context/use case/swimlane cập nhật API; PNG/SVG/drawio đồng bộ | Kiểm tra XML và xem ảnh; kịch bản demo ở mục 3 |
| A1.1/A1.2/A2.1 | Auth/RBAC/profile ba role và phiên UI thật | Bộ backend, test:integration, browser; JWT logout phía client |
| A2.2 | Lịch/học viên liên quan, tạo/xem/sửa giáo án; Member xem đúng của mình | test:trainer, browser; expectedVersion chống bản nháp cũ |
| A3.1 | PT chốt completed/no_show; ghi và xem tiến độ có quyền | test:attendance, test:progress; ProgressLog hỗ trợ requestId và replay an toàn; form giữ mã khi gửi lại cùng nội dung trong phiên mở |
| A3.2 | Review completed, unique booking, điểm tổng hợp và tổng quan PT | test:review và browser |
| A4.1 | Kiểm thử role/ownership/dữ liệu lỗi tự động | Các integration suite; không thay kiểm thử bảo mật độc lập |
| A4.2 | API/từ điển/ERD đã cập nhật, kết quả kiểm thử ghi lại | docs/02–04, diagram, verification.md; nghiệm thu nhóm còn riêng |

## 2. Bằng chứng chạy tự động

Bản code 81b848c đã đạt cả ba job backend, admin-frontend và admin-browser trên [GitHub Actions run 39872068984](https://github.com/Huy-Haru/ProjectSDN/actions/runs/39872068984). Hai bản trước 5d98518 và 57898da cũng thành công. Kết quả này xác nhận các suite đã cấu hình, không chứng minh toàn bộ NFR hoặc hosting.

Backend có 17 bài nền và các integration suite theo chức năng: test:integration, test:trainer, test:member, test:booking, test:progress, test:review, test:attendance, test:archive. Browser kiểm tra luồng ba role, tải lại, lỗi/thử lại, cạnh tranh phản hồi lọc và bản nháp form. Tất cả dùng database ngẫu nhiên riêng và tự dọn, không seed dữ liệu kiểm thử vào fitmanager.

## 3. Kịch bản demo đủ ba role

1. Chuẩn bị MongoDB local fitmanager, .env riêng và JWT_SECRET hợp lệ; tạo Admin bằng admin:create theo docs/08. Admin tạo PT và gói có PT. Không dùng mật khẩu admin cố định trong repo.
2. Member tự đăng ký/đăng nhập, chọn gói, gửi đăng ký pending/unpaid; kiểm tra tải lại còn dữ liệu.
3. Admin đối chiếu thu tiền tại quầy, xác nhận gói; kiểm tra paidAt và báo cáo doanh thu.
4. Member chọn đúng gói và PT, đặt ca tương lai; PT mở lịch thấy buổi mới. Đặt trùng phải bị từ chối. Có thể demo hủy một ca trước giờ bắt đầu rồi đặt lại.
5. PT tạo và sửa giáo án, ghi nhận thể trạng; Member mở tiến độ/giáo án để xem bản mới.
6. Sau giờ kết thúc thực tế, PT xác nhận completed hoặc no_show. Không sửa giờ máy hoặc dữ liệu fitmanager để bỏ qua điều kiện; bài tự động dùng fixture quá khứ trong database tạm để chạy bước này ngay.
7. Member đánh giá buổi completed; thử gửi lặp bị từ chối. PT xem phản hồi/điểm và tổng quan. no_show không có quyền đánh giá.
8. Đăng xuất/tải lại và thử tài khoản khóa hoặc role khác; các API bảo vệ phải từ chối đúng quyền.

## 4. Việc còn lại trước nghiệm thu chính thức

- Review chéo theo phân công gốc, biên bản UAT thủ công đủ Member/PT/Admin, thiết bị mobile thật và bàn phím toàn hệ thống.
- Đo NFR hiệu năng p95 với bộ dữ liệu/mức đồng thời đã định; chưa có số liệu đo để kết luận đạt.
- Phân trang các danh sách Member/PT hiện trả toàn bộ; giới hạn 100 hiện áp dụng cho danh sách Admin, chưa đáp ứng NFR-05 toàn hệ thống.
- Nếu cần đảm bảo qua sự cố: replica set + transaction cho quota/Booking; standalone hiện có đối soát bảo trì, không bảo đảm nguyên tử nhiều document.
- Idempotency ProgressLog đã bổ sung: client mới gửi requestId; client cũ không gửi mã vẫn tạo mới mỗi POST. Form chưa lưu mã/bản nháp qua đóng hoặc tải lại trang; xem docs/18.
- Chuẩn bị hosting/TLS, secret riêng và backup/restore trên môi trường triển khai. Không coi CI Linux là hosting.

Ngoài MVP hiện có: thanh toán online/hoàn tiền tự động, nhiều chi nhánh, scheduler hết hạn, lịch rảnh PT, realtime, rate limit đăng nhập, denylist JWT và audit bất biến. Không đánh dấu các mục này hoàn thành chỉ vì form/API hiện có.
