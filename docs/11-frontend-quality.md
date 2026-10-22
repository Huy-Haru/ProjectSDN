# Kiểm tra chất lượng frontend dùng chung

Ngày: 23/10/2026. Nhánh HuyNHHE190724. Đây là phần dọn lỗi phục vụ H4, không bổ sung nghiệp vụ Member/PT.

## Lỗi đã xử lý

- 39 lỗi ESLint ban đầu: 30 import không dùng, 3 prop binding không dùng, 4 modal đồng bộ state trong effect, 1 lỗi tải profile trước khai báo hàm và 1 effect tải lịch gây cập nhật state đồng bộ.
- Các import React mặc định không dùng được bỏ vì dự án dùng JSX transform tự động; không xóa import hook đang được dùng.
- Modal quản lý gói/PT, đánh giá PT và cập nhật tiến độ có form con được khởi tạo khi mở. Đóng sẽ unmount, mở lại lấy dữ liệu ban đầu; đổi đối tượng dùng key để không giữ nhầm draft của người/gói trước.
- Profile dùng phản hồi API bất đồng bộ và cleanup khi rời trang; không đưa setState đồng bộ vào effect.
- Lịch PT dùng hook useApiResource: loading/error theo key của bộ lọc, bỏ phản hồi cũ sau đổi filter hoặc unmount, vẫn giữ API/quyền nghiệp vụ hiện có. Không tắt rule hoặc dùng timer để né cảnh báo.

## Kiểm chứng

`npm run lint` đạt **toàn frontend**, thay cho chỉ lint riêng Admin trong job CI frontend. `npm run lint:admin` vẫn được giữ để kiểm tra nhanh phạm vi Admin. Build production và browser UAT local đạt.

Bộ `npm run test:admin:ui` bổ sung:

1. Admin mở profile và đọc dữ liệu thật.
2. Đăng nhập PT, đổi filter booked → completed khi phản hồi booked bị cố tình làm chậm; kết quả completed vẫn giữ sau khi phản hồi cũ đến.
3. Sửa nháp modal gói, đóng/mở tạo mới: không còn nháp cũ.
4. Đổi PT đang sửa: form lấy tên đối tượng mới.
5. Đóng/mở modal review với PT khác: chọn đúng PT mới.
6. Đổi hội viên trong modal tiến độ: không giữ cân nặng nháp của người trước.

Harness frontend/tests/modal-harness.jsx chỉ được tải bởi script UAT trên Vite server cô lập; không có đường import từ application entry nên không được đưa vào production bundle. Dữ liệu test nằm trong database tạm; screenshot/test output bị Git ignore.

Các API, database schema, cách tính buổi/giá/doanh thu và quyền Member/PT không đổi. Những màn hình Member còn dữ liệu mẫu vẫn cần nhóm tích hợp; full lint không chứng minh các nghiệp vụ đó đã hoàn thành.
