# Ứng dụng Ghi chú PWA

Ứng dụng ghi chú dùng HTML, CSS, JavaScript thuần và Bootstrap 4.6.2. Dữ liệu được lưu trên thiết bị bằng `localStorage`, nên có thể tạo, xem, cập nhật và xóa ghi chú khi ngoại tuyến. Ghi chú hỗ trợ ảnh chụp từ camera và thời gian nhắc nhở.

## Chạy ứng dụng

Service Worker và camera cần secure context. Chạy qua `http://localhost` hoặc HTTPS; không mở trực tiếp file HTML bằng `file://`.

- VS Code: chạy thư mục này bằng Live Server.
- Node.js: chạy `npx http-server .` trong thư mục dự án rồi mở URL được hiển thị.

Bootstrap 4.6.2 đã được lưu cục bộ tại `css/bootstrap.min.css`. Giao diện tối theo phong cách ứng dụng ghi chú; bấm “Thêm ghi chú...” để mở hộp soạn thảo.

## Tùy chỉnh giao diện và biểu tượng

Tùy chỉnh bố cục tại `index.html`, kiểu riêng tại `css/style.css`. Dự án chỉ dùng Bootstrap 4.x; không thêm Bootstrap 5 hoặc JavaScript của Bootstrap.

Manifest chưa khai báo icon để bạn tự thiết kế. Khi có ảnh biểu tượng, đặt các tệp (ví dụ `assets/icons/icon-192x192.png` và `assets/icons/icon-512x512.png`) vào thư mục `assets/icons/`, khai báo chúng trong `manifest.json`, rồi thêm đường dẫn vào danh sách precache `APP_FILES` trong `sw.js`.

## Chức năng và lưu ý

- `js/db.js`: thêm, đọc, cập nhật, xóa ghi chú bằng `localStorage`.
- `js/camera.js`: xin quyền camera, xem trước và chụp ảnh đính kèm. Chỉ hoạt động trên HTTPS hoặc localhost và cần người dùng cấp quyền.
- `js/notification.js`: xin quyền thông báo và hẹn thông báo khi ứng dụng đang mở. Trình duyệt có thể giới hạn thời gian chạy nền; thông báo push cần máy chủ gửi push và subscription nên chưa được cấu hình.
- `js/app.js`: kết nối các chức năng, trạng thái cài đặt PWA và Service Worker.
- `sw.js`: precache tài nguyên ứng dụng, phục vụ khi ngoại tuyến và xử lý sự kiện push.

## Kiểm thử thủ công

1. Mở ứng dụng bằng Live Server và tạo, tải lại, rồi xóa một ghi chú.
2. Cấp quyền camera để thử chụp và đính kèm ảnh.
3. Cấp quyền thông báo và tạo ghi chú có thời gian nhắc trong tương lai.
4. Mở DevTools > Application để kiểm tra Manifest, Service Worker và Cache Storage; sau khi tải ứng dụng lần đầu, thử chuyển sang offline.

Ghi chú hiện được lưu trên cùng trình duyệt và thiết bị; xóa dữ liệu trang web sẽ xóa các ghi chú.
