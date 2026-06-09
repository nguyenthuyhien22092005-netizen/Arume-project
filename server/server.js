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
].filter(Boolean); // Loại bỏ các giá trị undefined hoặc null nếu biến môi trường chưa có

app.use(cors({
    origin: (origin, callback) => {
        // Cho phép các request không có origin (như Postman, ứng dụng di động) 
        // hoặc các origin nằm trong danh sách được định nghĩa trước
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Trả về false thay vì ném ra Error để tránh làm sập (crash) server Node.js trên Railway
            callback(null, false);
        }
    },
    credentials: true, // Cho phép gửi cookie, headers định danh từ client
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Đọc dữ liệu JSON từ body của request
app.use(express.json());

// 3. Định tuyến các API Routes (Bắt buộc nằm dưới Middleware CORS)
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
    console.log(`Allowed Origins:`, allowedOrigins);
    console.log(`===============================`);
});