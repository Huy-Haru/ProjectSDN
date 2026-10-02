# ProjectSDN

Frontend React + Vite và backend Node.js + Express + Mongoose.
Hiện có giao diện mẫu Vite và backend nền; các Schema/API nghiệp vụ sẽ được bổ sung sau.

## Backend

Yêu cầu Node.js 22.12+ và MongoDB local hoặc một MongoDB URI hợp lệ.

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Điền `MONGO_URI`, `PORT` và `CORS_ORIGIN` trong `backend/.env`.
Server chỉ mở cổng sau khi kết nối MongoDB thành công.
Theo `.env.example`, backend chạy tại `http://localhost:5000`.

- `GET /`: thông báo chào.
- `GET /api/health`: trạng thái và ping MongoDB.
- `npm test`: kiểm tra cấu hình, middleware, HTTP và lỗi khởi động.
- `npm start`: chạy server không có chế độ watch.

Xem [hướng dẫn backend](backend/README.md) để biết cấu trúc và cách thêm module.
Không commit `.env`; không dùng các giá trị secret từ tài liệu tham khảo trong source code.

## Frontend

Mở terminal khác:

```powershell
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:3000`; Vite báo lỗi nếu cổng này đang được sử dụng.
`npm run build` tạo bản build; `npm run lint` kiểm tra code.
Khi thêm API service, cấu hình `VITE_API_URL=http://localhost:5000/api` trong `frontend/.env`.
Frontend hiện chưa có luồng API nghiệp vụ.

## Cấu trúc

```text
backend/
  src/
    config/ controllers/ services/ routes/ middlewares/ utils/
    models/ validators/ constants/
    app.js
    server.js
  test/
  .env.example
  package.json
frontend/
  public/
  src/
    assets/ components/ pages/ layouts/ routes/ services/
    hooks/ context/ utils/ constants/
    App.jsx
    main.jsx
  package.json
```
