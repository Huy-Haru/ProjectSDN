# Đặc tả yêu cầu phần mềm (SRS)

Phiên bản 2.0 — FitManager — cập nhật 23/10/2026 theo mã nguồn trên nhánh HuyNHHE190724. Trạng thái triển khai dưới đây được đối chiếu với API và kiểm thử tự động; không thay thế biên bản nghiệm thu nhóm.

## 1. Mục đích và thuật ngữ

Tài liệu xác định phạm vi, tác nhân, yêu cầu chức năng, quy tắc nghiệp vụ và tiêu chí nghiệm thu. Hội viên (member) là người sử dụng gói tập; PT (trainer) là huấn luyện viên; admin là quản trị viên; Subscription là đăng ký một gói; Booking là một buổi hẹn; WorkoutPlan là giáo án.

Hệ thống phục vụ một phòng tập, sử dụng tiền VND và múi giờ Asia/Ho_Chi_Minh cho nghiệp vụ lịch. MongoDB lưu Date theo UTC; backend phải chuyển đổi và chuẩn hóa ngày khi xử lý lịch. Khách chưa đăng nhập là tác nhân ngoài hệ thống, không phải giá trị `User.role`.

## 2. Tác nhân và quyền truy cập

| Tài nguyên/hành động | Khách | Hội viên | PT | Admin |
| --- | --- | --- | --- | --- |
| Xem gói đang hoạt động | Có | Có | Có qua API công khai | Có qua API công khai/quản trị |
| Xem danh sách PT | Không | Có | Không có route danh mục riêng | Có qua quản trị |
| Đăng ký tài khoản Member | Có | — | — | Tạo Member/PT qua quản trị |
| Quản lý gói/PT/hội viên | Không | Không | Không | Có |
| Đăng ký gói/đặt lịch | Không | Của mình | Không | Không có route tạo hộ |
| Xem/hủy lịch | Không | Của mình, trước giờ bắt đầu | Xem lịch của mình, không hủy qua API PT | Xem/lọc và hủy theo quy tắc |
| Hoàn thành/no_show | Không | Không | Buổi của mình sau giờ kết thúc | Có, cùng quy tắc thời gian |
| Giáo án/tiến độ | Không | Xem của mình | Tạo/sửa giáo án; ghi/xem tiến độ liên quan | Chưa có API giám sát riêng |
| Đánh giá PT | Không | Buổi completed đã kết thúc, một lần/buổi | Xem phản hồi dành cho mình | Chưa có API quản lý đánh giá |
| Thanh toán/doanh thu | Không | Xem trạng thái gói của mình | Không | Xác nhận thủ công, xem báo cáo |
| Profile/đổi mật khẩu | Không | Của mình | Của mình và phần mở rộng PT | Của mình |

Backend và frontend dùng role member/trainer/admin thống nhất. Mỗi request bảo vệ lấy quyền từ User trong database; ẩn menu không thay thế kiểm tra backend.

## 3. Yêu cầu chức năng và tiêu chí nghiệm thu

