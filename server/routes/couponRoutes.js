const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ─── POST /api/coupons/validate ───────────────────────────────────────────────
// Kiểm tra mã giảm giá (cần đăng nhập)
router.post('/validate', authMiddleware, async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        console.log('[Coupon Validate] code:', code, '| orderValue:', orderValue, '| user:', req.user?.id);

        if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' });
        if (orderValue == null || Number(orderValue) <= 0)
            return res.status(400).json({ error: 'Giá trị đơn hàng không hợp lệ' });

        const numericOrderValue = Number(orderValue);
        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
        console.log('[Coupon Validate] Found coupon:', coupon ? coupon.code : 'NOT FOUND');

        if (!coupon) return res.status(404).json({ error: 'Mã giảm giá không hợp lệ' });
        if (!coupon.isActive) return res.status(400).json({ error: 'Mã giảm giá đã bị vô hiệu hoá' });

        // Kiểm tra thời hạn (chỉ check nếu có endDate)
        const now = new Date();
        if (coupon.endDate && now > coupon.endDate)
            return res.status(400).json({ error: 'Mã giảm giá đã hết hạn' });

        // Kiểm tra giới hạn dùng
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
            return res.status(400).json({ error: 'Mã giảm giá đã được sử dụng hết' });

        // Kiểm tra đơn tối thiểu
        if (numericOrderValue < coupon.minOrderValue)
            return res.status(400).json({
                error: `Đơn hàng tối thiểu $${coupon.minOrderValue.toFixed(2)} để dùng mã này`
            });

        // Kiểm tra khách hàng mới
        if (coupon.newCustomerOnly) {
            const previousOrders = await Order.countDocuments({ user: req.user.id });
            if (previousOrders > 0)
                return res.status(400).json({ error: 'Mã giảm giá chỉ dành cho khách hàng đặt lần đầu' });
        }

        // Tính giảm giá
        let discountAmount = 0;
        let shippingDiscount = 0;

        if (coupon.type === 'percent') {
            discountAmount = numericOrderValue * (coupon.value / 100);
            if (coupon.maxDiscount !== null) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        } else if (coupon.type === 'fixed') {
            discountAmount = Math.min(coupon.value, numericOrderValue);
        } else if (coupon.type === 'freeship') {
            shippingDiscount = coupon.value;
            discountAmount = 0;
        }

        discountAmount = Math.round(discountAmount * 100) / 100;
        console.log('[Coupon Validate] discountAmount:', discountAmount, '| shippingDiscount:', shippingDiscount);

        return res.json({
            valid: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                description: coupon.description,
            },
            discountAmount,
            shippingDiscount,
            finalPrice: Math.max(0, numericOrderValue - discountAmount),
        });

    } catch (err) {
        console.error('[Coupon Validate] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── ADMIN: Lấy tất cả mã ─────────────────────────────────────────────────────
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ADMIN: Tạo mã mới ────────────────────────────────────────────────────────
router.post('/', adminMiddleware, async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json(coupon);
    } catch (err) {
        if (err.code === 11000)
            return res.status(400).json({ error: 'Mã này đã tồn tại' });
        res.status(400).json({ error: err.message });
    }
});

// ─── ADMIN: Cập nhật mã ───────────────────────────────────────────────────────
router.put('/:id', adminMiddleware, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!coupon) return res.status(404).json({ error: 'Không tìm thấy mã' });
        res.json(coupon);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ─── ADMIN: Xóa mã ────────────────────────────────────────────────────────────
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa mã giảm giá' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ─── ADMIN: Seed mã mặc định ─────────────────────────────────────────────────
router.post('/seed', adminMiddleware, async (req, res) => {
    try {
        const defaultCoupons = [
            {
                code: 'WELCOME30',
                type: 'percent',
                value: 30,
                maxDiscount: 50,
                minOrderValue: 0,
                newCustomerOnly: true,
                description: 'Giảm 30% cho khách hàng đặt lần đầu (tối đa $50)',
                isActive: true,
                endDate: null,
            },
            {
                code: 'FREESHIP200',
                type: 'freeship',
                value: 3,
                minOrderValue: 200,
                newCustomerOnly: false,
                description: 'Miễn phí vận chuyển nhanh (+$3) cho đơn từ $200',
                isActive: true,
                endDate: null,
            },
            {
                code: 'WOMENSDAY',
                type: 'percent',
                value: 15,
                maxDiscount: 30,
                minOrderValue: 0,
                newCustomerOnly: false,
                description: 'Sale 8/3 – Giảm 15% (tối đa $30)',
                startDate: new Date('2025-03-07'),
                endDate: new Date('2025-03-09'),
                isActive: false, // tắt mặc định, bật khi đến ngày
            },
            {
                code: 'ARUME10',
                type: 'percent',
                value: 10,
                maxDiscount: 20,
                minOrderValue: 50,
                newCustomerOnly: false,
                description: 'Giảm 10% cho đơn từ $50',
                isActive: true,
                endDate: null,
            },
        ];

        let created = 0;
        let skipped = 0;
        for (const c of defaultCoupons) {
            try {
                await Coupon.create(c);
                created++;
            } catch (e) {
                if (e.code === 11000) skipped++;
                else throw e;
            }
        }
        res.json({ message: `Đã tạo ${created} mã, bỏ qua ${skipped} mã đã tồn tại` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
