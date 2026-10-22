# Biên bản xác minh — 11/10/2026

**Full frontend quality 23/10/2026:** đã sửa 39 lỗi lint nền; npm run lint toàn frontend và production build đạt local. Browser UAT bổ sung profile, chống phản hồi lọc cũ ghi đè và reset/switch bốn modal dùng chung đạt. CI frontend được nâng từ lint:admin lên full lint; kết quả CI của phần bổ sung cần xác nhận sau push. Xem [chi tiết](11-frontend-quality.md).

**Browser regression 23/10/2026:** [CI run 39865513485](https://github.com/Huy-Haru/ProjectSDN/actions/runs/39865513485) của commit 61ea0f2 đạt cả backend, admin-frontend và admin-browser. UAT Admin tự động kiểm tra login/reload/logout, tạo/sửa/khóa/tìm gói, tạo PT, lịch/thanh toán/doanh thu, API lỗi/thử lại/empty và viewport 390px. Xem [hướng dẫn chạy lại](10-admin-browser-uat.md).

**Bổ sung H4 ngày 23/10/2026:** 17/17 test backend đạt; check:config, integration Admin và test:archive đạt local. Restore thử giữ BSON Date/ObjectId, nested values, count và index unique/partial; từ chối ghi đè file/đích đã có. Frontend lint:admin và build đạt. CI đã cấu hình; kết quả remote cần xem riêng sau push. Xem [đối chiếu H1–H4](09-admin-release-checklist.md).

**Cập nhật 23/10/2026:** Auth/profile/PT đã tích hợp; phần Admin đã dùng API/MongoDB thật. Backend đạt 16/16 test và verify-admin integration; frontend build/lint các file Admin đã sửa đạt. Trình duyệt đã thử đăng nhập, tạo gói/reload, Member/PT, completed lịch, payment và báo cáo; 390px không tràn ngang trang. Xem [biên bản Admin](08-admin-implementation.md). Bảng phía dưới giữ kết quả mốc 11/10; các dòng “chưa có API auth/CRUD” không còn áp dụng cho Admin.

Nhánh làm việc: HuyNHHE190724. Kết quả được ghi từ lệnh chạy và trình duyệt trên máy local; không phải kết quả triển khai production.

| Kiểm tra | Kết quả | Minh chứng/giới hạn |
| --- | --- | --- |
| Gộp origin/anhnthe194418 | Đã có trong lịch sử | git merge trả Already up to date |
| Gộp origin/hieunhhe187023 | Đã có trong lịch sử | git merge trả Already up to date |
| MongoDB local fitmanager | Kết nối thành công | 127.0.0.1:27017, ping thành công |
| Express health | HTTP 200 | success=true, data.status=ok, data.database=connected |
| Browser → React → Express → MongoDB | Thành công | Edge headless nhận response 200 và UI hiển thị đã kết nối |
| Backend npm test | 15/15 đạt | HTTP/middleware/config và validation model |
| Integration database riêng | Đạt | Hash, unique, hủy/đặt lại, review aggregate, optimistic concurrency, health |
| Migration index fitmanager | Đạt | Tạo index mới và thay duy nhất legacy booking index; không xóa document |
| Frontend npm run build | Đạt | Build sau đồng bộ dependency |
| Lint file frontend đã sửa | Đạt | App.jsx, ConnectionStatus.jsx, services/api.js |
| Lint toàn frontend | Chưa đạt | Lỗi có sẵn: import/biến chưa dùng và setState trong effect của modal |
| 11 file draw.io | XML/ref hợp lệ | Context DFD, UML use case, 4 workflow swimlane, ERD/database liên kết; PNG/SVG xem nhanh |
| Kế hoạch 4 tuần | Đã kiểm tra phân bổ | Huy–Admin, Hiếu–Member, Anh–PT/Auth; 26 SP/người, 78 SP/nhóm |
| API nghiệp vụ/UAT đầy đủ | Chưa thực hiện | API auth/CRUD/RBAC chưa được triển khai |

## Response thực nhận

```json
{
  "success": true,
  "message": "Success",
  "data": { "status": "ok", "database": "connected" }
}
```

## Minh chứng giao diện

![React kiểm tra API và MongoDB thành công](connection-verification.png)

Backend và Vite dùng trong kiểm thử trình duyệt là tiến trình tạm và được dừng sau kiểm tra. Chạy `npm run dev` ở hai thư mục để sử dụng ứng dụng tiếp.

8 collection nghiệp vụ: users, trainerprofiles, membershippackages, subscriptions, bookings, workoutplans, progresslogs, reviews. Collection user cũ rỗng được giữ nguyên. Không seed dữ liệu nghiệp vụ vào fitmanager. Dữ liệu kiểm thử được ghi vào database tên ngẫu nhiên fitmanager_verification_... và dọn đúng database đó.

Index và validation là cải thiện nền dữ liệu, chưa chứng minh hiệu năng tải thực và chưa giải quyết mọi khoảng giờ chồng nhau. React nghiệp vụ vẫn dùng dữ liệu mẫu; ảnh kết nối không phải bằng chứng CRUD đã hoạt động.

## PT và giáo án — 2026-10-23

- Lịch PT lọc ngày theo UTC midnight đúng quy ước Booking; từ chối ngày không tồn tại và trạng thái sai.
- Cập nhật giáo án dùng document save để kiểm tra cặp ngày và optimistic concurrency; chỉ PT sở hữu được sửa.
- Member nhận thông tin PT qua nested populate, giữ trường trainerUser tương thích giao diện.
- `npm run test:trainer` (backend): PASS trên MongoDB local, database tạm riêng tự xóa; kiểm tra phân quyền, ngày, sửa một trường, chống đổi chủ và thông tin PT. CI chạy bổ sung suite này.
- Đây là bước sửa API PT; các màn Member còn dùng dữ liệu mẫu cần được nối API ở các bước tiếp theo.

## Đăng ký gói Member — 2026-10-23

- Danh mục công khai chỉ trả gói đang hoạt động: GET /api/member/packages.
- Member xem riêng lịch sử đăng ký: GET /api/member/subscriptions; gửi đăng ký qua POST cùng đường dẫn với packageId và startDate (YYYY-MM-DD, không trước hôm nay theo giờ Việt Nam).
- Backend lấy giá và thời hạn từ MongoDB, cố định amount trên đăng ký; không nhận chủ sở hữu, trạng thái hoặc xác nhận thanh toán từ client. Ngày hết hạn là mốc kết thúc sau durationDays ngày tính từ 00:00 giờ Việt Nam.
- Giao diện Gói tập và Gói tập của tôi dùng API thật, có tải dữ liệu, lỗi/thử lại, danh sách trống, xác nhận trước khi gửi và khóa nút khi gửi. Loại bỏ luồng đăng ký gói giả khỏi App.
- PASS: npm run test:member (MongoDB tạm riêng), frontend lint/build, kiểm thử Edge đăng ký và tải lại trang cùng các luồng Admin/PT hiện có.
- Chưa hỗ trợ thanh toán online. Thành viên thanh toán tại quầy, Admin xác nhận trên màn hiện có. Các màn đặt lịch, tiến độ và đánh giá Member vẫn cần nối API.

## Đặt lịch PT Member — 2026-10-23

- Hoàn thiện API và giao diện đặt lịch/lịch tập Member với MongoDB, thay dữ liệu mẫu ở hai màn này.
- PASS: test:booking (cả cạnh tranh quota và ca PT), test:member, test:integration, backend 17/17, frontend lint/build, Edge UAT đặt/hủy và các luồng cũ.
- Bổ sung đối soát hạn mức với chế độ mặc định chỉ đọc và cờ xác nhận dừng writers trước khi áp dụng.
- Quy tắc, API, giới hạn transaction trên MongoDB standalone và cách khôi phục: [12-member-booking.md](12-member-booking.md).
- Các màn tổng quan, danh sách PT riêng, tiến độ và đánh giá vẫn còn phần dữ liệu mẫu cần nối tiếp.

## Tiến độ và giáo án — 2026-10-23

- PT ghi nhận chỉ số/nhận xét cho học viên có quan hệ lịch tập hợp lệ; Member xem lịch sử riêng và giáo án thật.
- Không nhận chủ sở hữu và số buổi hoàn thành từ client. Kiểm tra ngày Việt Nam, số liệu và quan hệ tài khoản.
- Form tạo giáo án được khởi tạo lại khi mở mới; tránh lưu bản nháp/trạng thái thành công cũ.
- PASS: test:progress, test:trainer, backend 17/17, frontend lint/build, Edge UAT PT ghi tiến độ/giao giáo án → Member xem dữ liệu thật cùng các luồng cũ.
- Chi tiết: [13-progress-workout-plans.md](13-progress-workout-plans.md).

## Đánh giá PT và tổng quan — 2026-10-23

- API đánh giá chỉ nhận buổi hoàn thành đã kết thúc của Member hiện tại, một đánh giá/buổi bằng unique index; PT xem phản hồi riêng.
- Danh sách PT thật với tổng điểm tổng hợp từ Review và chọn sẵn PT khi mở đặt lịch.
- Tổng quan Member/PT dùng API; loại bỏ import mockData/useSchedule/useProgress khỏi App và các trang chính.
- PASS: test:review, test:booking, test:progress, backend 17/17, frontend lint/build, Edge UAT tổng quan → đánh giá → tải lại → PT xem phản hồi, cùng luồng cũ.
- Chi tiết: [14-reviews-live-dashboards.md](14-reviews-live-dashboards.md).

## PT xác nhận buổi tập — 2026-10-23

- Bổ sung endpoint riêng cho PT chốt completed/no_show sau giờ kết thúc của lịch mình; dùng chung quy tắc trạng thái với Admin.
- Giao diện lịch PT có bước xác nhận tên học viên, ngày và giờ; thông báo lỗi/thành công và khóa thao tác khi gửi.
- PASS: test:attendance, test:integration, test:booking, backend 17/17, frontend lint/build, Edge UAT PT xác nhận → Member đánh giá và dữ liệu tiến độ.
- Chi tiết: [15-trainer-attendance.md](15-trainer-attendance.md).

## Quản lý giáo án PT — 2026-10-23

- Bổ sung xem/sửa giáo án theo học viên, bài tập, thời hạn, trạng thái và bỏ bản nháp.
- Giao diện gửi expectedVersion để chống ghi đè bản cũ; backend kiểm tra phiên bản và optimistic concurrency.
- Chặn tạo/sửa khi TrainerProfile khóa; trả lỗi 400 với title/goal sai kiểu khi tạo.
- PASS: test:trainer (gồm hai yêu cầu cạnh tranh), frontend lint/build và Edge UAT PT sửa → Member xem nội dung mới, cùng các luồng cũ.
- Chi tiết: [16-trainer-plan-management.md](16-trainer-plan-management.md).

## Đối chiếu kế hoạch, API và sơ đồ — 23/10/2026

- CI bản code 81b848c: backend, admin-frontend và admin-browser đều success tại GitHub Actions run 39872068984.
- Cập nhật báo cáo/SRS/thiết kế API/database theo bản triển khai; đủ 42 route nghiệp vụ Auth/Profile/Member/PT/Admin được đối chiếu và 50 link nội bộ không hỏng ở thời điểm kiểm tra.
- Sơ đồ draw.io/SVG/PNG cập nhật snapshot quyền lợi, quota, chính sách no_show, hủy và quyền Guest; 11 XML hợp lệ, source/target tồn tại; ERD/database nối đủ 8 entity/13 quan hệ. Đã xem ảnh database và swimlane đặt lịch sau render.
- Bảng tiến độ kỹ thuật, demo và hạn chế cần nghiệm thu: [17-mvp-acceptance.md](17-mvp-acceptance.md). Không ghi nhận review nhóm, NFR tải/mobile toàn hệ thống hoặc hosting là đã hoàn tất.

## Chống gửi trùng ProgressLog — 23/10/2026

- Unique partial index theo PT/Member/requestId, hash nội dung chuẩn hóa, replay cùng _id và 409 nếu cùng mã đổi nội dung. Client cũ không gửi mã vẫn hoạt động theo cơ chế append.
- Form giữ mã khi gửi lại cùng nội dung trong phiên mở, tạo mã mới sau thành công; có chặn gửi đồng thời ngay trong handler.
- PASS: test:progress, backend 17/17, test:archive, frontend lint/build và Edge UAT mô phỏng server lưu xong nhưng phản hồi lỗi, retry vẫn chỉ một document.
- Database diagram/từ điển đã bổ sung metadata; giới hạn không lưu bản nháp qua reload nêu tại [18-progress-idempotency.md](18-progress-idempotency.md).

## Mobile Member/PT — 23/10/2026

- Dùng chung bố cục mobile cho ba role; không ép nội dung Member/PT bằng sidebar desktop. Bảng lịch cuộn riêng, nút học viên xuống dòng và profile/header không tràn.
- Chỉnh tương phản chữ phụ trên nền tối, input mobile 16px, nút tối thiểu 44px và menu có aria-current/focus.
- PASS: Edge browser UAT 14 màn Member/PT ở 375×812, kiểm tra document/main/page-body không tràn, menu không ép hẹp, màu chữ/vùng bấm và Tab trong form giáo án; các luồng cũ và Admin 390px vẫn đạt. Frontend lint/build đạt.
- Minh chứng ảnh và giới hạn nghiệm thu thiết bị thật: [19-member-trainer-mobile.md](19-member-trainer-mobile.md).

## Phân trang học viên PT — 23/10/2026

- API /trainer/members có page/limit/search, whitelist response và metadata total/pages; giới hạn tối đa 100. Aggregation thay truy vấn thống kê từng User.
- UI có tìm kiếm backend và trước/sau; dashboard lấy total, không lấy độ dài trang đầu. Validation pagination dùng chung PT/Admin, từ chối mảng và offset không an toàn.
- PASS: test:trainer với 13 học viên, test:integration, backend 17/17, frontend lint/build; Edge UAT hai trang, tìm kiếm/empty/reset, tổng dashboard và mobile/luồng cũ.
- Hợp đồng và giới hạn: [20-trainer-members-pagination.md](20-trainer-members-pagination.md).