| ID | Yêu cầu | Tiêu chí nghiệm thu | Trạng thái hiện tại |
| --- | --- | --- | --- |
| FR-01 | Đăng ký tài khoản hội viên | Email duy nhất; mật khẩu hash; không cho tự đặt role admin/PT | API/UI thật; kiểm tra role public |
| FR-02 | Đăng nhập/đăng xuất | Sai thông tin bị từ chối; tài khoản khóa không đăng nhập; phiên hết hạn bị từ chối | JWT và phiên UI thật; đăng xuất xóa token phía client |
| FR-03 | Xem danh sách gói/PT | Chỉ danh mục hoạt động; tìm PT theo tên/chuyên môn | Gói công khai; danh mục PT dành Member, tìm tên/chuyên môn |
| FR-04 | Admin quản lý gói | Giá >= 0, thời hạn >= 1; khóa gói không mất lịch sử | API/UI thật; soft lock |
| FR-05 | Admin quản lý PT/hội viên | Tạo/cập nhật/khóa; một TrainerProfile cho một User trainer | API/UI thật; User/PT profile hợp lệ |
| FR-06 | Đăng ký gói | Lưu member/package/ngày/amount; khởi tạo pending/unpaid | API/UI thật; amount và quyền lợi chốt tại đăng ký |
| FR-07 | Xác nhận thanh toán | Chỉ admin chuyển paid; kích hoạt gói khi đủ điều kiện | API/UI thật; paidAt và lặp xác nhận an toàn |
| FR-08 | Đặt lịch PT | Gói hợp lệ, PT hoạt động, thời gian tương lai và không xung đột | API/UI thật; slot cố định và giữ quota nguyên tử |
| FR-09 | Xem/hủy lịch | Kiểm tra chủ sở hữu; hủy cập nhật cancelled và giữ lịch sử | API/UI thật; giữ cancelled và hoàn quota |
| FR-10 | Hoàn thành/no-show | PT liên quan hoặc admin cập nhật; không lặp trừ số buổi | API/UI thật; PT/Admin, kiểm tra giờ và trạng thái |
| FR-11 | Tạo và xem giáo án | PT liên quan tạo; hội viên chỉ xem giáo án của mình | API/UI thật; sửa có expectedVersion trên giao diện |
| FR-12 | Cập nhật tiến độ | Kiểm tra quyền; kg/cm/% và ngày ghi nhận hợp lệ | API/UI thật; PT liên quan ghi, Member xem |
| FR-13 | Đánh giá PT | Booking completed, thuộc hội viên; mỗi booking tối đa một đánh giá; điểm nguyên 1–5 | API/UI thật; unique booking và kiểm tra chủ sở hữu |
| FR-14 | Báo cáo doanh thu | Tổng amount của đăng ký đã paid theo kỳ; không đếm unpaid | API/UI thật; lọc paidAt theo ngày Việt Nam |
| FR-15 | Xem dashboard theo vai trò | Chỉ số lấy từ dữ liệu có quyền truy cập | API thật cho ba role, không dùng số liệu mẫu |
| FR-16 | Kiểm tra kết nối | API ping database; UI phân biệt kết nối lỗi và thành công | Health API ping MongoDB và UI |
| FR-17 | Xem/cập nhật profile cá nhân cho Member, PT, Admin | Mọi role sửa trường chung của mình; PT sửa mở rộng theo quyền; không tự sửa role/isActive/rating | API/UI thật cho cả ba role |

## 4. Quy tắc nghiệp vụ

| ID | Quy tắc | Mức triển khai |
| --- | --- | --- |
| BR-01 | Email lowercase/trim, unique | Schema và index |
| BR-02 | Public chỉ tạo member; không tự đổi role | API Auth và whitelist profile; Admin tạo Member/PT, không đổi role tài khoản đã có |
| BR-03 | TrainerProfile thuộc User trainer | Admin service kiểm tra; unique user |
| BR-04 | endDate > startDate; amount và quyền lợi tại lúc đăng ký | Schema validation; server chốt amount/includesPT/sessionLimit |
| BR-05 | Gói active/paid, toàn bộ buổi nằm trong hạn | Booking service; startDate <= giờ bắt đầu, endDate >= giờ kết thúc |
| BR-06 | Subscription đúng chủ; PT/User hoạt động | API kiểm tra ref và role |
| BR-07 | Ca mới 60 phút, giờ tròn 08:00–21:00; không chồng lịch PT/Member | Precheck giao khoảng giờ và hai partial unique indexes; legacy giờ lẻ được kiểm tra khi đọc |
| BR-08 | sessionLimit null không giới hạn; booked/completed/no_show tính buổi | Bộ đếm giữ chỗ có điều kiện nguyên tử; lịch cũ đếm riêng; bù khi tạo thất bại |
| BR-09 | Chỉ hủy booked trước giờ bắt đầu, giữ lịch sử | Member/Admin API; optimistic concurrency và hoàn quota |
| BR-10 | Chỉ đánh giá completed đã kết thúc, đúng chủ | API Review suy ra Member/PT từ Booking |
| BR-11 | Một Review/Booking; số sao nguyên 1–5 | Unique index, schema và API |
| BR-12 | PT thao tác tài nguyên mình sở hữu, học viên liên quan | Queries có scope, kiểm thử truy cập chéo; hồ sơ PT khóa không tạo/sửa giáo án/tiến độ/kết quả |
| BR-13 | Không xóa cứng danh mục/tài khoản qua UI quản trị | Soft lock isActive; không có endpoint xóa |
| BR-14 | Doanh thu chỉ paid, phân kỳ theo paidAt | Admin aggregation; ngày Việt Nam |

MongoDB local standalone không có transaction nhiều document. Giữ quota và ghi Booking có bù lỗi nhưng không nguyên tử qua lỗi kết nối/dừng tiến trình; sau sự cố cần đối soát theo [hướng dẫn quota](12-member-booking.md). Cho phép nhiều gói active; Member chọn subscription cụ thể khi đặt. Không có hoàn tiền tự động, cổng thanh toán hoặc tác vụ tự chuyển status expired; API vẫn từ chối đặt ngoài thời hạn.

