const express = require('express');
const router = express.Router();
const { createOrder, confirmPayment } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ==============================================================================
// 1. CÁC TUYẾN ĐƯỜNG CỐ ĐỊNH (STATIC ROUTES) - BẮT BUỘC PHẢI ĐẶT TRÊN CÙNG
// ==============================================================================

// ── POST /api/orders - Tạo đơn hàng mới (Yêu cầu đăng nhập) ──────────────────
router.post('/', authMiddleware, createOrder);

// ── GET /api/orders/myorders - Lấy danh sách đơn hàng của Khách hàng hiện tại ─
router.get('/myorders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'name image price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /api/orders/:id/cancel - Hủy đơn hàng ─
const { cancelMyOrder } = require('../controllers/orderController');
router.put('/:id/cancel', authMiddleware, cancelMyOrder);

// ── GET /api/orders - Lấy toàn bộ đơn hàng trong hệ thống (Dành cho Admin) ────
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
        if (req.query.search) {
            filter.$or = [
                { orderCode: { $regex: req.query.search, $options: 'i' } },
                { address: { $regex: req.query.search, $options: 'i' } },
            ];
        }
        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('items.product', 'name image price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==============================================================================
// 2. CÁC TUYẾN ĐƯỜNG CHỨA PARAMETER ĐỘNG (DYNAMIC ROUTES) - PHẢI ĐẶT Ở DƯỚI CÙNG
// ==============================================================================

// ── GET /api/orders/:id - Xem chi tiết một đơn hàng cụ thể ───────────────────
// (Admin có quyền xem hết, User chỉ xem được đơn hàng do chính mình tạo)
// FIX: Bỏ authMiddleware cứng, tự decode token linh hoạt để admin xem được hóa đơn
router.get('/:id', async (req, res) => {
    try {
        // Kiểm tra tính hợp lệ của định dạng chuỗi ObjectId MongoDB
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Định dạng ID đơn hàng không hợp lệ' });
        }

        // Lấy token từ header Authorization
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Không có quyền truy cập, vui lòng đăng nhập' });
        }

        const jwt = require('jsonwebtoken');
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại' });
        }

        // Kiểm tra quyền admin trực tiếp từ DB (đáng tin cậy hơn payload token)
        const user = await User.findById(decoded.id).select('isAdmin');
        if (!user) return res.status(401).json({ error: 'Tài khoản không tồn tại' });

        const isAdmin = user.isAdmin === true;

        // Admin xem được tất cả đơn, user thường chỉ xem đơn của mình
        const filter = isAdmin
            ? { _id: req.params.id }
            : { _id: req.params.id, user: decoded.id };

        const order = await Order.findOne(filter)
            .populate('items.product', 'name image price category')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ 
                error: isAdmin 
                    ? 'Không tìm thấy đơn hàng' 
                    : 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập' 
            });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /api/orders/:id/confirm-payment - Khách hàng bấm báo đã chuyển khoản ──
router.put('/:id/confirm-payment', authMiddleware, confirmPayment);

// ── PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Dành cho Admin) ─
router.put('/:id/status', adminMiddleware, async (req, res) => {
    try {
        const { status, description, trackingNumber, adminNote, paymentStatus } = req.body;
        const validStatuses = ['Chờ thanh toán', 'Đang xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái đơn hàng truyền vào không hợp lệ' });
        }

        const statusDescriptions = {
            'Chờ thanh toán': 'Đơn hàng đang chờ xác nhận thanh toán',
            'Đã xác nhận': 'Đơn hàng đã được xác nhận, đang chuẩn bị hàng',
            'Đang giao': 'Đơn hàng đang được vận chuyển đến địa chỉ của bạn',
            'Đã giao': 'Đơn hàng đã được giao thành công',
            'Đã hủy': 'Đơn hàng đã bị hủy',
        };

        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (adminNote !== undefined) order.adminNote = adminNote;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        order.trackingHistory.push({
            status,
            description: description || statusDescriptions[status] || `Trạng thái cập nhật: ${status}`,
            timestamp: new Date(),
            updatedBy: req.user?.name || 'Admin',
        });

        // ── Xử lý thăng hạng VIP tự động ──
        if (!order.isCountedTowardsVIP && (order.status === 'Đã giao' || order.paymentStatus === 'Đã thanh toán')) {
            order.isCountedTowardsVIP = true;
            const buyer = await User.findById(order.user._id);
            if (buyer) {
                buyer.totalSpent = (buyer.totalSpent || 0) + order.totalPrice;
                // Xét duyệt hạng
                if (buyer.totalSpent >= 5000) buyer.memberTier = 'VIP';
                else if (buyer.totalSpent >= 1000) buyer.memberTier = 'GOLD';
                await buyer.save();
            }
        }

        await order.save();
        await order.populate('items.product', 'name image price');

        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ── DELETE /api/orders/:id - Xóa bỏ đơn hàng khỏi hệ thống (Chỉ dành cho Admin) ─
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xóa' });
        res.json({ message: 'Đã thực hiện xóa đơn hàng thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;