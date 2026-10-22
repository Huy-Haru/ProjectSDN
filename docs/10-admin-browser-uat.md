# Kiểm thử trình duyệt Admin có thể chạy lại

Ngày bổ sung: 23/10/2026. Phạm vi H4 của Huy, nhánh HuyNHHE190724.

## Chạy local

Cần Node.js >=22.12, MongoDB local tại 127.0.0.1:27017 và dependency của cả backend/frontend. Không cần tạo sẵn tài khoản Admin trong fitmanager.

```powershell
cd backend
npm ci
cd ../frontend
npm ci
npx playwright install chromium
npm run test:admin:ui
```

Nếu Windows đã có Microsoft Edge, có thể dùng Edge thay cho tải Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
try { npm run test:admin:ui }
finally { Remove-Item Env:PLAYWRIGHT_CHANNEL }
```

Script tự chọn cổng trống, tạo JWT secret/password ngẫu nhiên trong bộ nhớ, khởi động backend và Vite riêng, tạo database fitmanager_admin_e2e_<random>, chạy UI rồi dừng server/dọn đúng database tạm. Không ghi hoặc xóa dữ liệu fitmanager, không in credentials. Nếu bị kill cưỡng bức hoặc MongoDB mất kết nối lúc cleanup, có thể còn database tạm; xác minh tên trước khi dọn thủ công.

## Các tình huống đã tự động hóa

| Nhóm | Kiểm tra |
| --- | --- |
| Phiên | Đăng nhập Admin thật qua form; tải lại khôi phục phiên; đăng xuất |
| Gói | Tạo gói; reload vẫn còn; tìm chuỗi có dấu ngoặc regex như văn bản; sửa giá; khóa và đối chiếu MongoDB |
| PT/Member | Danh sách từ API; tạo PT qua form và kiểm tra TrainerProfile tồn tại duy nhất |
| Lịch | Hoàn thành booking quá khứ; đối chiếu trạng thái MongoDB |
| Thanh toán | Bấm xác nhận đã thu tiền; kiểm tra paid trong MongoDB |
| Báo cáo | Doanh thu khớp dữ liệu test; API 503 → hiển thị lỗi → thử lại thành công; lọc không có doanh thu |
| Mobile | Viewport 390×844; document không tràn ngang; bảng có vùng cuộn riêng |
| Runtime UI | Không có pageerror JavaScript trong suốt luồng |
| Profile/filter/modal | Admin profile, phản hồi filter cũ không ghi đè, reset/switch bốn modal dùng chung; xem 11-frontend-quality.md |

Ảnh doanh thu desktop/mobile sinh tại frontend/test-results/admin/. Thư mục này bị Git ignore. Không ghi trace/form password vào artifact. Test dùng credential ngẫu nhiên và dữ liệu giả riêng, không dùng tài khoản của người thật.

Đây là bộ regression Admin, không thay thế review của thành viên hoặc UAT toàn bộ module Member/PT. Lỗi permission phía API tiếp tục được kiểm tra bởi backend/scripts/verify-admin.js.

## CI và bằng chứng

Workflow Admin release checks có job admin-browser: MongoDB service, npm ci hai phía, cài Chromium và chạy test:admin:ui; upload PNG sau test. Các job backend và admin-frontend vẫn chạy độc lập.

CI của bản H4 trước đã thành công: [run 39865008393](https://github.com/Huy-Haru/ProjectSDN/actions/runs/39865008393), commit 2092920.

Bản có browser regression đã được xác minh: [run 39865513485](https://github.com/Huy-Haru/ProjectSDN/actions/runs/39865513485), commit 61ea0f2, cả ba job backend/admin-frontend/admin-browser đều success. Bộ UAT đã đạt trên Edge local và Chromium Linux CI; screenshot artifact được tạo bởi job browser.
