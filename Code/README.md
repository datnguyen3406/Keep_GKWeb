# Ứng dụng Ghi chú PWA

Ứng dụng ghi chú dùng HTML, CSS và JavaScript thuần (Vanilla JS). Dữ liệu được lưu trên thiết bị bằng `localStorage`, cho phép tạo, xem, cập nhật và xóa ghi chú hoàn toàn ngoại tuyến. Ghi chú hỗ trợ chụp ảnh trực tiếp từ camera và hẹn giờ nhắc nhở.

## Chạy ứng dụng

Service Worker và camera cần secure context. Chạy qua `http://localhost` hoặc HTTPS; không mở trực tiếp file HTML bằng `file://`.

- VS Code: mở thư mục `Code` bằng Live Server.
- Node.js: chạy `npx http-server .` trong thư mục dự án rồi mở URL được hiển thị.

Giao diện Dark theme mô phỏng phong cách ứng dụng ghi chú hiện đại; bấm “Thêm ghi chú...” để mở hộp soạn thảo.

## Cấu trúc mã nguồn & Tối ưu

- Giao diện được tinh gọn hoàn toàn trong `css/style.css` (thuần CSS3, không phụ thuộc thư viện nặng nề bên thứ ba, tải trang tức thì).
- Bộ biểu tượng PWA đã được tích hợp đầy đủ trong thư mục `assets/icons/` (`icon-192x192.png`, `icon-512x512.png`, `apple-touch-icon.png`, `favicon-32x32.png`), khai báo trong `manifest.json` và lưu cache trong `sw.js`.

## Chức năng và lưu ý

- `js/db.js`: thêm, đọc, cập nhật, xóa ghi chú bằng `localStorage`.
- `js/camera.js`: xin quyền camera, xem trước và chụp ảnh đính kèm. Chỉ hoạt động trên HTTPS hoặc localhost và cần người dùng cấp quyền.
- `js/notification.js`: xin quyền thông báo và hẹn thông báo khi ứng dụng đang mở.
- `js/app.js`: kết nối các chức năng, quản lý trạng thái cài đặt PWA và đăng ký Service Worker.
- `sw.js`: lưu cache toàn bộ tài nguyên ứng dụng phục vụ khi ngoại tuyến và xử lý thông báo push.

## Kiểm thử thủ công

1. Mở ứng dụng bằng Live Server và tạo, tải lại, rồi xóa một ghi chú.
2. Cấp quyền camera để thử chụp và đính kèm ảnh.
3. Cấp quyền thông báo và tạo ghi chú có thời gian nhắc trong tương lai.
4. Mở DevTools > Application để kiểm tra Manifest, Service Worker và Cache Storage; sau khi tải ứng dụng lần đầu, thử chuyển sang chế độ Offline trong tab Network để kiểm tra.

Ghi chú hiện được lưu trên cùng trình duyệt và thiết bị; xóa dữ liệu trang web sẽ xóa các ghi chú.
