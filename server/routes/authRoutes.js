const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, googleAuth } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/auth/google - Đăng nhập Google
router.post('/google', googleAuth);

// GET & PUT /api/auth/profile - Thông tin cá nhân
const { getProfile, updateProfile, changePassword } = require('../controllers/authController');
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

// PUT /api/auth/change-password - Đổi mật khẩu
router.put('/change-password', authMiddleware, changePassword);

// GET /api/auth/users - Admin only
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/auth/users/:id - Admin only
router.delete('/users/:id', adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.json({ message: 'Đã xóa người dùng' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
