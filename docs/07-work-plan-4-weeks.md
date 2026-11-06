# Kế hoạch làm việc 4 tuần — Nhóm 3 người

**Dự án:** FitManager — Website quản lý phòng tập và huấn luyện viên.

**Thời gian:** 12/10/2026–08/11/2026.

**Phân công đã thống nhất:** Huy phụ trách Admin; Hiếu phụ trách Member; Anh phụ trách PT và nền tài khoản dùng chung.

**Tiến độ cập nhật 23/10:** các luồng MVP của ba role đã tích hợp trên HuyNHHE190724 và có kiểm thử tự động. [Bảng đối chiếu và giới hạn](17-mvp-acceptance.md) ghi bằng chứng theo hạng mục, không tự xác nhận nghiệm thu nhóm. Huy vẫn phụ trách Admin theo kế hoạch gốc; tích hợp code trên nhánh này không thay đổi phân công đã thống nhất. Review chéo, UAT thủ công đủ thiết bị và hosting cần biên bản riêng; các bảng dưới giữ kế hoạch gốc.

## 1. Mục tiêu sau 4 tuần

Hoàn thành phiên bản MVP dùng dữ liệu MongoDB thật: đăng nhập theo ba role, quản lý gói/hội viên/PT, đăng ký gói và xác nhận thanh toán thủ công, đặt/hủy lịch, giáo án, tiến độ, đánh giá PT và báo cáo doanh thu. Các thao tác quan trọng phải giữ dữ liệu sau tải lại trang và được kiểm tra quyền tại backend.

Hiện đã có giao diện mẫu, 8 model Mongoose, index/validation nền và kết nối React–Express–MongoDB. Phần cần làm chủ yếu là API nghiệp vụ, phân quyền, tích hợp giao diện, kiểm tra quan hệ và kiểm thử các luồng thực tế. Không tính các hạng mục đã có thành tính năng mới hoàn thành trong kế hoạch.

## 2. Phân công theo role và cân bằng khối lượng

| Thành viên | Role chính | Frontend phụ trách | Backend và dữ liệu phụ trách | Kiểm thử chính |
| --- | --- | --- | --- | --- |
| **Huy** — HuyNHHE190724 | Admin | Các trang quản trị gói, hội viên, PT, lịch, thanh toán, doanh thu/dashboard | API quản trị; xác nhận paid/paidAt; báo cáo theo ngày thu; cấu hình bản phát hành | Quyền Admin, danh mục, thanh toán và đối chiếu doanh thu |
| **Hiếu** — hieunhhe187023 | Member | Danh mục gói/PT, đăng ký gói, gói của tôi, đặt/hủy lịch, giáo án/tiến độ, gửi đánh giá | Subscription và Booking; điều kiện gói; hạn mức buổi; quyền sở hữu; chống trùng lịch | Luồng hội viên từ đăng ký gói đến đặt lịch và đánh giá |
| **Anh** — anhnthe194418 | PT + nền tài khoản | Đăng nhập/đăng ký/profile dùng chung; dashboard PT, lịch PT, hội viên liên quan, giáo án/tiến độ/đánh giá PT | Auth/phiên/RBAC; profile User/PT; WorkoutPlan, ProgressLog; API Review và tổng hợp điểm PT | Xác thực, truy cập chéo vai trò, quyền PT và dữ liệu huấn luyện |

Mỗi người làm cả frontend, backend và kiểm thử trong phạm vi phụ trách. Anh có thêm nền tài khoản nên Huy phụ trách phát hành/kiểm thử tổng hợp và Hiếu phụ trách nghiệp vụ gói/lịch khó hơn. Với Review, **Anh làm API và điểm tổng hợp; Hiếu làm form gửi đánh giá của Member**. Anh làm API lịch đọc theo quyền PT; dùng Booking do Hiếu phụ trách, không tạo collection lịch riêng.

Ước lượng dùng **story point (SP)** tương đối: 1 = nhỏ, 2–3 = trung bình, 4–5 = nhiều bước, 7 = nghiệp vụ khó cần kiểm thử cạnh tranh. SP không phải giờ hoặc ngày. Nhóm cần hiệu chỉnh sau tuần đầu theo tiến độ thực tế.

| Thành viên | Tuần 1 | Tuần 2 | Tuần 3 | Tuần 4 | Tổng cam kết |
| --- | ---: | ---: | ---: | ---: | ---: |
| Huy | 8 | 7 | 7 | 4 | **26 SP** |
| Hiếu | 8 | 7 | 7 | 4 | **26 SP** |
| Anh | 8 | 7 | 7 | 4 | **26 SP** |
| Tổng nhóm | 24 | 21 | 21 | 12 | **78 SP** |

