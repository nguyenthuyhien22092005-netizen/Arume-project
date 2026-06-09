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
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        // Kiểm tra tính hợp lệ của định dạng chuỗi ObjectId MongoDB
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Định dạng ID đơn hàng không hợp lệ' });
        }

        // Lấy thông tin kiểm tra xem tài khoản có phải Admin không
        const user = await User.findById(req.user.id).select('isAdmin');
        const isAdmin = user?.isAdmin === true;

        // Thiết lập bộ lọc: Nếu là Admin thì tìm theo ID đơn, nếu là User thường thì ép thêm điều kiện đúng chủ sở hữu
        const filter = isAdmin
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };

        const order = await Order.findOne(filter)
            .populate('items.product', 'name image price category')
            .populate('user', 'name email');

        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập' });
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

        const updateData = {
            status,
            $push: {
                trackingHistory: {
                    status,
                    description: description || statusDescriptions[status] || `Trạng thái cập nhật: ${status}`,
                    timestamp: new Date(),
                    updatedBy: req.user?.name || 'Admin',
                }
            }
        };

        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (adminNote !== undefined) updateData.adminNote = adminNote;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('user', 'name email')
            .populate('items.product', 'name image price');

        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
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