# Báo cáo dự án: Website quản lý phòng tập và huấn luyện viên

## 1. Thông tin dự án

Tên hệ thống: **FitManager**. Học phần: SDN302. Người chuẩn bị hồ sơ: HuyNHHE190724. Các nhánh nguồn: anhnthe194418 và hieunhhe187023. Nhóm đã chốt Huy–Admin, Hiếu–Member, Anh–PT/Auth. Họ tên đầy đủ, giảng viên và lớp cần bổ sung theo thông tin của nhóm; không suy ra từ tên nhánh.

## 2. Bối cảnh và vấn đề

Phòng tập cần quản lý hội viên, gói tập, huấn luyện viên cá nhân (PT), lịch hẹn và tiến độ tập luyện. Khi sử dụng bảng tính hoặc trao đổi rời rạc, thông tin dễ thiếu nhất quán, lịch có thể bị trùng và việc tổng hợp doanh thu tốn thời gian. Đây là mô tả bài toán thiết kế; nhóm chưa cung cấp dữ liệu khảo sát thực tế hoặc số liệu đo lường.

FitManager tập trung các quy trình vào một website. Hội viên tra cứu dịch vụ và theo dõi quá trình tập; huấn luyện viên quản lý lịch và giáo án; quản trị viên quản lý dữ liệu vận hành và báo cáo.

## 3. Mục tiêu

1. Cung cấp giao diện phù hợp với từng vai trò.
2. Chuẩn hóa quản lý hội viên, PT, gói tập và đăng ký gói.
3. Hỗ trợ đặt lịch có kiểm tra hiệu lực gói và xung đột thời gian.
4. Theo dõi giáo án, chỉ số cơ thể và đánh giá PT.
5. Tổng hợp doanh thu từ các đăng ký gói đã được xác nhận thanh toán.
6. Lưu trữ dữ liệu bằng MongoDB và xử lý nghiệp vụ tại backend.

## 4. Phạm vi sản phẩm

| Nhóm | Chức năng mục tiêu |
| --- | --- |
| Khách | Xem gói tập, xem PT, đăng ký tài khoản, đăng nhập |
| Hội viên | Đăng ký gói, xem gói hiện có, đặt/hủy lịch, xem giáo án và tiến độ, đánh giá PT |
| PT | Xem lịch và hội viên liên quan, tạo giáo án, cập nhật tiến độ, xác nhận hoàn thành buổi tập |
| Quản trị viên | Quản lý hội viên, PT, gói tập, lịch, xác nhận thanh toán và báo cáo doanh thu |

Ngoài phạm vi phiên bản đầu: cổng thanh toán trực tuyến, quản lý nhiều chi nhánh, thiết bị phòng tập, chấm công sinh trắc học, ứng dụng di động, tích hợp thiết bị đeo. Việc đánh dấu `paid` là xác nhận thủ công theo thiết kế; không tương đương tích hợp thanh toán ngân hàng.

## 5. Công nghệ và tổ chức mã nguồn

Frontend dùng React với Vite, Bootstrap/React Bootstrap và React Icons. Backend dùng Node.js, Express, Mongoose và bcryptjs. MongoDB lưu dữ liệu dạng document; ObjectId liên kết các collection. Mongoose hỗ trợ schema, validation và thao tác dữ liệu ở tầng ứng dụng, không thay thế cơ sở dữ liệu.

Frontend chia thành `pages`, `components`, `hooks`, `data`, `services`. Backend chia thành `config`, `routes`, `controllers`, `services`, `middlewares`, `models`, `constants` và `utils`. Tách giao diện khỏi nghiệp vụ giúp triển khai API mà không phụ thuộc vào state của trang.

## 6. Phân tích và thiết kế

Các tác nhân, yêu cầu và use case nằm trong [SRS](02-srs.md). [Thiết kế hệ thống](03-system-design.md) mô tả kiến trúc và hợp đồng API. [Thiết kế database](04-database-design.md) ghi nhận đủ 8 model: User, TrainerProfile, MembershipPackage, Subscription, Booking, WorkoutPlan, ProgressLog và Review.

Các sơ đồ trong `diagram/` gồm context, use case cho khách và ba vai trò, workflow đăng ký gói/đặt lịch/buổi tập, ERD logic và database diagram vật lý. Sơ đồ nghiệp vụ thể hiện hệ thống mục tiêu; database diagram thể hiện schema hiện có.

## 7. Kết quả hiện tại

