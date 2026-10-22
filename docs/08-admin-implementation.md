# Phần Admin — HuyNHHE190724

Ngày cập nhật: 23/10/2026. Nhánh: HuyNHHE190724. Auth/profile/PT được tích hợp từ origin/anhnthe194418; phần Admin dùng middleware authenticate/authorize của nhóm.

## Chức năng đã triển khai

| Kế hoạch | Kết quả |
| --- | --- |
| H1.1 | API JSON success/message/data; phân trang page/limit <= 100; role lấy từ User database |
| H1.2 | Gói: danh sách/tìm/lọc trạng thái, thêm/sửa/khóa; lưu MongoDB, không xóa lịch sử |
| H1.3 | Member/PT: danh sách/tìm/lọc/thêm/sửa/khóa; PT có TrainerProfile unique; public body không đổi role/password của tài khoản có sẵn |
| H2.1 | Màn hình thanh toán, xác nhận pending/unpaid thành paid/active; lưu paidAt, amount giữ giá đăng ký; gọi lại giữ nguyên paidAt |
| H2.2 | Lịch: phân trang, lọc ngày/trạng thái; completed/no_show sau kết thúc, cancelled trước bắt đầu; không chuyển ngược trạng thái cuối |
| H3.1 | Dashboard số liệu thật; doanh thu paid theo paidAt, nhóm ngày Việt Nam, từ/đến ngày bao gồm trọn ngày |
| H3.2 | Whitelist input, kiểm tra ID/trạng thái/ref liên quan; validation=400, duplicate/version conflict=409; không trả password |
| H4.1 | Unit/HTTP test, integration database tạm và kiểm tra trình duyệt; build và lint file Admin |
| H4.2 | Script tạo Admin và hướng dẫn vận hành/backup bên dưới; backup/restore vận hành cần MongoDB Database Tools và kiểm chứng riêng |

## Endpoint

Tất cả `/api/admin/*` yêu cầu Bearer token hợp lệ và User.role=admin đang active. Thay role trong client/token claim không thay thế role trong database.

| Method | Path dưới /api/admin | Input chính |
| --- | --- | --- |
| GET | /dashboard | — |
| GET/POST | /packages | query page/limit/search/isActive; body name,description,durationDays,price,sessionLimit,includesPT,isActive |
| PATCH | /packages/:id | Các trường gói whitelist |
| GET/POST | /users | query role=member/trainer,page,limit,search,isActive; create fullName,email,password,role,phone; trainerProfile khi PT |
| GET/PATCH | /users/:id | Chi tiết hoặc cập nhật profile chung; PT mở rộng trainerProfile |
| GET | /bookings | page,limit,status,from,to,member,trainer |
| PATCH | /bookings/:id/status | status=completed/cancelled/no_show |
| GET | /subscriptions | page,limit,paymentStatus,member |
| POST | /subscriptions/:id/confirm-payment | Không cần amount/paidAt từ client |
| GET | /reports/revenue | from/to dạng YYYY-MM-DD |

List trả data={items,total,page,limit,pages}. Ref được populate với trường an toàn để hiển thị. Gói paid thiếu paidAt không đưa vào tổng, có cảnh báo missingPaidAt để đối soát. Report không đại diện hoàn tiền/lợi nhuận vì chưa có nghiệp vụ đó.

## Chạy local và tài khoản Admin

Backend: npm install, cấu hình .env từ .env.example, npm run dev. Frontend: npm install, npm run dev. MongoDB local fitmanager cần hoạt động. JWT_SECRET phải là chuỗi bí mật ngẫu nhiên >=32 ký tự; có thể tạo bằng `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`, rồi lưu trực tiếp trong .env. Không commit secret.

Tạo tài khoản Admin qua terminal backend; chọn email/password riêng, không dùng thông tin mẫu công khai trong môi trường triển khai:

```powershell
$env:ADMIN_EMAIL = Read-Host 'Email Admin'
$env:ADMIN_NAME = Read-Host 'Ho ten'
$adminSecure = Read-Host 'Mat khau it nhat 8 ky tu' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecure).Password
try { node scripts/create-admin.js }
finally { Remove-Item Env:ADMIN_PASSWORD, Env:ADMIN_EMAIL, Env:ADMIN_NAME }
```