Tuần 4 giảm tính năng mới để dành thời gian sửa lỗi và nghiệm thu. Tổng SP bằng nhau là kế hoạch phân bổ ban đầu; không phải bằng chứng khối lượng thực tế chắc chắn bằng nhau. Nếu một người chậm do phụ thuộc hoặc phát sinh lỗi, cả nhóm điều chỉnh công việc để giữ mốc MVP.

## 3. Tuần 1 — Nền tài khoản và danh mục (12–18/10/2026)

**Mục tiêu:** ba người thống nhất hợp đồng API; có xác thực thật, dữ liệu danh mục thật và đăng ký gói pending/unpaid.

| ID | Người | Công việc cần làm | SP | Phụ thuộc | Tiêu chí hoàn thành |
| --- | --- | --- | ---: | --- | --- |
| H1.1 | Huy | Chốt cùng nhóm cấu trúc response, DTO, quyền và các endpoint; tổ chức nhánh/PR tích hợp | 1 | Không | Hợp đồng API được ghi trong docs; thống nhất role member/trainer/admin và error code |
| H1.2 | Huy | API + UI Admin tạo/sửa/khóa gói tập | 3 | H1.1, A1.1 để bảo vệ API | Giá/thời hạn hợp lệ; khóa bằng isActive; tải lại còn thay đổi |
| H1.3 | Huy | API + UI danh sách/tạo/cập nhật/khóa Member và PT | 4 | A1.1 | Chỉ Admin truy cập; email unique; User trainer có một TrainerProfile; không mất lịch sử khi khóa |
| M1.1 | Hiếu | Tích hợp danh mục gói/PT từ API; mapping ObjectId/DTO và loading/error/empty | 2 | H1.1, H1.2/H1.3 | Xem dữ liệu thật; không coi lỗi API là lưu thành công bằng mock |
| M1.2 | Hiếu | API + UI đăng ký gói và xem gói của tôi | 4 | A1.1, H1.2 | Server lấy member từ phiên, chốt amount; lưu pending/unpaid; chỉ xem gói của mình |
| M1.3 | Hiếu | Chốt chính sách lịch/hạn mức và hợp đồng Booking; chuẩn bị DTO/API client | 2 | H1.1; nhóm chốt nghiệp vụ | Có quy ước ngày/giờ, slot, trạng thái và cách đếm buổi dùng chung |
| A1.1 | Anh | API đăng ký/đăng nhập/đăng xuất/me, middleware xác thực và phân quyền; nối form dùng chung | 6 | H1.1 | Public chỉ tạo member; password hash; chặn tài khoản khóa/phiên hết hạn; không cho tự đổi role |
| A1.2 | Anh | Chuẩn hóa profile/vai trò UI và phiên; loại bỏ khả năng đổi role demo trong luồng thật | 2 | A1.1 | Member/PT/Admin điều hướng từ role server; cùng cơ chế lưu/khôi phục/đăng xuất phiên |

**Mốc cuối tuần:** Admin quản lý danh mục → Member đọc danh mục → Member đăng ký gói pending/unpaid; thử quyền bằng tài khoản thật của ba vai trò. Auth/RBAC được tích hợp sớm trong tuần, không chờ đến cuối tuần mới giao cho hai người còn lại.

## 4. Tuần 2 — Thanh toán, đặt lịch và giáo án (19–25/10/2026)

**Mục tiêu:** hoàn thành luồng gói đã thanh toán → đặt/hủy lịch → PT xem lịch và giáo án.

| ID | Người | Công việc cần làm | SP | Phụ thuộc | Tiêu chí hoàn thành |
| --- | --- | --- | ---: | --- | --- |
| H2.1 | Huy | API + UI Admin xác nhận thanh toán và kích hoạt gói | 4 | M1.2, A1.1 | Chỉ Admin lưu paid/paidAt; kiểm tra trạng thái/ngày; thao tác lặp không tạo thu tiền giả |
| H2.2 | Huy | Tích hợp trang quản lý lịch, bộ lọc và xử lý trạng thái theo quyền Admin | 3 | M2.1, A1.1 | Dữ liệu thật; phân trang; không chuyển ngược trạng thái cuối; có phản hồi lỗi |
| M2.1 | Hiếu | API + UI đặt/xem/hủy Booking; hiệu lực gói, hạn mức, trùng lịch PT/Member và cạnh tranh | 7 | M1.3, H2.1, A1.1 | Gói unpaid/chưa hiệu lực bị từ chối; cùng chỗ chỉ một booking; hủy giữ cancelled; đặt lại được |
| A2.1 | Anh | API + UI profile cá nhân cho cả ba role; mở rộng PT | 2 | A1.1/A1.2 | Chỉ sửa trường whitelist của mình; không tự sửa role/isActive/rating; password đi luồng riêng |
| A2.2 | Anh | API + UI lịch PT/hội viên liên quan và tạo/cập nhật giáo án | 5 | M2.1 để có quan hệ lịch | PT chỉ thấy tài nguyên liên quan; giáo án lưu MongoDB; Member xem được của mình |

