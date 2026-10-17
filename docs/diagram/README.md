# Sơ đồ draw.io

Các file là XML mxfile không nén, mở và chỉnh sửa được trong [draw.io / diagrams.net](https://app.diagrams.net/) bằng File → Open From → Device. Không cần import Mermaid hoặc cài plugin. Có thể dùng draw.io Desktop offline và Export as PDF/PNG/SVG để đưa vào báo cáo.

| File | Loại | Phạm vi |
| --- | --- | --- |
| context.drawio | Context diagram | Hệ thống mục tiêu và 4 tác nhân |
| usecase-guest.drawio | Use case | Khách |
| usecase-member.drawio | Use case | Hội viên |
| usecase-trainer.drawio | Use case | Huấn luyện viên |
| usecase-admin.drawio | Use case | Quản trị viên |
| workflow-subscription.drawio | Swimlane workflow | Member → Hệ thống → Admin: đăng ký gói/thanh toán |
| workflow-booking.drawio | Swimlane workflow | Member → Hệ thống → PT: đặt lịch và kiểm tra lỗi |
| workflow-training.drawio | Swimlane workflow | PT → Hệ thống → Member: giáo án, tiến độ, review |
| workflow-cancellation.drawio | Swimlane workflow | Member → Hệ thống → PT: hủy lịch/giữ lịch sử |
| erd.drawio | ERD logic | Cardinality giữa 8 entity |
| database.drawio | Database diagram | Collection, trường, index và ref hiện có |

Context dùng một process tròn đại diện toàn bộ FitManager và bốn external entity hình chữ nhật. Tám mũi tên vào/ra riêng biệt có tên luồng dữ liệu, không dùng actor UML hoặc hai mũi tên đè lên một đường.

Use case dùng actor UML ngoài biên hệ thống và ellipse bên trong. Association là đường liền không mũi tên. `«include»` dùng nét đứt/mũi tên mở từ use case chính đến xử lý bắt buộc; `«extend»` đi từ hành vi tùy chọn đến use case được mở rộng, kèm điều kiện `[ ]`. Đăng nhập là tiền điều kiện của thao tác bảo vệ, không bị include vào mọi chức năng.

Bốn workflow có **swimlane thực trong draw.io**, các node con nằm trong lane tương ứng: Member/PT/Admin hoặc Hệ thống. Luồng điều khiển dùng mũi tên liền; hình thoi có nhãn điều kiện, initial/final có ký hiệu bắt đầu/kết thúc. Đường nét đứt sang lane PT trong đặt/hủy lịch biểu diễn dữ liệu được tra cứu sau khi lưu, không phải yêu cầu PT duyệt booking hoặc gửi thông báo bên ngoài.

ERD và database diagram dùng **8 entity duy nhất trên cùng một mạng liên kết**, đủ 13 quan hệ. Crow's foot thể hiện 1, 0..1 và 0..N. Trường trainer của ProgressLog tùy chọn; User có 0..1 TrainerProfile; Booking có 0..1 Review. WorkoutPlan.items là dữ liệu nhúng, không phải collection.

Context/use case/workflow mô tả **yêu cầu mục tiêu**. ERD/database mô tả **schema hiện có**; ref không phải khóa ngoại MongoDB. Không đưa cổng thanh toán ngoài vào sơ đồ vì phiên bản đầu xác nhận thủ công.

Các đường nối được định tuyến theo hành lang trống, gắn đúng cổng nguồn/đích và không xuyên qua entity khác. Chỗ đường nối giao nhau không có dấu chấm không phải quan hệ mới. ERD có tên quan hệ; database diagram bổ sung thuộc tính/ref chính. Từ điển đầy đủ và index nằm trong [thiết kế database](../04-database-design.md) và [tối ưu MongoDB](../06-mongodb-optimization.md).

File `.drawio` là nguồn chỉnh sửa; `.svg`/`.png` là bản xem nhanh với cùng tọa độ node, đường nối và kiểu mũi tên. Chạy `node docs/diagram/generate.cjs` từ thư mục dự án để tái tạo draw.io/SVG; trình dựng nằm trong `drawio.cjs`. Kế hoạch triển khai các luồng mục tiêu nằm trong [kế hoạch 4 tuần](../07-work-plan-4-weeks.md).

Ký hiệu `ERmandOne` biểu diễn đầu quan hệ bắt buộc một; định dạng marker đối chiếu với [ví dụ edge chính thức của draw.io](https://github.com/jgraph/drawio-diagrams/blob/dev/examples/csv/edges.txt). Bản PNG/SVG cũng hiển thị hai vạch tương ứng.
