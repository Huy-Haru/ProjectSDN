# Giao diện mobile Member và PT

## Thay đổi

Bố cục dưới 768px dùng chung cho cả ba role: menu chuyển lên đầu trang và cuộn ngang trong vùng riêng, nội dung sử dụng toàn bộ chiều ngang. Header xuống dòng khi cần; tên/email dài được ngắt dòng. Bảng lịch PT cuộn trong table-responsive, không đẩy toàn trang sang ngang.

Các nút hành động học viên xuống dòng, tìm kiếm và input không vượt khung, header/profile có thể xuống hàng. Form trên mobile dùng cỡ chữ tối thiểu 16px và nút cao tối thiểu 44px. Chữ text-muted dùng màu sáng phù hợp nền tối thay vì màu Bootstrap mặc định dành cho nền sáng.

Menu có nhãn Điều hướng chính/Tài khoản và aria-current=page cho mục hiện tại; có viền focus khi dùng bàn phím. Không ẩn nội dung bị tràn để làm phép kiểm tra đạt; các vùng cuộn ngang được giới hạn ở menu/bảng.

## Phạm vi kiểm thử tự động

Viewport Chromium/Edge desktop giả lập 375×812, dùng tài khoản và dữ liệu thật trong database tạm:

- PT: Tổng quan HLV, Lịch dạy, Học viên & Giáo án, Đánh giá, Profile (5 màn).
- Member: Tổng quan, Danh sách gói, Gói của tôi, Đặt lịch, Danh sách PT, Lịch tập, Tiến độ, Đánh giá, Profile (9 màn).
- Mỗi màn kiểm tra chiều rộng document, main-content và page-body; main không bị sidebar ép hẹp; mục menu hiện tại có aria-current, nút menu đạt 44px và màu chữ phụ phù hợp nền tối.
- Mở form sửa giáo án ở mobile; Tab từ tên sang mục tiêu đúng thứ tự. Chọn gói và PT trong form đặt lịch mobile.
- Kiểm thử Admin 390px và các luồng nghiệp vụ desktop trước đó vẫn chạy trong cùng suite.

Lệnh frontend: `npm run test:admin:ui`; máy Windows có Edge đặt PLAYWRIGHT_CHANNEL=msedge. Frontend lint và production build đạt. Minh chứng ảnh tại docs/evidence/member-booking-mobile-375.png và trainer-plan-mobile-375.png, được chụp từ dữ liệu kiểm thử riêng, không phải tài khoản thật của phòng tập.

Kiểm thử này không thay nghiệm thu thủ công trên điện thoại thật, Safari/iOS, trình đọc màn hình, tương phản toàn bộ màu sắc hoặc kiểm thử bàn phím toàn hệ thống. NFR mobile được cải thiện và có bằng chứng tự động, chưa tuyên bố đạt toàn bộ tiêu chí accessibility.
