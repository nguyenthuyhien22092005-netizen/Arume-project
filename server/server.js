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

// 1. Kết nối Database
connectDB();

// 2. Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://arume-project.vercel.app',
    'https://arume-project-21wl.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

// 3. Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);

// 4. Lắng nghe port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ARUME đang chạy tại port ${PORT}`));