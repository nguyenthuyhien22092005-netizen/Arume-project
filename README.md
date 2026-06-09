# 💍 ARUME — Fine Jewelry E-Commerce

> Dự án môn **Công nghệ Web** — Nhóm 5

---

## 👥 Thành viên nhóm

| Họ và tên | Vai trò |
|---|---|
| Nguyễn Thúy Hiền | Nhóm trưởng |
| Lê Thị Dịu | Thành viên |
| Phạm Thu Ngân | Thành viên |
| Trần Thị Khánh Linh | Thành viên |
| Nguyễn Ngọc Khánh Bình | Thành viên |

---

## 📋 Giới thiệu dự án

**Arume** là website thương mại điện tử chuyên bán trang sức cao cấp, được xây dựng theo mô hình **Fullstack MERN** (MongoDB, Express, React, Node.js).

### Tính năng chính

**Khách hàng:**
- Đăng ký / Đăng nhập (Email + Google OAuth)
- Quên mật khẩu qua OTP gửi email thật (Nodemailer)
- Xem danh sách & chi tiết sản phẩm
- Giỏ hàng với đồng bộ giá thời gian thực
- Wishlist (danh sách yêu thích)
- Đặt hàng với nhiều phương thức thanh toán (COD, chuyển khoản, MoMo)
- Áp dụng mã giảm giá
- Nhận email xác nhận đơn hàng tự động
- Theo dõi & xem lịch sử đơn hàng
- Xuất hóa đơn đơn hàng
- **Đánh giá sản phẩm** (xem, viết, chỉnh sửa, xóa, vote hữu ích)

**Quản trị viên (Admin):**
- Dashboard thống kê doanh thu, đơn hàng
- Quản lý sản phẩm (thêm, sửa, xóa)
- Quản lý đơn hàng & cập nhật trạng thái vận chuyển
- Quản lý mã giảm giá
- Quản lý người dùng
- **Quản lý đánh giá** (xem toàn bộ, lọc, xóa)

---

## 🛠️ Công nghệ sử dụng

| Phần | Công nghệ |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js 5 |
| Database | MongoDB (Mongoose) |
| Xác thực | JWT, Google OAuth |
| Email | Nodemailer + Gmail App Password |
| Thanh toán | COD, Chuyển khoản, MoMo |

---

## ⚙️ Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js >= 18
- MongoDB >= 7.0 (với Replica Set đã bật)
- Git

### Cấu trúc thư mục gốc

```
arume-project/
├── client/     ← Frontend React + Vite
└── server/     ← Backend Node.js + Express
```

---

### Bước 1 — Cài đặt Backend

```bash
cd server
npm install
```

Tạo file `.env` trong thư mục `server/` (xem mẫu `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/arume_db
JWT_SECRET=arume_super_secret_key_2026
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
NODE_ENV=development

# Cấu hình Gmail (tạo App Password tại myaccount.google.com/apppasswords)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

---

### Bước 2 — Cài đặt Frontend

```bash
cd client
npm install
```

Tạo file `.env` trong thư mục `client/` (xem mẫu `.env.example`):

```env
VITE_API_URL=http://localhost:5000
```

---

### Bước 3 — Bật MongoDB Replica Set *(chỉ làm 1 lần)*

Thêm vào file cấu hình `mongod.cfg`:

```yaml
replication:
  replSetName: "rs0"
```

Restart MongoDB service, sau đó mở terminal và chạy:

```bash
mongosh
rs.initiate()
```

---

### Bước 4 — Seed dữ liệu mẫu

```bash
cd server
node seed.js          # Tạo sản phẩm mẫu
node createAdmin.js   # Tạo tài khoản admin mặc định
node seedCoupons.js   # Tạo mã giảm giá mẫu
```

---

### Bước 5 — Chạy dự án

Mở **2 terminal**:

```bash
# Terminal 1 — Backend
cd server
node server.js

# Terminal 2 — Frontend
cd client
npm run dev
```

Truy cập: **http://localhost:5173**

---

## 🔑 Tài khoản mặc định

| Loại | Email | Mật khẩu |
|---|---|---|
| Admin | admin@arume.vn | adminpassword123 |

> Tài khoản khách hàng: đăng ký tự do qua giao diện web.

---

## 📁 Cấu trúc thư mục

```
server/
├── config/         # Kết nối database (db.js)
├── controllers/    # Xử lý logic nghiệp vụ
│   ├── authController.js
│   ├── orderController.js
│   ├── productController.js
│   └── reviewController.js
├── middleware/     # Xác thực JWT, phân quyền Admin
├── models/         # Schema MongoDB
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Coupon.js
│   └── Review.js
├── routes/         # Định nghĩa API endpoints
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── reviewRoutes.js
│   ├── adminReviewRoutes.js
│   ├── couponRoutes.js
│   ├── contactRoutes.js
│   └── payment.js
├── utils/          # emailService.js (Nodemailer)
└── server.js       # Entry point

client/
├── public/         # Assets tĩnh (ảnh, video, icon)
└── src/
    ├── components/ # CartDrawer, CheckoutModal, Header, ...
    │   ├── admin/  # AdminLayout
    │   └── ProductDetail/  # ReviewSection, Gallery, ...
    ├── context/    # CartContext, AuthContext, WishlistContext
    ├── pages/      # Home, ProductList, ProductDetail, Profile, ...
    │   └── admin/  # AdminDashboard, AdminOrders, AdminReviews, ...
    └── api.js      # Axios instance & tất cả API calls
```

---

## 🔗 API Endpoints

### Auth

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/google` | Đăng nhập Google OAuth |
| POST | `/api/auth/forgot-password` | Gửi OTP về email |
| POST | `/api/auth/verify-otp` | Xác thực OTP |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |

### Sản phẩm

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/products` | Lấy danh sách sản phẩm |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products/sync-cart` | Đồng bộ giá giỏ hàng |

### Đơn hàng

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/orders` | Tạo đơn hàng mới |
| GET | `/api/orders/myorders` | Đơn hàng của tôi |
| GET | `/api/orders/:id` | Chi tiết đơn hàng |

### Đánh giá

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/products/:productId/reviews` | Lấy đánh giá của sản phẩm | Public |
| POST | `/api/products/:productId/reviews` | Viết đánh giá mới | Đăng nhập |
| PUT | `/api/products/:productId/reviews/:reviewId` | Chỉnh sửa đánh giá | Đăng nhập |
| DELETE | `/api/products/:productId/reviews/:reviewId` | Xóa đánh giá | Đăng nhập |
| POST | `/api/products/:productId/reviews/:reviewId/helpful` | Vote hữu ích | Đăng nhập |

### Admin — Đánh giá

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/admin/reviews` | Xem toàn bộ đánh giá (lọc, sắp xếp, phân trang) |
| DELETE | `/api/admin/reviews/:id` | Xóa bất kỳ đánh giá nào |

### Mã giảm giá

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/coupons/validate` | Kiểm tra & áp dụng mã giảm giá |

---

## 📌 Lưu ý

- MongoDB **bắt buộc** phải chạy ở chế độ Replica Set (do dự án sử dụng Mongoose transactions).
- Gmail App Password khác với mật khẩu đăng nhập thông thường — xem hướng dẫn tạo tại [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
- Chỉ người dùng đã mua sản phẩm (đơn hàng ở trạng thái `delivered` hoặc `completed`) mới được gắn nhãn **Đã mua hàng** khi đánh giá.
