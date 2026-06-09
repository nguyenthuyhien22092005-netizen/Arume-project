const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Không có quyền truy cập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: "Người dùng không tồn tại" });
        if (!user.isAdmin) return res.status(403).json({ message: "Không có quyền Admin" });

        req.user = { ...decoded, isAdmin: true };
        next();
    } catch (err) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};
