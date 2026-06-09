const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/payment');
const couponRoutes = require('./routes/couponRoutes');
const contactRoutes = require('./routes/contactRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminReviewRoutes = require('./routes/adminReviewRoutes');
require('dotenv').config();

const app = express();

// 1. Kết nối Cơ sở dữ liệu
connectDB();

// 2. Cấu hình CORS & Middleware hệ thống
const allowedOrigins = [
    'http://localhost:5173',
    'https://arume-project.vercel.app',
    'https://arume-project-21wl.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Nếu không có origin (ví dụ: Postman hoặc các request server-to-server) thì cho qua
        if (!origin) {
            return callback(null, true);
        }

        // Kiểm tra xem origin có nằm trong danh sách cố định không
        const isAllowed = allowedOrigins.includes(origin);

        // Kiểm tra xem origin có phải là subdomain dạng preview của Vercel hay không (chứa ".vercel.app")
        const isVercelPreview = origin.endsWith('.vercel.app') || origin.includes('.vercel.app');

        if (isAllowed || isVercelPreview) {
            callback(null, true);
        } else {
            // Log ra để dev biết origin nào đang bị hệ thống chặn lại
            console.log(`[CORS Blocked] Request từ origin lạ: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true, // Bắt buộc phải có nếu frontend cấu hình axios gửi cookie/token
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Bổ sung thêm 'Origin' vào danh sách cho phép thông quan của trình duyệt
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200 // Trả về 200 cho các request OPTIONS (Preflight) để trình duyệt không chặn
}));

// Đọc dữ liệu JSON từ body của request
app.use(express.json());

// 3. Định tuyến các API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);

// 4. Cấu hình Port và Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=== SERVER ARUME IS RUNNING ===`);
    console.log(`Port: ${PORT}`);
    console.log(`===============================`);
});