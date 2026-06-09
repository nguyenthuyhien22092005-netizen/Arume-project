const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        size: String,
        price: Number, // snapshot giá lúc đặt
    }],
    totalPrice: { type: Number, required: true },
    // Thông tin giảm giá
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    shippingDiscount: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 }, // Giá trước giảm
    status: {
        type: String,
        enum: ['Chờ thanh toán', 'Đang xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'],
        default: 'Đang xử lý'
    },
    // Địa chỉ giao hàng đầy đủ
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,
        address: { type: String, required: true },
        district: String,
        province: { type: String, required: true },
        note: String,
    },
    // Giữ trường address string cho tương thích ngược
    address: { type: String },
    paymentMethod: {
        type: String,
        enum: ['momo', 'bank', 'cod', 'ewallet'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['Chưa thanh toán', 'Đã thanh toán'],
        default: 'Chưa thanh toán'
    },
    // Tracking vận chuyển
    trackingNumber: { type: String },
    trackingHistory: [{
        status: String,
        description: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: String, // admin name/id
    }],
    // Ghi chú nội bộ của admin
    adminNote: { type: String },
    // Mã đơn hiển thị cho khách
    orderCode: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Auto generate orderCode
orderSchema.pre('save', function () {
    if (!this.orderCode) {
        const ts = Date.now().toString(36).toUpperCase();
        this.orderCode = `ARU-${ts}`;
    }
    // Sync address string
    if (this.shippingAddress && this.shippingAddress.address) {
        this.address = [
            this.shippingAddress.address,
            this.shippingAddress.district,
            this.shippingAddress.province
        ].filter(Boolean).join(', ');
    }
});

module.exports = mongoose.model('Order', orderSchema);