# FitManager documentation

Website quản lý phòng tập và huấn luyện viên cho một cơ sở gym. Frontend dùng React/Vite, backend dùng Express MVC, Mongoose và MongoDB.

## Tài liệu bàn giao

- [FitManager-SRS.docx](FitManager-SRS.docx): tài liệu SRS theo bố cục mẫu, có diagram nhúng trực tiếp theo thứ tự Context → Screen flow → ERD → Use case → Workflow.
- [FitManager-SDS.docx](FitManager-SDS.docx): tài liệu SDS theo bố cục mẫu, có diagram nhúng theo thứ tự Package → Database/ERD → Architecture → UI → thiết kế module.
- [02-srs.md](02-srs.md): SRS chi tiết dạng Markdown.
- [sds-fitmanager.md](sds-fitmanager.md): SDS tóm tắt dạng Markdown.
- [03-system-design.md](03-system-design.md): architecture, API và quy tắc cạnh tranh.
- [04-database-design.md](04-database-design.md): data dictionary, cardinality và index.
- [diagram/README.md](diagram/README.md): nguồn draw.io, SVG và PNG của toàn bộ sơ đồ.
- [verification.md](verification.md): các kiểm tra đã chạy và giới hạn môi trường.

## Diagram

Nguồn chỉnh sửa nằm trong `docs/diagram/*.drawio`. Bản SVG dùng để phóng to khi báo cáo; bản PNG được nhúng trong SRS/SDS. Diagram dùng phong cách đơn sắc học thuật giống tài liệu mẫu.

Danh mục gồm context, architecture, screen flow, use case Guest/Member/Trainer/Admin, workflow subscription/booking/training/cancellation, ERD và database schema.

## Nghiệp vụ chính

- Admin quản lý package, trainer, member, booking, thanh toán xác nhận thủ công và doanh thu.
- Trainer quản lý lịch dạy, học viên liên quan, workout plan, progress, kết quả và review.
- Member đăng ký package, đặt/hủy lịch PT, xem giáo án/tiến độ, gửi proof URL và review.
- QR check-in chỉ là payload mô phỏng hiển thị cục bộ; không kết nối payment gateway hoặc QR service bên ngoài.

## Kiểm tra local

```powershell
cd frontend
npm run lint
npm run build

cd ../backend
npm test
```

Các integration/UAT cần MongoDB và trình duyệt Chromium/Edge. Xem [README.md](../README.md) để biết cấu trúc và lệnh chạy đầy đủ.