## 5. Use case chi tiết

### UC-01 — Đăng ký tài khoản (FR-01)

Tác nhân: khách. Tiền điều kiện: chưa có tài khoản với email này. Luồng chính: nhập họ tên/email/mật khẩu → backend chuẩn hóa và kiểm tra → gán role member → hash mật khẩu → lưu → trả thông tin không gồm mật khẩu. Ngoại lệ: email trùng, thiếu trường, mật khẩu không đạt chính sách; trả lỗi và không tạo tài khoản. Hậu điều kiện: tài khoản được tạo, chưa tự cấp quyền admin/PT.

### UC-02 — Đăng nhập (FR-02)

Tác nhân: mọi tài khoản. Nhập email/mật khẩu → tìm User và kiểm tra isActive → so sánh hash → tạo phiên/token → frontend mở trang đúng vai trò. Sai thông tin trả lỗi chung; phiên không hợp lệ không truy cập tài nguyên bảo vệ. Hậu điều kiện: có phiên hợp lệ. JWT bearer đã triển khai; mỗi request kiểm tra User còn hoạt động. Đăng xuất xóa token phía client, chưa có denylist thu hồi token.

### UC-03 — Đăng ký gói và thanh toán (FR-06, FR-07)

Tác nhân: hội viên và admin. Hội viên chọn gói hoạt động → hệ thống chốt giá/thời hạn → lưu pending/unpaid → admin xác nhận thu tiền → chuyển paid/active. Gói bị khóa hoặc dữ liệu thay đổi phải được kiểm tra lại ở backend. Thanh toán chưa xác nhận không cho đặt buổi bằng gói đó. Không gọi cổng thanh toán ngoài trong phiên bản đầu.

### UC-04 — Đặt lịch (FR-08)

Tác nhân: hội viên. Tiền điều kiện: đăng nhập, gói đủ điều kiện, PT hoạt động. Chọn PT/ngày/giờ → backend kiểm tra ref, thời gian, quyền, hiệu lực và hạn mức → kiểm tra xung đột → lưu booked → trả lịch. Nếu xung đột trả 409 và gợi ý chọn giờ khác. Nếu lưu bị cạnh tranh, backend phải xử lý thất bại rõ ràng thay vì báo thành công. Hậu điều kiện: một booking được lưu.

### UC-05 — Hủy lịch (FR-09)

Hội viên chọn lịch của mình hoặc admin chọn lịch → backend kiểm tra trạng thái và hạn hủy → cập nhật cancelled → trả lịch cập nhật. Lịch đã hoàn thành không được chuyển ngược. Tải lại trang vẫn thấy lịch sử hủy. Không xóa document.

### UC-06 — Hoàn thành buổi tập (FR-10)

PT liên quan mở lịch → xác nhận buổi đã diễn ra → backend xác minh quyền, thời gian và trạng thái booked → chuyển completed → cập nhật số buổi theo chính sách. Gửi lại cùng yêu cầu không được tính thêm buổi. Hội viên không tự xác nhận hoàn thành.

### UC-07 — Giáo án và tiến độ (FR-11, FR-12)

PT chọn hội viên được phân công → nhập mục tiêu, khoảng ngày và bài tập hoặc chỉ số → kiểm tra nội dung và quyền → lưu WorkoutPlan/ProgressLog → hội viên xem. Hội viên khác bị từ chối truy cập. Chỉ số không hợp lệ không được lưu. Quyền hội viên tự nhập ProgressLog cần được chốt trước triển khai.

### UC-08 — Đánh giá PT (FR-13)

Hội viên chọn booking completed chưa đánh giá → nhập điểm/comment → backend xác minh quyền và ref → lưu Review → tính lại ratingCount/ratingAverage. Trùng booking trả 409. Kết quả tổng hợp phải nhất quán sau thêm/sửa/xóa review.

### UC-09 — Quản lý danh mục (FR-04, FR-05)

Admin chọn gói/PT/hội viên → tạo hoặc cập nhật thông tin → backend xác minh admin, validate và lưu → danh sách phản ánh thay đổi. Khóa danh mục bằng isActive giữ nguyên lịch sử liên quan. Trùng email hoặc User của PT trả lỗi rõ ràng.

