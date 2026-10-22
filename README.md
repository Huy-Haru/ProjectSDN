# FitManager — ProjectSDN

Website quản lý phòng tập và huấn luyện viên. Frontend React + Vite; backend Node.js + Express + Mongoose; MongoDB local database fitmanager.

## Tài liệu

Xem [hồ sơ dự án](docs/README.md): báo cáo, SRS, thiết kế hệ thống, thiết kế database, hướng dẫn kiểm thử và tối ưu MongoDB. [Sơ đồ draw.io](docs/diagram/README.md) gồm context, use case cho các role, workflow, ERD và database diagram.

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

## Hiện trạng

Các trang chính Member/PT/Admin dùng MongoDB thật: Auth/profile, danh mục, đăng ký/thanh toán thủ công, đặt/hủy lịch, PT chốt kết quả, giáo án xem/sửa, tiến độ, đánh giá và tổng quan. Role database là member/trainer/admin; trainer là PT. Xem [tạo Admin](docs/08-admin-implementation.md), [bảng đối chiếu kế hoạch](docs/17-mvp-acceptance.md) và [API hiện tại](docs/03-system-design.md).

## Kiểm tra

Backend: npm test; npm run test:integration; npm run test:member; npm run test:booking; npm run test:trainer; npm run test:progress; npm run test:review; npm run test:attendance; npm run test:archive. Các integration suite dùng database tạm riêng. Frontend: npm run lint, npm run build và npm run test:admin:ui (cần MongoDB + Chromium/Edge; xem docs/10). Xem [biên bản xác minh](docs/verification.md) để biết kết quả thực tế và giới hạn.