Script không thay đổi tài khoản có email tồn tại. Sau đó đăng nhập bằng email/password vừa tạo. Không có nút chuyển role demo. Không tự tạo tài khoản/mật khẩu Admin cố định trong database thật.

## Kiểm tra

```powershell
cd backend
npm test
node scripts/verify-admin.js
cd ../frontend
npm run build
npx eslint src/components/admin src/api/adminApi.js src/pages/Admin*.jsx src/App.jsx src/components/Sidebar.jsx src/components/ConnectionStatus.jsx
```

verify-admin dùng database fitmanager_admin_test_<random> và chỉ dọn đúng database tạm đó. Kiểm tra 401/403, role lấy từ DB, khóa tài khoản, duplicate email, profile/password whitelist, tạo PT lỗi không để lại User, tìm ký tự regex như văn bản, payment idempotent, báo cáo ngày Việt Nam, lịch kết thúc/future, phân trang và giữ lịch sử.

Trình duyệt đã thử đăng nhập thật, tạo gói và reload vẫn có dữ liệu, danh sách Member/PT, completed lịch quá khứ, xác nhận thanh toán và doanh thu từ MongoDB tạm. Đã kiểm tra empty state và màn hình 390px không tràn ngang document. Ảnh minh chứng nằm trong evidence/. Dữ liệu thử không chèn vào fitmanager thật.

Kết quả ngày 23/10/2026: 16/16 unit/HTTP/model test đạt; verify-admin integration đạt; frontend production build đạt; ESLint toàn bộ file Admin và file kết nối/layout đã sửa đạt. Không suy ra toàn bộ frontend của các module khác đã hết lỗi lint.

## Phát hành và khôi phục

Chạy production với NODE_ENV=production, JWT_SECRET riêng và CORS_ORIGIN đúng frontend; HTTPS do reverse proxy/hosting cấu hình. Chạy script optimize-indexes có kiểm soát trước phát hành, npm run build để tạo frontend/dist. Backend không cung cấp frontend static; cấu hình hosting frontend riêng. Không dùng autoIndex production để thay migration.

Trước migration, cài MongoDB Database Tools và sao lưu local bằng mongodump --db fitmanager --archive=<đường-dẫn-riêng> --gzip. Thử phục hồi sang database **fitmanager_restore_check** bằng mongorestore --archive=<đường-dẫn> --gzip --nsFrom='fitmanager.*' --nsTo='fitmanager_restore_check.*', đối chiếu collection/count/index trước khi sử dụng backup. Không restore đè fitmanager hoặc dùng --drop khi chưa có kế hoạch khôi phục. File backup chứa dữ liệu cá nhân/hash: lưu ngoài Git và giới hạn quyền. Máy hiện chưa có mongodump/mongorestore trong PATH nên chưa ghi nhận backup/restore vận hành đã đạt.

Rollback code bằng bản release trước; database phải giữ tương thích hoặc dùng migration rollback riêng. Không xóa collection để chữa lỗi schema.

## Phạm vi còn phụ thuộc nhóm

Admin đọc Subscription/Booking thật nhưng không tạo thay luồng đăng ký gói/đặt lịch của Member. Không triển khai thay phần việc đó của Hiếu. PT/Profile dùng bản tích hợp từ Anh; JWT hiện stateless nên đăng xuất xóa token phía client, chưa có thu hồi token tập trung. Unique Booking chỉ chặn cùng giờ bắt đầu; service chống chồng interval/hạn mức toàn hệ thống vẫn thuộc phần lịch của nhóm. completed cập nhật Booking; số buổi báo cáo nên tính từ Booking, không tự cộng ProgressLog.attendedSessions để tránh tính lặp.

User và TrainerProfile cập nhật hai document trên MongoDB standalone không có transaction nhiều document. Tạo mới có validate trước/compensating delete khi profile insert thất bại; nếu cần nguyên tử tuyệt đối khi chỉnh cả hai phải triển khai replica set + transaction. Không gọi đây là bảo đảm transaction.
