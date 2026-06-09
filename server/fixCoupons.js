/**
 * Script sửa tất cả coupon đang có startDate trong tương lai
 * Chạy: node fixCoupons.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Lấy tất cả coupon
    const coupons = await Coupon.find();
    console.log(`📋 Tổng số coupon: ${coupons.length}`);
    
    for (const c of coupons) {
        console.log(`\n[${c.code}]`);
        console.log(`  isActive: ${c.isActive}`);
        console.log(`  startDate: ${c.startDate}`);
        console.log(`  endDate: ${c.endDate}`);
        console.log(`  minOrderValue: ${c.minOrderValue}`);
        console.log(`  usedCount: ${c.usedCount} / ${c.usageLimit}`);
        
        // Xóa startDate nếu nó đang chặn mã
        if (c.startDate && c.startDate > new Date()) {
            console.log(`  ⚠️  startDate trong tương lai → đặt về null`);
            await Coupon.findByIdAndUpdate(c._id, { $set: { startDate: null } });
        }
    }
    
    console.log('\n✅ Hoàn tất! Tất cả coupon đã được sửa.');
    await mongoose.disconnect();
}

fix().catch(err => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
});