| Hạng mục | Hiện trạng | Giới hạn |
| --- | --- | --- |
| Giao diện | Có trang cho hội viên, PT, quản trị viên | Dữ liệu mẫu và cập nhật state cục bộ |
| Model | 8 Mongoose model và các enum trạng thái | Chưa đủ ràng buộc nghiệp vụ liên collection |
| Kết nối | Đã xác minh React → Express → MongoDB local; health API trả 200 | Kiểm tra kết nối chưa đồng nghĩa API nghiệp vụ đã hoàn chỉnh |
| Mật khẩu | User có hook hash và phương thức so sánh | Chưa có API đăng ký/đăng nhập, token hay middleware phân quyền |
| Lịch tập | Booking có partial unique index theo PT hoặc hội viên/ngày/giờ bắt đầu | Chưa xử lý mọi khoảng giờ chồng nhau; cancelled không giữ chỗ |
| Kiểm thử | Có kiểm thử cấu hình, HTTP, schema và integration database tạm | Chưa có UAT cho API nghiệp vụ đầy đủ |

## 8. Kế hoạch triển khai trong 4 tuần

Nhóm đã thống nhất: **Huy–Admin, Hiếu–Member, Anh–PT và tài khoản dùng chung**. Mỗi người phụ trách cả giao diện, API và kiểm thử trong phạm vi của mình. Kế hoạch từ **12/10 đến 08/11/2026**, ước lượng ban đầu **26 SP/người**, có thời gian dự phòng sửa lỗi trong tuần cuối.

| Tuần | Thời gian | Huy — Admin | Hiếu — Member | Anh — PT/Auth | Mốc tích hợp |
| --- | --- | --- | --- | --- | --- |
| 1 | 12–18/10 | Hợp đồng API, quản lý gói/hội viên/PT | Danh mục thật, đăng ký gói, chính sách lịch | Auth/RBAC, phiên và vai trò UI | Đăng nhập thật → danh mục → pending/unpaid |
| 2 | 19–25/10 | Xác nhận paid/paidAt, quản lý lịch | Đặt/hủy lịch, hiệu lực/hạn mức/trùng slot | Profile, lịch PT và giáo án | Thanh toán → Booking → PT thấy lịch/giáo án |
| 3 | 26/10–01/11 | Doanh thu/dashboard và lỗi API | Dashboard/giáo án/tiến độ/review Member | Kết quả buổi, ProgressLog, Review/PT dashboard | Completed → tiến độ → review; báo cáo đúng |
| 4 | 02–08/11 | UAT Admin, build/lint, cấu hình bàn giao | UAT Member, diagram và minh chứng | UAT bảo mật/PT, API/ERD và biên bản test | MVP ổn định, hồ sơ và demo đủ ba role |

Chi tiết mã công việc, SP, phụ thuộc và tiêu chí nghiệm thu nằm trong [kế hoạch làm việc 4 tuần](07-work-plan-4-weeks.md). SP là ước lượng tương đối, không quy đổi cứng ra giờ/ngày; nhóm hiệu chỉnh sau tuần đầu. Cơ chế slot lịch và chính sách no_show cần chốt đầu tuần 1.

## 9. Rủi ro và xử lý

- Giao diện và model dùng tên trường/vai trò khác nhau: chuẩn hóa DTO tại API và mapping frontend.
- Lịch đặt đồng thời: cần ràng buộc dữ liệu và chiến lược xử lý cạnh tranh, không chỉ kiểm tra từ UI.
- Doanh thu sai do tính dữ liệu chưa thanh toán: lọc `paymentStatus=paid`; thống nhất cách phân kỳ và xử lý hủy.
- Mất lịch sử khi xóa danh mục: ưu tiên khóa bằng `isActive`, lưu bản chụp giá tại Subscription.amount.
- Dữ liệu chỉ số cơ thể bị xem trái phép: kiểm tra quyền sở hữu và quan hệ PT–hội viên tại backend.

## 10. Đánh giá và hướng phát triển

Phiên bản hiện tại là nền giao diện và dữ liệu cho sản phẩm, chưa phải hệ thống quản lý hoàn chỉnh. Công việc tiếp theo tập trung vào API, xác thực, ràng buộc nghiệp vụ và thay dữ liệu mẫu bằng MongoDB. Khi hoàn thành các tiêu chí trong SRS, nhóm có thể bổ sung thông báo, thanh toán trực tuyến và quản lý nhiều chi nhánh.
