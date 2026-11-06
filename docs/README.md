# FitManager documentation update

Website quản lý phòng tập và huấn luyện viên cho phòng tập sắp mở. Frontend dùng React/Vite, backend dùng Express MVC, Mongoose và MongoDB.

## Tài liệu bàn giao

- [FitManager-SRS.docx](FitManager-SRS.docx): SRS theo mẫu, gồm context diagram, screen flow, phân quyền, ERD và yêu cầu chức năng.
- [FitManager-SDS.docx](FitManager-SDS.docx): SDS theo mẫu, gồm package diagram, database schema, table descriptions, class specifications, sequence và queries.
- [FitManager-3-member-presentation.pptx](FitManager-3-member-presentation.pptx): slide phân công thuyết trình cho ba thành viên.
- [diagram/README.md](diagram/README.md): các sơ đồ draw.io, SVG và PNG gồm context, use case, workflow, ERD và database schema.

## Cấu trúc frontend

- `frontend/src/public`: Home, About, Context và Footer cho khách chưa đăng nhập.
- `frontend/src/auth`: Login và Register là trang riêng, không dùng modal.
- `frontend/src/shared`: layout, điều hướng role và preference theme/sidebar.
- `frontend/src/roles/member`: workspace hội viên.
- `frontend/src/roles/trainer`: workspace huấn luyện viên.
- `frontend/src/roles/admin`: workspace quản trị.
- `frontend/src/api`, `frontend/src/hooks`: kết nối API thật và phục hồi phiên.

## Nghiệp vụ chính

- Chủ phòng tập quản lý catalog gói tháng/quý/năm, PT, hội viên, lịch, thanh toán và doanh thu.
- PT quản lý lịch dạy, học viên, giáo án theo ngày và chỉ số tiến độ.
- Member đặt gói, đặt lịch PT, xem QR check in mô phỏng và gửi URL ảnh/video làm bằng chứng sau bài tập.
- URL bằng chứng được lưu trong `WorkoutSubmission`; release hiện tại không lưu file nhị phân và không kết nối cổng thanh toán thật.

## Kiểm tra local

```bash
cd frontend
npm run lint
npm run build
```

Backend kiểm tra cú pháp bằng `node --check`; các test cần MongoDB và môi trường process đầy đủ.
