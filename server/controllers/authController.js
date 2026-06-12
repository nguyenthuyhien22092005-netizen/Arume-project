const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendForgotPasswordEmail } = require('../utils/emailService');

// Đăng ký
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email đã được sử dụng' });
        
        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, memberTier: user.memberTier, totalSpent: user.totalSpent, defaultAddress: user.defaultAddress }
        });
    } catch (err) { res.status(400).json({ error: err.message }); }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                token,
                user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, memberTier: user.memberTier, totalSpent: user.totalSpent, defaultAddress: user.defaultAddress }
            });
        } else {
            res.status(401).json({ message: "Sai email hoặc mật khẩu" });
        }
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Quên mật khẩu - gửi mã OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });

        // Tạo mã reset 6 chữ số
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 phút

        user.resetPasswordCode = resetCode;
        user.resetPasswordExpiry = resetCodeExpiry;
        await user.save();

        // Gửi email OTP thật qua Nodemailer
        await sendForgotPasswordEmail(email, user.name, resetCode);
        
        res.json({ message: "Mã xác nhận đã được gửi đến email của bạn" });
    } catch (err) {
        // Log chi tiết để debug trên Railway
        console.error("❌ [forgotPassword] Lỗi:", err.message);
        res.status(500).json({ message: "Không thể gửi email. Vui lòng thử lại sau." });
    }
};

// Xác thực OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpiry: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });
        res.json({ message: "Mã xác nhận hợp lệ" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });

        user.password = newPassword;
        user.resetPasswordCode = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.json({ message: "Đặt lại mật khẩu thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Đăng nhập Google (OAuth callback)
exports.googleAuth = async (req, res) => {
    try {
        const { googleId, name, email, avatar } = req.body;
        
        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        
        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                avatar,
                password: crypto.randomBytes(20).toString('hex'),
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.avatar = avatar;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, avatar: user.avatar, memberTier: user.memberTier, totalSpent: user.totalSpent, defaultAddress: user.defaultAddress }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi đăng nhập Google" });
    }
};

// Lấy thông tin cá nhân hiện tại
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        res.json({
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, avatar: user.avatar, memberTier: user.memberTier, totalSpent: user.totalSpent, defaultAddress: user.defaultAddress }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, defaultAddress } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone; // cho phép chuỗi rỗng
        if (defaultAddress) user.defaultAddress = defaultAddress;

        await user.save();

        res.json({
            message: "Cập nhật thông tin thành công",
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, avatar: user.avatar, memberTier: user.memberTier, totalSpent: user.totalSpent, defaultAddress: user.defaultAddress }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server khi cập nhật thông tin" });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        // Kiểm tra xem user đăng nhập bằng Google không có password thì không cho đổi
        if (!user.password && user.googleId) {
            return res.status(400).json({ message: "Tài khoản Google không thể đổi mật khẩu tại đây" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
        }

        user.password = newPassword;
        await user.save(); // pre-save hook sẽ tự hash password

        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
    }
};