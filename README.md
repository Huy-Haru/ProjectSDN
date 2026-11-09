# FitManager — ProjectSDN

Website quản lý phòng tập và huấn luyện viên cho một cơ sở gym.

- Frontend: React 19 + Vite
- Backend: Node.js + Express MVC
- Database: MongoDB + Mongoose
- Authentication: JWT bearer + bcrypt
- Roles: Member, Trainer/PT, Admin

## Cấu trúc repository

```text
ProjectSDN/
├─ backend/
│  ├─ src/
│  │  ├─ config/          # environment, database, runtime
│  │  ├─ constants/       # role và status constants
│  │  ├─ controllers/     # điều phối request
│  │  ├─ middlewares/     # authenticate, authorize, error handler
│  │  ├─ models/          # Mongoose schemas và indexes
│  │  ├─ routes/          # auth, member, trainer, admin, booking
│  │  ├─ services/        # nghiệp vụ domain và quota
│  │  ├─ scripts/         # seed và maintenance scripts
│  │  └─ utils/           # response, JWT, pagination, archive
│  ├─ scripts/            # verify, seed, backup, migration
│  └─ test/               # test runtime, model và security
├─ frontend/
│  ├─ src/
│  │  ├─ api/             # API clients dùng chung
│  │  ├─ auth/            # login/register
│  │  ├─ components/      # UI và admin components
│  │  ├─ hooks/           # auth và resource hooks
│  │  ├─ pages/           # page implementations
│  │  ├─ public/           # public pages
│  │  ├─ roles/           # export pages theo role
│  │  ├─ services/        # health/API compatibility helpers
│  │  └─ shared/           # layout, navigation, theme
│  └─ scripts/            # browser UAT helpers
├─ docs/
│  ├─ FitManager-SRS.docx # SRS có diagram nhúng theo thứ tự mẫu
│  ├─ FitManager-SDS.docx # SDS có diagram nhúng theo thứ tự mẫu
│  ├─ diagram/            # drawio, SVG và PNG
│  └─ *.md                # thiết kế, API, database, kiểm thử
└─ README.md
```

## Chức năng chính

- Guest xem trang giới thiệu và package đang hoạt động.
- Member đăng ký package, xem trạng thái gói, đặt/hủy lịch PT, xem giáo án/tiến độ, gửi proof URL và review.
- Trainer xem lịch dạy, học viên liên quan, quản lý workout plan/progress, chốt kết quả và xem proof/review.
- Admin quản lý package, tài khoản, trainer, lịch, xác nhận thanh toán thủ công và doanh thu.
- Mock check-in trả payload cục bộ; chưa có QR scan thật hoặc payment gateway.

## Tài liệu và diagram

- [SRS FitManager](docs/FitManager-SRS.docx)
- [SDS FitManager](docs/FitManager-SDS.docx)
- [SRS Markdown](docs/02-srs.md)
- [SDS Markdown](docs/sds-fitmanager.md)
- [Thiết kế hệ thống và API](docs/03-system-design.md)
- [Thiết kế database](docs/04-database-design.md)
- [Danh mục diagram](docs/diagram/README.md)
- [Design system](docs/fitmanager-design-system.md)

Thứ tự diagram trong tài liệu:

- SRS: Context → Screen flow → ERD → Use case → Workflow → yêu cầu/use case chi tiết.
- SDS: Package → Database schema/ERD → Architecture → UI → module/class/sequence/query theo nghiệp vụ.

File `.drawio` là nguồn chỉnh sửa; `.svg` dùng để phóng to; `.png` được nhúng trực tiếp trong DOCX.

## Chạy local

Yêu cầu Node.js `>=22.12.0` và MongoDB tại `127.0.0.1:27017`.

### Backend

```powershell
cd backend
npm ci
Copy-Item .env.example .env
# đặt JWT_SECRET tối thiểu 32 ký tự trong backend/.env
npm run check:config
npm run dev
```

Backend chạy tại `http://localhost:5000`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend chạy tại `http://localhost:3000` và dùng `VITE_API_URL=http://localhost:5000/api`.

## Dữ liệu demo

Sau khi MongoDB và `backend/.env` sẵn sàng:

```powershell
cd backend
npm run db:seed:demo
```

Seed tạo dữ liệu demo cho Admin, Trainer, Member, package, subscription, booking, workout plan, progress, review và workout submission. Không dùng tài khoản demo trong môi trường production.

## Kiểm tra

```powershell
# frontend
cd frontend
npm run lint
npm run build

# backend
cd ../backend
npm test
```

Sinh lại diagram:

```powershell
node docs/diagram/generate.cjs
```

Các kiểm thử tích hợp cần MongoDB riêng; UAT trình duyệt cần Chromium/Edge. Payment gateway, QR scan thật, realtime, binary upload và JWT denylist chưa nằm trong MVP.
