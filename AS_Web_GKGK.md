# Tổng quan & Cấu trúc Thư mục Dự án Web Ghi chú PWA

Dự án **Note-taking Progressive Web App (PWA)** được thiết kế đơn giản, gọn nhẹ bằng **HTML, CSS, JavaScript (Vanilla JS)** và **Bootstrap 5**. Mọi tính năng PWA cốt lõi đều sử dụng Web APIs nguyên bản để đảm bảo hiệu năng cao và dễ dàng giải thích trong báo cáo cũng như video thuyết trình.

---

## 1. Kiến trúc & Công nghệ Sử dụng

* **Front-end:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 (CDN hoặc file tĩnh).
* **Lưu trữ dữ liệu:** `IndexedDB` hoặc `localStorage` (cho phép đọc/ghi ghi chú hoàn toàn khi Offline).
* **PWA Engine:**
  * `manifest.json`: Định nghĩa biểu tượng, tên app, màu giao diện và chế độ hiển thị `standalone` (giống ứng dụng Native).
  * `sw.js` (Service Worker): Quản lý bộ nhớ Cache (Cache Storage) cho tài nguyên tĩnh và xử lý chiến lược offline.
* **Web APIs tích hợp:**
  * `MediaDevices API` (`navigator.mediaDevices.getUserMedia`): Gọi camera chụp ảnh đính kèm vào ghi chú.
  * `Notification API` & `Push API`: Gửi thông báo nhắc nhở ghi chú.

---

## 2. Sơ đồ Cấu trúc Thư mục Dự án

```text
pwa-note-app/
├── index.html              # Trang chính (Giao diện hiển thị danh sách & tạo ghi chú)
├── manifest.json           # Tệp cấu hình PWA Manifest (để Cài đặt ứng dụng)
├── sw.js                   # Service Worker (Xử lý Offline Cache & Push Notification)
│
├── css/
│   ├── bootstrap.min.css   # Tệp CSS Bootstrap 5 (nên để local để chạy offline)
│   └── style.css           # Custom CSS cho giao diện ghi chú
│
├── js/
│   ├── app.js              # Khởi tạo app, Đăng ký Service Worker & Quản lý PWA install
│   ├── db.js               # Quản lý lưu trữ dữ liệu offline (IndexedDB / LocalStorage)
│   ├── camera.js           # Xử lý bật camera, chụp ảnh và đính kèm vào ghi chú
│   └── notification.js     # Quản lý xin quyền và hiển thị thông báo nhắc nhở
│
├── assets/
│   ├── icons/              # Các biểu tượng icon cho PWA trên điện thoại/máy tính
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── images/             # Hình ảnh minh họa / giao diện mặc định
│
└── README.md               # Hướng dẫn chạy & kiểm thử dự án (bắt buộc theo mã đề)
```

---

## 3. Vai trò Chi tiết của từng Tệp Cốt lõi

### 3.1. `index.html`
* Chứa cấu trúc HTML giao diện (sử dụng các lớp của Bootstrap 5).
* Nhúng `manifest.json` qua thẻ `<link rel="manifest" href="manifest.json">`.
* Chứa khu vực Modal chụp ảnh camera, danh sách ghi chú (Grid/Card), và form tạo ghi chú mới.

### 3.2. `manifest.json`
* Khai báo thông tin để trình duyệt nhận diện ứng dụng có thể cài đặt được:
  * `name`: Tên đầy đủ của ứng dụng ghi chú.
  * `short_name`: Tên ngắn hiển thị dưới Icon màn hình chính.
  * `start_url`: Đường dẫn chạy đầu tiên (`/index.html`).
  * `display`: `"standalone"` (giúp ẩn thanh URL trình duyệt khi mở app).
  * `icons`: Danh sách kích thước icon phục vụ các thiết bị khác nhau.

### 3.3. `sw.js` (Service Worker)
* **Sự kiện `install`:** Lưu tất cả các file tĩnh (`index.html`, `style.css`, `app.js`, `bootstrap.min.css`, icons) vào `CacheStorage`.
* **Sự kiện `activate`:** Dọn dẹp các bản cache cũ khi nâng cấp phiên bản app.
* **Sự kiện `fetch`:** Lắng nghe toàn bộ request mạng. Nếu mất mạng (Offline), sẽ lấy tệp tương ứng từ `CacheStorage` để trả về cho người dùng.

### 3.4. Các tệp JavaScript trong `js/`
* **`app.js`:** Đăng ký `sw.js` với trình duyệt và bắt sự kiện `beforeinstallprompt` để hiển thị nút "Cài đặt ứng dụng".
* **`db.js`:** Đóng gói các hàm `addNote()`, `getNotes()`, `deleteNote()`. Khi không có mạng, dữ liệu ghi chú vẫn được lưu và lấy trực tiếp từ bộ nhớ trình duyệt.
* **`camera.js`:** Điều khiển luồng video từ webcam/camera điện thoại, hiển thị lên thẻ `<video>`, vẽ khung hình sang `<canvas>` để xuất ra dạng ảnh `base64` đính kèm vào ghi chú.
* **`notification.js`:** Yêu cầu quyền gửi thông báo từ người dùng (`Notification.requestPermission()`) và kích hoạt thông báo nhắc nhở khi đến giờ hẹn của ghi chú.

---

## 4. Các Bước Chuẩn bị Triển khai Dự án

1. **Khởi tạo thư mục:** Tạo cấu trúc thư mục như sơ đồ trên.
2. **Tải tài nguyên offline:** Tải bản tệp tĩnh Bootstrap CSS/JS về thư mục `css/` và `js/` thay vì dùng CDN trực tuyến (để ứng dụng tải được hoàn toàn khi mất mạng).
3. **Cấu hình Web Server cục bộ:** Sử dụng VS Code Extension `Live Server` hoặc Node.js `http-server` (Service Worker chỉ chạy trên giao thức `http://localhost` hoặc `https://`).