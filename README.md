# FitManager — ProjectSDN

Website quản lý phòng tập và huấn luyện viên. Frontend React + Vite; backend Node.js + Express + Mongoose; MongoDB local database fitmanager.

## Tài liệu

Xem [hồ sơ dự án](docs/README.md): báo cáo, SRS, thiết kế hệ thống, thiết kế database, hướng dẫn kiểm thử và tối ưu MongoDB. [Sơ đồ draw.io](docs/diagram/README.md) gồm context, use case cho các role, workflow, ERD và database diagram.

## Chạy local

Yêu cầu Node.js >= 22.12.0 và MongoDB server tại 127.0.0.1:27017.

Terminal backend:

```powershell
cd backend
npm install
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

Backend: http://localhost:5000. Frontend: http://localhost:3000. Database: mongodb://127.0.0.1:27017/fitmanager. Backend dùng MONGODB_URI (hỗ trợ MONGO_URI cũ), CORS_ORIGIN=http://localhost:3000. Frontend dùng VITE_API_URL=http://localhost:5000/api. Không commit .env.

## Hiện trạng

Có giao diện ba vai trò Member/PT/Admin và 8 Mongoose model. React kiểm tra kết nối qua GET /api/health. Các màn hình nghiệp vụ vẫn dùng dữ liệu mẫu; API auth/CRUD/phân quyền chưa có. Role lưu trong database: member/trainer/admin; trainer là PT.

## Kiểm tra

Backend: npm test; node scripts/verify-database.js (database tạm); node scripts/optimize-indexes.js (áp dụng index có phạm vi). Frontend: npm run build, npm run lint. Xem [biên bản xác minh](docs/verification.md) để biết kết quả thực tế và giới hạn.
