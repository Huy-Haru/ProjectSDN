# ProjectSDN backend

Backend nền dựa trên ZIP tham khảo, dùng CommonJS, Express 4 và Mongoose 8.
Chưa có Schema, authentication hoặc API nghiệp vụ; thêm vào các thư mục tương ứng khi phát triển module.

## Chạy local

Yêu cầu Node.js 22.12+ và MongoDB đang chạy.

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Sửa `.env` trước khi chạy nếu MongoDB hoặc frontend dùng địa chỉ khác.
Backend đọc `.env` từ thư mục `backend`, kết nối MongoDB thành công rồi mới mở HTTP server.
Giữ tên biến `MONGO_URI` từ ZIP tham khảo. Không commit `.env`.
`CORS_ORIGIN` là origin của frontend, mặc định trong mẫu là `http://localhost:3000`.
Sau này frontend có thể dùng `VITE_API_URL=http://localhost:5000/api` trong `.env` riêng.

```powershell
npm start
npm test
```

`npm start` chạy bình thường; `npm run dev` dùng nodemon, tự khởi động lại khi sửa file JS/JSON trong `src` hoặc file `.env`.
Kiểm thử tự động không yêu cầu MongoDB và dùng cổng HTTP tạm thời.

## API nền

- `GET /`: thông báo chào, không yêu cầu MongoDB.
- `GET /api/health`: kiểm tra kết nối và ping MongoDB; trả `200` hoặc `503`.
- Route không tồn tại trả `404`; JSON sai trả `400`; body quá 1 MB trả `413`.

Thành công: `{ "success": true, "message": "Success", "data": {} }`.
Lỗi: `{ "success": false, "message": "Error message" }`.

## Cấu trúc

```text
src/
  config/          # Environment và kết nối MongoDB
  controllers/     # Nhận request, gọi service, trả response
  services/        # Logic nghiệp vụ / health check
  routes/          # Endpoint API
  middlewares/     # Xử lý lỗi và route không tồn tại
  utils/           # AppError, asyncHandler, response
  models/          # Chờ Schema nghiệp vụ
  validators/      # Chờ validation của module
  constants/       # Chờ hằng số dùng chung
  app.js           # Cấu hình Express
  server.js        # Khởi động database và HTTP, đóng kết nối khi dừng
```

Luồng module: Route → Middleware/Validator → Controller → Service → Model → MongoDB.
ZIP chưa có Model nên backend không tự tạo Schema nghiệp vụ.
Các thư mục rỗng dùng `.gitkeep`; bỏ tệp đó khi thư mục đã có code.

Tham khảo: [Express error handling](https://expressjs.com/en/guide/error-handling/),
[Mongoose connections](https://mongoosejs.com/docs/connections.html).
