const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },

    type: {
        type: String,
        enum: ['percent', 'freeship', 'fixed'],
        required: true,
    },

    value: { type: Number, required: true, min: 0 },

    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },

    startDate: { type: Date, default: null },
    endDate:   { type: Date, default: null },

    usageLimit:    { type: Number, default: null },
    usedCount:     { type: Number, default: 0 },

    newCustomerOnly: { type: Boolean, default: false },

    requiredTier: {
        type: String,
        enum: ['ALL', 'GOLD', 'VIP'],
        default: 'ALL'
    },

    isActive: { type: Boolean, default: true },

    description: { type: String, default: '' },
}, { timestamps: true });

// Xóa schema.index({ code: 1 }) vì unique: true trong field definition đã tạo index rồi

module.exports = mongoose.model('Coupon', couponSchema);