**Mốc cuối tuần:** Admin xác nhận gói → Member đặt lịch → PT thấy lịch → PT tạo giáo án → Member xem giáo án. Chạy kiểm thử hai request đồng thời và trường hợp lịch cancelled trước khi công nhận Booking hoàn thành.

## 5. Tuần 3 — Kết quả buổi tập, tiến độ, đánh giá và báo cáo (26/10–01/11/2026)

**Mục tiêu:** hoàn chỉnh vòng đời buổi tập và các màn hình theo dõi/report bằng dữ liệu thật.

| ID | Người | Công việc cần làm | SP | Phụ thuộc | Tiêu chí hoàn thành |
| --- | --- | --- | ---: | --- | --- |
| H3.1 | Huy | API + UI doanh thu/dashboard Admin, lọc khoảng ngày và thống kê vận hành | 5 | H2.1, M2.1 | Chỉ paid được tính doanh thu; lọc theo paidAt; tổng khớp bộ dữ liệu kiểm thử |
| H3.2 | Huy | Chuẩn hóa lỗi/validation cho API quản trị; kiểm tra quyền và dữ liệu tham chiếu | 2 | H1–H3.1 | Không lộ secret/hash; trả lỗi dữ liệu/trùng/quyền rõ ràng; tài khoản khóa không hoạt động |
| M3.1 | Hiếu | Nối dashboard Member, xem giáo án/tiến độ và form đánh giá PT; bỏ hành vi tự completed | 5 | A2.2, A3.1/A3.2 | Không tự hoàn thành buổi bằng role Member; giáo án/log/review thật; dữ liệu còn sau reload |
| M3.2 | Hiếu | Kiểm thử tích hợp gói/lịch; xử lý cạnh tranh và thao tác lặp; sửa lỗi luồng Member | 2 | M2.1, A3.1 | Không vượt hạn mức, không trừ buổi hai lần; không đọc/sửa lịch người khác |
| A3.1 | Anh | API + UI xác nhận completed/no_show, ghi/xem ProgressLog và dữ liệu PT liên quan | 4 | M2.1, A2.2 | Chỉ PT liên quan/Admin xác nhận; kiểm tra trạng thái và quyền; chỉ số hợp lệ; save idempotent |
| A3.2 | Anh | API Review, quyền/booking completed/unique; điểm tổng hợp và dashboard/đánh giá PT | 3 | A3.1 | Mỗi booking một review; rating nguyên 1–5; PT thấy điểm/count cập nhật đúng |

**Mốc cuối tuần:** PT completed → ghi tiến độ → Member xem và đánh giá → PT thấy điểm mới; Admin đối chiếu doanh thu. Tất cả tính năng MVP phải có luồng tích hợp, còn tuần 4 chỉ sửa lỗi và hoàn thiện nghiệm thu.

## 6. Tuần 4 — Tích hợp, sửa lỗi và bàn giao (02–08/11/2026)

**Mục tiêu:** ổn định phiên bản, chạy UAT và hoàn thiện hồ sơ để trình bày.

| ID | Người | Công việc cần làm | SP | Phụ thuộc | Tiêu chí hoàn thành |
| --- | --- | --- | ---: | --- | --- |
| H4.1 | Huy | Kiểm thử Admin và đối chiếu báo cáo; xử lý lỗi nghiêm trọng, build/lint nền | 2 | H3, API tích hợp | Admin không sai quyền; báo cáo đúng; không còn lỗi chặn demo |
| H4.2 | Huy | Chuẩn bị cấu hình bản phát hành, database/index, backup/restore thử và hướng dẫn chạy | 2 | Toàn bộ MVP | Chạy theo README từ checkout mới; không commit secret; có hướng dẫn rollback/restore |
| M4.1 | Hiếu | UAT Member, responsive/loading/error/empty; sửa lỗi gói/lịch/đánh giá | 2 | M3 | Luồng Member hoàn chỉnh trên desktop/mobile; dữ liệu không mất sau reload |
| M4.2 | Hiếu | Cập nhật context/use case/swimlane; chụp minh chứng và chuẩn bị kịch bản demo Member | 2 | MVP ổn định | Diagram đúng hành vi đã làm; báo cáo không ghi tính năng chưa có là đã hoàn thành |
| A4.1 | Anh | Kiểm thử bảo mật/role/ownership, PT và review; sửa lỗi dữ liệu | 2 | A3 | Truy cập chéo bị chặn; public không tự thành Admin/PT; lỗi không lộ password/URI |
| A4.2 | Anh | Cập nhật API/từ điển dữ liệu/ERD và kết quả kiểm thử; chuẩn bị demo PT/Auth | 2 | Model/API chốt | Tài liệu khớp code; đủ trường/index/cardinality; có biên bản test/UAT |

