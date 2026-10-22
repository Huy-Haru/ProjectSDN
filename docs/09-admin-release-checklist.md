# Hoàn thành phần Huy trong kế hoạch 4 tuần

Ngày đối chiếu: 23/10/2026. Nhánh HuyNHHE190724. Phạm vi: **Huy/Admin**. Không đánh dấu phần Member/PT của nhóm đã nghiệm thu chỉ vì Admin có thể đọc dữ liệu liên quan.

## Đối chiếu H1–H4

| Mã | Kết quả | Kiểm chứng |
| --- | --- | --- |
| H1.1 | API JSON, whitelist, phân trang, mã lỗi, Auth/RBAC chung | unit/HTTP/integration 401/403/400/409 |
| H1.2 | Gói tập thêm/sửa/khóa/tìm/lọc bằng MongoDB thật | integration và browser create/reload |
| H1.3 | Member/PT thêm/sửa/khóa, mở rộng PT, email unique | integration ref/duplicate/role/password; browser |
| H2.1 | Thanh toán paid/paidAt; giữ giá đăng ký; gọi lặp không đổi ngày thu | integration và browser |
| H2.2 | Lịch phân trang/lọc, kiểm tra giờ/trạng thái kết thúc | integration và browser completed |
| H3.1 | Dashboard, doanh thu paidAt theo ngày Việt Nam | integration đối chiếu tiền/ngày và browser |
| H3.2 | Quyền/ID/validation/unique/version, lỗi không trả password | unit/HTTP/integration |
| H4.1 | Test Admin, build, lint Admin, responsive 390px | release gate bên dưới và ảnh evidence/ |
| H4.2 | Tạo Admin, check cấu hình fail-fast, archive/restore BSON/index và CI | check:config/test:archive đã chạy local; CI chờ kết quả GitHub |

Phần code và kiểm chứng local của Huy đã được thực hiện. Review chéo của thành viên, UAT toàn nhóm và triển khai hosting thật vẫn cần nhóm thực hiện; không ghi là đã diễn ra nếu chưa có bằng chứng.

## Release gate

Backend (MongoDB local hoạt động, .env riêng):

```powershell
cd backend
npm ci
npm run check:config
npm test
npm run test:integration
npm run test:archive
```

Frontend:

```powershell
cd frontend
npm ci
npm run lint:admin
npm run build
```

Các script integration/archive dùng database tạm tên ngẫu nhiên, không chèn/xóa dữ liệu fitmanager. `check:config` yêu cầu MONGODB_URI, CORS_ORIGIN, JWT_SECRET bí mật >=32 ký tự; JWT_EXPIRES_IN dạng s/m/h/d, tối đa 7d. Server kiểm tra cấu hình trước khi kết nối database/mở HTTP. Không in secret ra log.

Workflow `.github/workflows/admin-checks.yml` chạy trên push nhánh Huy/main và PR vào main: backend với MongoDB service; frontend lint Admin/build. CI không dùng .env hoặc database thật của máy. Thêm workflow không đồng nghĩa CI remote đã pass; xem kết quả thực trên GitHub sau push.

CI bản H4 commit 2092920 đã đạt: [GitHub Actions 39865008393](https://github.com/Huy-Haru/ProjectSDN/actions/runs/39865008393). Bổ sung job admin-browser và npm run test:admin:ui; xem [hướng dẫn UAT trình duyệt](10-admin-browser-uat.md). Local Edge đã đạt; job browser mới cần xác minh riêng sau push.

## Công cụ sao lưu/khôi phục cho dự án

`database-archive.js` tạo gzip với Extended JSON canonical, giữ document/BSON và index. Định dạng fitmanager-logical-v1. Giới hạn 100.000 document và 64 MiB chưa nén; chỉ collection thường không có option đặc biệt. Không hỗ trợ view/time-series/capped collection, user/role server, oplog hoặc backup online.

**Dừng backend và mọi tiến trình ghi trước khi backup.** Công cụ đọc tuần tự nhiều collection, không tạo snapshot nguyên tử khi còn ghi. Cờ --maintenance là xác nhận của người vận hành, không tự dừng server. Database lớn hoặc production cần Database Tools/snapshot theo topology riêng.

Từ thư mục backend, chọn file mới:

```powershell
New-Item -ItemType Directory -Path backups -Force
npm run db:backup -- backups/fitmanager-before-release.ejson.gz --maintenance
npm run db:restore -- backups/fitmanager-before-release.ejson.gz fitmanager_restore_release_check
```

Backup từ chối file đã có. Đích restore phải là `fitmanager_restore_<tên>`, khác nguồn, chưa tồn tại; không có --drop/overwrite. Nếu lỗi giữa chừng, đích có thể còn dữ liệu một phần/lock: giữ để kiểm tra và dùng tên mới cho lần thử tiếp theo. Không coi restore lỗi là hoàn tất. User MongoDB vận hành cần quyền listDatabases và tạo/ghi/index ở đích.

Archive chứa dữ liệu cá nhân/hash mật khẩu. `.gitignore` chặn backups/ và *.ejson.gz. Lưu ở thư mục riêng được bảo vệ ACL Windows; mode file của Node không thay ACL. Ghi SHA-256 từ output để đối chiếu khi chuyển file. Không gửi backup lên GitHub.

`npm run test:archive` tạo hai database tạm nguồn/đích, so sánh count/index, BSON Date/ObjectId và nested values, thử unique constraint sau restore, từ chối overwrite/đích cũ và xác minh nguồn không đổi. Chỉ dọn hai database tạm do lần chạy tạo.

## Phát hành và rollback

1. Chốt commit đã review, ghi commit trước để rollback code.
2. Dừng tiến trình ghi; backup và restore sang database mới; đối chiếu count/index và mẫu dữ liệu.
3. npm ci cho backend/frontend; đặt .env riêng; chạy check:config.
4. Chạy npm run db:indexes có kiểm soát; dừng nếu lỗi, không xóa collection để chữa dữ liệu.
5. Chạy release gate, tạo frontend/dist bằng npm run build.
6. Backend NODE_ENV=production rồi npm start; dist trên static hosting/reverse proxy. HTTPS/origin do hosting cấu hình; autoIndex production tắt. Chưa có deploy hosting tự động.
7. Kiểm tra health=200, đăng nhập Admin và xem dữ liệu/lịch/báo cáo. Không tạo khoản thu thử trên dữ liệu thật.
8. Nếu lỗi, dừng phát hành, rollback code về commit đã ghi; database cần tương thích hoặc migration đảo riêng. Không restore đè fitmanager nếu chưa có kế hoạch chuyển dữ liệu và kiểm chứng.

## Kết quả và giới hạn nghiệm thu

Các lệnh unit/integration/archive, lint Admin/build được chạy local; số test cuối ghi trong verification.md. Kết quả browser Admin và ảnh ở 08-admin-implementation.md, evidence/.

Lint module khác chưa thuộc release gate Admin; chủ sở hữu phải xử lý trước nghiệm thu toàn hệ thống. Không tắt rule để che lỗi. CI remote, review chéo và hosting thật cần kết quả riêng. Luồng Member/Booking interval/giới hạn buổi toàn hệ thống vẫn do nhóm tích hợp theo kế hoạch, không suy ra hoàn thành từ partial unique index Admin.
