# FitManager backend

Node.js + Express + Mongoose, CommonJS. Có 8 model; chưa có API auth/CRUD nghiệp vụ.

## Chạy

Node.js >= 22.12.0; MongoDB server local. Chạy npm install; copy .env.example sang .env nếu chưa có; npm run dev hoặc npm start.

MONGODB_URI=mongodb://127.0.0.1:27017/fitmanager, PORT=5000, CORS_ORIGIN=http://localhost:3000. .env được đọc từ backend; server mở HTTP sau khi kết nối thành công. MONGO_URI cũ được hỗ trợ nếu không có MONGODB_URI.

GET / trả thông báo chào; GET /api/health ping database và trả 200 hoặc 503. CORS, JSON body 1 MB, error middleware và asyncHandler đã có.

## MongoDB

Models: User, TrainerProfile, MembershipPackage, Subscription, Booking, WorkoutPlan, ProgressLog, Review. Member/PT/Admin dùng chung User; PT mở rộng bằng TrainerProfile.

node scripts/optimize-indexes.js tạo index và chỉ thay legacy booking unique đã xác minh. Không xóa collection/data. Production tắt autoIndex. Xem [thiết kế database](../docs/04-database-design.md) và [tối ưu](../docs/06-mongodb-optimization.md).

npm test chạy unit/HTTP/schema tests. node scripts/verify-database.js kiểm thử tích hợp trên database tạm riêng rồi dọn đúng database tạm đó; không chèn dữ liệu vào fitmanager.
