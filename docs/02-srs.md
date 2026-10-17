# Đặc tả yêu cầu phần mềm (SRS)

Phiên bản 1.0 — FitManager — 11/10/2026. Đây là yêu cầu mục tiêu và các giả định thiết kế cần nhóm xác nhận trước triển khai nghiệp vụ.

## 1. Mục đích và thuật ngữ

Tài liệu xác định phạm vi, tác nhân, yêu cầu chức năng, quy tắc nghiệp vụ và tiêu chí nghiệm thu. Hội viên (member) là người sử dụng gói tập; PT (trainer) là huấn luyện viên; admin là quản trị viên; Subscription là đăng ký một gói; Booking là một buổi hẹn; WorkoutPlan là giáo án.

Hệ thống phục vụ một phòng tập, sử dụng tiền VND và múi giờ Asia/Ho_Chi_Minh cho nghiệp vụ lịch. MongoDB lưu Date theo UTC; backend phải chuyển đổi và chuẩn hóa ngày khi xử lý lịch. Khách chưa đăng nhập là tác nhân ngoài hệ thống, không phải giá trị `User.role`.

## 2. Tác nhân và quyền truy cập

| Tài nguyên/hành động | Khách | Hội viên | PT | Admin |
| --- | --- | --- | --- | --- |
| Xem gói tập/PT đang hoạt động | Có | Có | Có | Có |
| Đăng ký tài khoản hội viên | Có | — | — | Có thể tạo tài khoản theo thiết kế |
| Quản lý gói/PT/hội viên | Không | Không | Không | Có |
| Đăng ký gói/đặt lịch | Không | Của mình | Không | Hỗ trợ theo quyền quản trị |
| Xem/hủy lịch | Không | Của mình | Lịch liên quan; hủy cần chính sách | Tất cả |
| Xác nhận hoàn thành buổi | Không | Không | Buổi của mình | Có |
| Giáo án/tiến độ | Không | Xem của mình | Tạo/cập nhật cho hội viên liên quan | Giám sát theo quyền |
| Đánh giá PT | Không | Buổi của mình đã hoàn thành | Xem đánh giá liên quan | Xem/quản lý theo chính sách |
| Xác nhận thanh toán/doanh thu | Không | Xem trạng thái của mình | Không | Có |

Backend dùng `member`, `trainer`, `admin`; frontend hiện dùng vai trò demo viết hoa. API cần mapping rõ ràng. Ẩn menu không thay thế phân quyền backend.

## 3. Yêu cầu chức năng và tiêu chí nghiệm thu

| ID | Yêu cầu | Tiêu chí nghiệm thu | Trạng thái hiện tại |
| --- | --- | --- | --- |
| FR-01 | Đăng ký tài khoản hội viên | Email duy nhất; mật khẩu hash; không cho tự đặt role admin/PT | UI và User model; chưa API |
| FR-02 | Đăng nhập/đăng xuất | Sai thông tin bị từ chối; tài khoản khóa không đăng nhập; phiên hết hạn bị từ chối | Đăng nhập demo |
| FR-03 | Xem danh sách gói/PT | Chỉ danh mục hoạt động; tìm PT theo tên/chuyên môn | UI dữ liệu mẫu |
| FR-04 | Admin quản lý gói | Giá >= 0, thời hạn >= 1; khóa gói không mất lịch sử | UI và model |
| FR-05 | Admin quản lý PT/hội viên | Tạo/cập nhật/khóa; một TrainerProfile cho một User trainer | UI và model |
| FR-06 | Đăng ký gói | Lưu member/package/ngày/amount; khởi tạo pending/unpaid | UI và model |
| FR-07 | Xác nhận thanh toán | Chỉ admin chuyển paid; kích hoạt gói khi đủ điều kiện | Model; API chưa có |
| FR-08 | Đặt lịch PT | Gói hợp lệ, PT hoạt động, thời gian tương lai và không xung đột | UI và model |
| FR-09 | Xem/hủy lịch | Kiểm tra chủ sở hữu; hủy cập nhật cancelled và giữ lịch sử | UI hiện xóa khỏi state |
| FR-10 | Hoàn thành/no-show | PT liên quan hoặc admin cập nhật; không lặp trừ số buổi | UI/model; chưa nghiệp vụ |
| FR-11 | Tạo và xem giáo án | PT liên quan tạo; hội viên chỉ xem giáo án của mình | UI và model |
| FR-12 | Cập nhật tiến độ | Kiểm tra quyền; kg/cm/% và ngày ghi nhận hợp lệ | UI và model |
| FR-13 | Đánh giá PT | Booking completed, thuộc hội viên; mỗi booking tối đa một đánh giá; điểm nguyên 1–5 | UI/model; chưa kiểm tra nghiệp vụ |
| FR-14 | Báo cáo doanh thu | Tổng amount của đăng ký đã paid theo kỳ; không đếm unpaid | UI mẫu |
| FR-15 | Xem dashboard theo vai trò | Chỉ số lấy từ dữ liệu có quyền truy cập | UI mẫu |
| FR-16 | Kiểm tra kết nối | API ping database; UI phân biệt kết nối lỗi và thành công | Có health API và health UI |
| FR-17 | Xem/cập nhật profile cá nhân cho Member, PT, Admin | Mọi role sửa trường chung của mình; PT sửa mở rộng theo quyền; không tự sửa role/isActive/rating | Model có; API chưa có |