**Mốc cuối tuần:** bản MVP đã kiểm thử, chạy được theo hướng dẫn, có tài khoản demo riêng theo role, báo cáo/SRS/sơ đồ đúng bản cuối và danh sách hạn chế còn lại. Các công việc sửa lỗi phát sinh dùng phần thời gian dự phòng của tuần 4; lỗi chặn nghiệm thu ưu tiên hơn bổ sung tính năng mới.

## 7. Quy tắc nghiệp vụ cần chốt ngay tuần 1

| Nội dung | Đề xuất cho MVP | Người chốt/thực hiện |
| --- | --- | --- |
| Role và profile | User chung; PT mở rộng TrainerProfile; DB dùng member/trainer/admin | Anh + cả nhóm |
| Quyền sửa tài khoản | Public tạo member; chỉ Admin cấp/khóa PT; profile cá nhân không sửa role | Anh + Huy |
| Phiên đăng nhập | Chốt một cơ chế duy nhất, có hết hạn và đăng xuất; client/server dùng cùng hợp đồng | Anh + cả nhóm |
| Thời gian lịch | Ngày YYYY-MM-DD, giờ HH:mm; nghiệp vụ Asia/Ho_Chi_Minh | Hiếu + Anh |
| Chống chồng lịch | Ưu tiên MVP slot cố định 60 phút bắt đầu ở mốc giờ; kiểm tra gói và unique cả PT/Member | Hiếu + cả nhóm |
| Nếu dùng khoảng giờ linh hoạt | Phải bổ sung cơ chế chống chồng interval khi ghi đồng thời; index startTime hiện không đủ | Hiếu; nhóm điều chỉnh SP/phạm vi trước triển khai |
| Hạn mức buổi | completed tính buổi; booked giữ chỗ; cancelled giải phóng. no_show cần nhóm xác nhận có tính buổi | Hiếu + Anh + Huy |
| Thanh toán | Admin xác nhận thủ công, lưu paidAt; chưa tích hợp ngân hàng/hoàn tiền tự động | Huy |
| Hiệu lực gói | paid + active; ngày buổi tập trong startDate/endDate; chọn subscription rõ ràng khi có nhiều gói | Hiếu + Huy |
| Kết quả buổi tập | PT liên quan hoặc Admin; Member chỉ xem | Anh + Huy |
| Đánh giá | Booking completed, đúng Member/PT, chưa review; mỗi booking một đánh giá | Anh + Hiếu |

Bản triển khai hiện dùng slot 60 phút bắt đầu giờ tròn 08:00–21:00; booked/completed/no_show giữ hạn mức, cancelled hoàn buổi. Bảng trên giữ đề xuất lịch sử; chính sách đã hiện thực và giới hạn standalone nằm trong docs/12. Nếu chọn giờ linh hoạt, nhóm phải giảm hạng mục ít ưu tiên hoặc tăng thời gian kiểm thử; không đánh dấu chống trùng đã hoàn thành chỉ vì cùng startTime bị chặn.

## 8. Phụ thuộc và cách phối hợp

**Luồng quan trọng:** hợp đồng API → Auth/RBAC → danh mục → Subscription → xác nhận paid → Booking → completed/ProgressLog → Review. Doanh thu phụ thuộc payment/paidAt; giáo án và quyền PT phụ thuộc quan hệ hội viên/lịch.

