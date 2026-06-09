const express = require('express');
const router = express.Router();
const { createOrder, confirmPayment } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Order = require('../models/Order');

// POST /api/orders - Tạo đơn hàng mới (BẮT BUỘC đăng nhập)
router.post('/', authMiddleware, createOrder);

// PUT /api/orders/:id/confirm-payment - Khách hàng báo đã chuyển khoản
router.put('/:id/confirm-payment', authMiddleware, confirmPayment);

// GET /api/orders/myorders - Lấy đơn hàng của người dùng hiện tại
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

// GET /api/orders/:id - Chi tiết đơn hàng của khách (chỉ xem đơn của mình)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
            .populate('items.product', 'name image price category');
        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// GET /api/orders - Lấy tất cả đơn hàng (Admin)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
        if (req.query.search) {
            // Tìm theo orderCode hoặc địa chỉ
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

// PUT /api/orders/:id/status - Cập nhật trạng thái (Admin)
router.put('/:id/status', adminMiddleware, async (req, res) => {
    try {
        const { status, description, trackingNumber, adminNote, paymentStatus } = req.body;
        const validStatuses = ['Chờ thanh toán', 'Đang xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];
        if (!validStatuses.includes(status))
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });

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

// DELETE /api/orders/:id - Xóa đơn hàng (Admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        res.json({ message: 'Đã xóa đơn hàng' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;