## 4. Quy tắc nghiệp vụ

| ID | Quy tắc | Mức triển khai |
| --- | --- | --- |
| BR-01 | Email chuẩn hóa lowercase/trim và duy nhất | Schema hiện có |
| BR-02 | Tài khoản public đăng ký chỉ là member; role thay đổi bởi admin | Yêu cầu |
| BR-03 | TrainerProfile.user phải trỏ đến User có role trainer | Unique ref có; kiểm tra role chưa có |
| BR-04 | Subscription có endDate > startDate; amount là giá tại lúc đăng ký | amount có; ràng buộc ngày chưa có |
| BR-05 | Gói sử dụng phải active, paid và startDate <= ngày buổi tập <= endDate | isValid đã kiểm tra active/paid/startDate/endDate; service vẫn cần kiểm tra ngày buổi tập |
| BR-06 | Booking.subscription thuộc đúng member; PT đang hoạt động | Yêu cầu |
| BR-07 | Hai khoảng [start,end) giao nhau nếu startA < endB và startB < endA; kiểm tra cả PT và hội viên | Partial unique hiện chống cùng startTime của PT/hội viên; chưa chống mọi khoảng chồng giờ |
| BR-08 | Không đặt vượt sessionLimit; null nghĩa là không giới hạn | Yêu cầu; chưa có bộ đếm tiêu thụ đáng tin cậy |
| BR-09 | Hủy trước giờ bắt đầu; không xóa booking; lịch cancelled không giữ chỗ | Partial index đã bỏ cancelled khỏi chỗ giữ; API hủy chưa có |
| BR-10 | Chỉ completed mới được đánh giá; booking, member và trainer phải khớp | Yêu cầu; schema chỉ có ref/unique |
| BR-11 | Một Review trên một Booking; rating nguyên từ 1 đến 5 | Unique/min/max và integer hiện có; chưa kiểm tra quyền/buổi hoàn thành |
| BR-12 | PT chỉ sửa dữ liệu của hội viên có booking/subscription liên quan được cho phép | Yêu cầu |
| BR-13 | Không xóa cứng User/PT/gói đã có tham chiếu | Chính sách đề xuất |
| BR-14 | Doanh thu là dữ liệu gói đã paid; cần thêm paidAt để lọc đúng ngày thu | Đã có paidAt; chưa có API xác nhận hoặc model giao dịch |

Các quy tắc về no-show có tính buổi hay không, hoàn tiền, thời hạn hủy và một hội viên được có bao nhiêu gói active cần nhóm/phòng tập xác nhận. Phiên bản thiết kế tạm chọn hủy trước giờ bắt đầu, completed tính buổi, no-show chờ quyết định; chưa triển khai trừ buổi.

## 5. Use case chi tiết

### UC-01 — Đăng ký tài khoản (FR-01)

Tác nhân: khách. Tiền điều kiện: chưa có tài khoản với email này. Luồng chính: nhập họ tên/email/mật khẩu → backend chuẩn hóa và kiểm tra → gán role member → hash mật khẩu → lưu → trả thông tin không gồm mật khẩu. Ngoại lệ: email trùng, thiếu trường, mật khẩu không đạt chính sách; trả lỗi và không tạo tài khoản. Hậu điều kiện: tài khoản được tạo, chưa tự cấp quyền admin/PT.

### UC-02 — Đăng nhập (FR-02)

Tác nhân: mọi tài khoản. Nhập email/mật khẩu → tìm User và kiểm tra isActive → so sánh hash → tạo phiên/token → frontend mở trang đúng vai trò. Sai thông tin trả lỗi chung; phiên không hợp lệ không truy cập tài nguyên bảo vệ. Hậu điều kiện: có phiên hợp lệ. Cơ chế phiên chưa được triển khai.

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

Tác nhân: Member, PT, Admin. Đăng nhập → xem User của mình → cập nhật fullName/phone/gender/dateOfBirth/avatar qua whitelist → validate và save → trả profile an toàn. PT có thêm TrainerProfile; giá PT, trạng thái hoạt động và điểm tổng hợp không tự sửa nếu chưa được chính sách cấp quyền. Email thay đổi cần kiểm tra unique và chính sách xác minh; đổi password qua luồng riêng để hash đúng. Không nhận role/isActive từ API profile public. Hậu điều kiện: profile còn sau tải lại trang, không đổi quyền truy cập.

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

Trình duyệt gọi REST JSON qua HTTP(S). Frontend local tại localhost:3000; backend tại localhost:5000; MongoDB local tại 127.0.0.1:27017/fitmanager. Không cho trình duyệt truy cập MongoDB trực tiếp. Endpoint hiện có: GET / và GET /api/health. Các endpoint nghiệp vụ trong tài liệu thiết kế là đề xuất.

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
