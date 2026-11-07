# FitManager — ProjectSDN

Website quản lý phòng tập và huấn luyện viên. Frontend React + Vite; backend Node.js + Express + Mongoose; MongoDB local database fitmanager.

## Tài liệu

Xem [hồ sơ dự án](docs/README.md): báo cáo, SRS, thiết kế hệ thống, thiết kế database, hướng dẫn kiểm thử và tối ưu MongoDB. [Sơ đồ draw.io](docs/diagram/README.md) gồm context, use case cho các role, workflow, ERD và database diagram.

Bộ token giao diện, typography, trạng thái, bảng và quy tắc dark/light nằm ở [FitManager Design System](docs/fitmanager-design-system.md).

Tài liệu theo cấu trúc template: [SRS](docs/srs-fitmanager.md), [SDS](docs/sds-fitmanager.md). Slide nhóm: [FitManager-3-member-presentation.pptx](docs/FitManager-3-member-presentation.pptx).

## Chạy local

Yêu cầu Node.js >= 22.12.0 và MongoDB server tại 127.0.0.1:27017.

Terminal backend:

```powershell
cd backend
npm ci
# Khi chưa có .env:
Copy-Item .env.example .env
npm run dev
```

Terminal frontend:

```powershell
cd frontend
npm install
# Khi chưa có .env:
Copy-Item .env.example .env
npm run dev
```

Trước khi chạy backend, cấu hình JWT_SECRET riêng tối thiểu 32 ký tự trong backend/.env (xem gợi ý tạo secret trong .env.example), rồi chạy npm run check:config. Không dùng secret mẫu hoặc commit secret.

Backend: http://localhost:5000. Frontend: http://localhost:3000. Database: mongodb://127.0.0.1:27017/fitmanager. Backend dùng MONGODB_URI (hỗ trợ MONGO_URI cũ), CORS_ORIGIN=http://localhost:3000. Frontend dùng VITE_API_URL=http://localhost:5000/api. Không commit .env.

### Dữ liệu demo và tài khoản kiểm thử

Chạy sau khi MongoDB và `backend/.env` đã sẵn sàng:

```powershell
cd backend
npm run db:seed:demo
```

Lệnh tạo 1 admin, 10 huấn luyện viên, 100 hội viên, 7 gói tập, subscription, lịch PT, giáo án, tiến độ, đánh giá và bằng chứng luyện tập. Script có thể chạy lại; các bản ghi demo cũ được thay thế.

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@fitmanager.test` | `FitManager123!` |
| Trainer 1 | `trainer01@fitmanager.test` | `FitManager123!` |
| Trainer 2 | `trainer02@fitmanager.test` | `FitManager123!` |
| Member 1 | `member001@fitmanager.test` | `FitManager123!` |
| Member 2 | `member002@fitmanager.test` | `FitManager123!` |
| Member 3 | `member003@fitmanager.test` | `FitManager123!` |

## Hiện trạng

Các trang chính Member/PT/Admin dùng MongoDB thật: Auth/profile, danh mục, đăng ký/thanh toán thủ công, đặt/hủy lịch, PT chốt kết quả, giáo án xem/sửa, tiến độ, đánh giá và tổng quan. Role database là member/trainer/admin; trainer là PT. Xem [tạo Admin](docs/08-admin-implementation.md), [bảng đối chiếu kế hoạch](docs/17-mvp-acceptance.md) và [API hiện tại](docs/03-system-design.md).

## Kiểm tra

Backend: npm test; npm run test:integration; npm run test:member; npm run test:booking; npm run test:trainer; npm run test:progress; npm run test:review; npm run test:attendance; npm run test:archive. Các integration suite dùng database tạm riêng. Frontend: npm run lint, npm run build và npm run test:admin:ui (cần MongoDB + Chromium/Edge; xem docs/10). Xem [biên bản xác minh](docs/verification.md) để biết kết quả thực tế và giới hạn.