### UC-10 — Báo cáo doanh thu (FR-14)

Admin chọn khoảng thời gian → backend validate khoảng ngày và tổng hợp đăng ký paid → trả tổng tiền/số đăng ký và chi tiết theo kỳ. Không có dữ liệu trả 0 và danh sách rỗng. Model đã có paidAt; API phải lọc theo paidAt cho ngày thu tiền. createdAt chỉ là ngày đăng ký.

### UC-11 — Profile cá nhân (FR-17)

Tác nhân: Member, PT, Admin. Đăng nhập → xem User của mình → cập nhật fullName/phone/gender/dateOfBirth/avatar qua whitelist → validate và save → trả profile an toàn. PT sửa specialties/experienceYears/bio/certificates/pricePerSession của TrainerProfile; không tự sửa trạng thái hoạt động hoặc điểm tổng hợp. Email hiện chỉ đọc qua profile; đổi password qua luồng riêng để hash đúng. Không nhận role/isActive từ API profile public. Hậu điều kiện: profile còn sau tải lại trang, không đổi quyền truy cập.

## 6. Yêu cầu phi chức năng

| ID | Yêu cầu mục tiêu | Cách kiểm chứng |
| --- | --- | --- |
| NFR-01 | Kiểm tra role và ownership tại mọi API bảo vệ | Test truy cập chéo tài khoản/vai trò trả 403 hoặc 404 phù hợp |
| NFR-02 | Không trả password/hash hoặc URI database cho client | Kiểm tra response và log công khai |
| NFR-03 | TLS khi triển khai; không commit .env; CORS đúng origin | Rà cấu hình triển khai và Git |
| NFR-04 | Phản hồi danh sách <= 2 giây ở p95 với 20 người đồng thời và 10.000 booking trên môi trường đo được công bố | Kiểm thử tải; đây là mục tiêu, chưa đo |
| NFR-05 | Danh sách API phân trang tối đa 100 bản ghi/request | Test giới hạn và sort/filter |
| NFR-06 | Lỗi không làm mất dữ liệu hoặc thông báo thành công giả | Test API lỗi, reload và lỗi kết nối |
| NFR-07 | Giao diện dùng được trên màn hình 375px và desktop; có nhãn input và trạng thái loading/error/empty | UAT và kiểm tra bàn phím |
| NFR-08 | Sao lưu hằng ngày; phục hồi được trên database thử nghiệm | Lưu biên bản restore; chưa cấu hình |
| NFR-09 | API trả JSON theo success/message/data; lỗi nhất quán | HTTP contract tests |
| NFR-10 | Server không mở HTTP khi MongoDB không kết nối | Kiểm thử khởi động hiện có |

## 7. Giao diện ngoài

Trình duyệt gọi REST JSON qua HTTP(S). Frontend local tại localhost:3000; backend tại localhost:5000; MongoDB local tại 127.0.0.1:27017/fitmanager. Không cho trình duyệt truy cập MongoDB trực tiếp. Danh mục endpoint hiện tại nằm trong [thiết kế hệ thống](03-system-design.md). GET /api/health ping MongoDB; các endpoint nghiệp vụ đã nối frontend và kiểm thử database tạm.

## 8. Truy vết

| Use case | FR | Model | Sơ đồ |
| --- | --- | --- | --- |
| UC-01/02 | FR-01/02 | User | usecase-guest, usecase-member |
| UC-03 | FR-06/07 | Subscription, MembershipPackage | workflow-subscription |
| UC-04/05/06 | FR-08/09/10 | Booking, Subscription, TrainerProfile | workflow-booking, workflow-training |
| UC-07 | FR-11/12 | WorkoutPlan, ProgressLog | usecase-trainer, workflow-training |
| UC-08 | FR-13 | Review, Booking, TrainerProfile | workflow-training |
| UC-09 | FR-04/05 | User, MembershipPackage, TrainerProfile | usecase-admin |
| UC-10 | FR-14 | Subscription | usecase-admin |

## 9. Điều kiện nghiệm thu

Không nghiệm thu chỉ bằng việc giao diện hiển thị. Mỗi FR phải có luồng thành công, luồng từ chối quyền và dữ liệu lỗi; nghiệp vụ phải tồn tại sau tải lại trang. Cần minh chứng dữ liệu thật trong MongoDB, kiểm thử cạnh tranh đặt lịch, đối chiếu doanh thu và UAT theo ba vai trò. Các yêu cầu chưa triển khai được đánh dấu rõ trong biên bản.