- Ngày đầu tuần 1: cả nhóm thống nhất request/response, DTO và quy tắc; lưu ví dụ trong docs. Mock theo hợp đồng chỉ dùng để phát triển, đánh dấu rõ đến khi API được nối.
- Anh giao sớm middleware auth và cách lấy req.user để Huy/Hiếu dùng cùng cơ chế; hai người còn lại không tự tạo hệ thống đăng nhập riêng.
- Hiếu giao service/query Booking theo quyền và trạng thái để Anh/Huy dùng lại; thay đổi schema/index phải thông báo trước PR.
- Mỗi PR nhỏ, một mục tiêu, kèm cách thử và FR/UC liên quan; không sửa cùng file dùng chung cùng lúc khi chưa thống nhất.
- Reviewer luân phiên: **Huy review Anh; Anh review Hiếu; Hiếu review Huy**. Tác giả sửa nhận xét; người review tập trung quyền, dữ liệu và luồng lỗi.
- Đầu mỗi tuần: cập nhật việc còn lại/phụ thuộc. Cuối mỗi tuần: tích hợp và chạy demo chung theo mốc, ghi lỗi và người xử lý. Không chờ tuần 4 mới merge các module.
- main nhận thay đổi sau review và kiểm tra. Nhánh role hiện có có thể tiếp tục dùng; cần đồng bộ bản tích hợp trước làm phần mới, tránh ghi đè công việc người khác.

## 9. Định nghĩa hoàn thành cho một tính năng

1. API có validation, quyền theo role/ownership và phản hồi lỗi rõ ràng.
2. Dữ liệu ghi vào MongoDB đúng ref/index/trạng thái; tải lại trang vẫn đọc được.
3. Frontend dùng API thật, có loading/error/empty; không giữ mock như kết quả lưu thật.
4. Có kiểm tra thành công, dữ liệu lỗi và truy cập trái quyền; nghiệp vụ lịch/đánh giá/thanh toán thêm trường hợp trùng và lặp.
5. PR được một thành viên khác review; chạy kiểm tra phù hợp với thay đổi.
6. Tài liệu/API/diagram cập nhật và demo được bằng tài khoản đúng role.

## 10. Phạm vi ưu tiên và xử lý chậm tiến độ

**Bắt buộc:** Auth/RBAC, profile ba role, danh mục Admin, Subscription/payment thủ công, Booking/cancellation, lịch PT, giáo án/tiến độ, Review và doanh thu cơ bản.

**Giảm trước nếu chậm:** dashboard nhiều biểu đồ, bộ lọc nâng cao, xuất báo cáo đẹp, chỉnh sửa hồ sơ nhiều trường và trang trí giao diện. Vẫn giữ số liệu cơ bản và khả năng tìm thông tin cần thiết. Ngoài 4 tuần: cổng thanh toán, nhiều chi nhánh, quản lý thiết bị, thông báo email/SMS và ứng dụng mobile.

Nếu sau tuần 2 luồng gói → thanh toán → lịch chưa chạy, tuần 3 ưu tiên cả nhóm xử lý luồng này trước dashboard. Nếu Auth/RBAC chậm, Huy/Hiếu hỗ trợ Anh theo hạng mục nhỏ thay vì tự tạo cơ chế khác. Không bỏ kiểm tra quyền hoặc kiểm thử cạnh tranh để kịp thời hạn.

## 11. Bộ kịch bản nghiệm thu cuối kỳ

| Kịch bản | Người trình bày | Kết quả phải thấy |
| --- | --- | --- |
| Guest đăng ký và đăng nhập Member; thử truy cập API Admin | Anh | Member được tạo; truy cập Admin bị từ chối |
| Admin tạo gói/PT và khóa một tài khoản | Huy | Danh mục thật cập nhật; tài khoản khóa bị chặn |
| Member đăng ký gói; Admin xác nhận paid | Hiếu + Huy | pending/unpaid → paid/active; có paidAt |
| Hai Member tranh cùng slot; hủy rồi đặt lại | Hiếu | Chỉ một booking hợp lệ; cancelled giữ lịch sử và giải phóng chỗ |
| PT xem lịch, tạo giáo án, completed và ghi tiến độ | Anh | Chỉ PT liên quan được thao tác; Member đọc được kết quả |
| Member gửi đánh giá; thử gửi lại/sửa tài nguyên người khác | Hiếu + Anh | Review duy nhất; lỗi quyền/trùng; điểm PT cập nhật |
| Admin lọc doanh thu theo kỳ | Huy | Chỉ paid được tính; tổng khớp dữ liệu mẫu nghiệm thu |
| Tải lại trang và khởi động lại ứng dụng | Cả nhóm | Dữ liệu còn trong MongoDB; README đủ để chạy lại |

Tài liệu liên quan: [SRS](02-srs.md), [thiết kế hệ thống](03-system-design.md), [database](04-database-design.md), [kiểm thử](05-setup-and-testing.md), [tối ưu MongoDB](06-mongodb-optimization.md), [diagram](diagram/README.md).
