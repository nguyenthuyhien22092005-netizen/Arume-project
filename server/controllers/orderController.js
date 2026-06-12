const mongoose = require('mongoose');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, shippingAddress, address, paymentMethod, couponCode } = req.body;

        if (!items || items.length === 0) {
            throw new Error('Đơn hàng phải có ít nhất 1 sản phẩm');
        }

        const shipping = shippingAddress || {
            name: req.user.name || 'Khách hàng',
            phone: '',
            address: address || '',
            province: '',
        };

        if (!shipping.address || !shipping.address.trim())
            throw new Error('Vui lòng nhập địa chỉ giao hàng');
        if (!shipping.phone || !shipping.phone.trim())
            throw new Error('Vui lòng nhập số điện thoại');

        // ── 1. Tính toán giá và kiểm tra tồn kho từ DB ──────────────────────────
        let calculatedTotalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                throw new Error(`Sản phẩm (ID: ${item.product}) không tồn tại`);
            }

            // Kiểm tra tồn kho
            if (product.stock < item.quantity) {
                throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} chiếc trong kho`);
            }

            // Trừ tồn kho luôn trong transaction
            product.stock -= item.quantity;
            await product.save({ session });

            calculatedTotalPrice += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                size: item.size || '',
                price: product.price // Lưu giá thực tế tại thời điểm mua
            });
        }

        // ── 2. Xử lý coupon trên giá trị đã tính toán ───────────────────────
        let discountAmount = 0;
        let shippingDiscount = 0;
        let finalPrice = calculatedTotalPrice;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() }).session(session);
            if (coupon && coupon.isActive) {
                const now = new Date();
                const isValid =
                    (!coupon.startDate || now >= coupon.startDate) &&
                    (!coupon.endDate || now <= coupon.endDate) &&
                    (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
                    (calculatedTotalPrice >= coupon.minOrderValue);

                // Kiểm tra khách hàng mới
                let newCustomerOk = true;
                if (coupon.newCustomerOnly) {
                    const previousOrders = await Order.countDocuments({ user: req.user.id }).session(session);
                    if (previousOrders > 0) newCustomerOk = false;
                }

                // Kiểm tra hạng thành viên
                let tierOk = true;
                if (coupon.requiredTier !== 'ALL') {
                    // Cần lấy user.memberTier để kiểm tra
                    const buyer = await User.findById(req.user.id).session(session);
                    const userTier = buyer ? buyer.memberTier : 'MEMBER';
                    
                    if (coupon.requiredTier === 'VIP' && userTier !== 'VIP') tierOk = false;
                    if (coupon.requiredTier === 'GOLD' && !['GOLD', 'VIP'].includes(userTier)) tierOk = false;
                }

                if (isValid && newCustomerOk && tierOk) {
                    if (coupon.type === 'percent') {
                        discountAmount = calculatedTotalPrice * (coupon.value / 100);
                        if (coupon.maxDiscount !== null)
                            discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                    } else if (coupon.type === 'fixed') {
                        discountAmount = Math.min(coupon.value, calculatedTotalPrice);
                    } else if (coupon.type === 'freeship') {
                        shippingDiscount = coupon.value;
                    }

                    discountAmount = Math.round(discountAmount * 100) / 100;
                    finalPrice = Math.max(0, calculatedTotalPrice - discountAmount);
                    appliedCoupon = coupon;

                    // Tăng usedCount
                    coupon.usedCount += 1;
                    await coupon.save({ session });
                } else {
                    if (!tierOk) {
                        throw new Error(`Mã giảm giá này chỉ dành cho thành viên hạng ${coupon.requiredTier}`);
                    }
                    throw new Error('Mã giảm giá không hợp lệ hoặc không đủ điều kiện áp dụng');
                }
            } else {
                throw new Error('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa');
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        const newOrder = new Order({
            user: req.user.id,
            items: orderItems,
            totalPrice: finalPrice,
            originalPrice: calculatedTotalPrice,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            discountAmount,
            shippingDiscount,
            shippingAddress: shipping,
            address: [shipping.address, shipping.district, shipping.province].filter(Boolean).join(', '),
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: 'Chưa thanh toán',
            // COD: tạo đơn thẳng vào "Đang xử lý" vì không cần chờ tiền
            // bank/momo/ewallet: "Chờ thanh toán" cho đến khi admin xác nhận đã nhận tiền
            status: paymentMethod === 'cod' ? 'Đang xử lý' : 'Chờ thanh toán',
            trackingHistory: [{
                status: paymentMethod === 'cod' ? 'Đang xử lý' : 'Chờ thanh toán',
                description: paymentMethod === 'cod'
                    ? 'Đơn hàng COD đã được đặt thành công, đang chờ xác nhận'
                    : 'Đơn hàng đã được tạo, đang chờ xác nhận thanh toán chuyển khoản',
                timestamp: new Date(),
            }]
        });

        await newOrder.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        const populated = await Order.findById(newOrder._id)
            .populate('user', 'name email')
            .populate('items.product', 'name image price');

        // Gửi email xác nhận đơn hàng (không await để không làm chậm response)
        const userEmail = populated.user?.email || (req.user && req.user.email);
        const shippingEmail = populated.shippingAddress?.email;
        const emailTarget = shippingEmail || userEmail;

        if (emailTarget) {
            sendOrderConfirmationEmail(emailTarget, populated.toObject())
                .catch(err => console.error('[EMAIL] Lỗi gửi xác nhận đơn hàng:', err.message));
        }

        res.status(201).json(populated);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('createOrder error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Khách hàng xác nhận đã chuyển khoản
exports.confirmPayment = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId, user: req.user.id });

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        if (order.paymentStatus === 'Đã thanh toán') {
            return res.status(400).json({ error: 'Đơn hàng này đã được xác nhận thanh toán trước đó' });
        }

        // Cập nhật trạng thái
        order.paymentStatus = 'Đã thanh toán';
        order.trackingHistory.push({
            status: order.status,
            description: 'Khách hàng đã báo cáo chuyển khoản thành công',
            timestamp: new Date()
        });

        await order.save();
        res.json({ message: 'Xác nhận thanh toán thành công', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Khách hàng tự hủy đơn
exports.cancelMyOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        if (order.status !== 'Đang xử lý' && order.status !== 'Chờ thanh toán') {
            return res.status(400).json({ message: "Không thể hủy đơn hàng ở trạng thái này" });
        }

        order.status = 'Đã hủy';
        order.trackingHistory.push({
            status: 'Đã hủy',
            description: 'Khách hàng tự hủy đơn',
            updatedBy: req.user.id
        });
        await order.save();

        // Hoàn lại tồn kho
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        res.json({ message: "Đã hủy đơn hàng thành công", order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};