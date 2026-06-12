require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const coupons = [
        {
            code: 'ARUME10',
            type: 'percent',
            value: 10,
            maxDiscount: 20,
            minOrderValue: 50,
            newCustomerOnly: false,
            description: 'Giam 10% cho don tu 50USD (toi da 20USD)',
            isActive: true,
            startDate: null,
            endDate: null,
        },
        {
            code: 'WELCOME30',
            type: 'percent',
            value: 30,
            maxDiscount: 50,
            minOrderValue: 0,
            newCustomerOnly: true,
            description: 'Giam 30% cho khach hang dat lan dau (toi da 50USD)',
            isActive: true,
            startDate: null,
            endDate: null,
        },
        {
            code: 'FREESHIP200',
            type: 'freeship',
            value: 3,
            minOrderValue: 200,
            newCustomerOnly: false,
            description: 'Mien phi van chuyen nhanh cho don tu 200USD',
            isActive: true,
            startDate: null,
            endDate: null,
        },
        {
            code: 'SALE15',
            type: 'percent',
            value: 15,
            maxDiscount: 30,
            minOrderValue: 0,
            newCustomerOnly: false,
            requiredTier: 'ALL',
            description: 'Giam 15% toan bo san pham (toi da 30USD)',
            isActive: true,
            startDate: null,
            endDate: null,
        },
        {
            code: 'VIP20',
            type: 'percent',
            value: 20,
            maxDiscount: null,
            minOrderValue: 0,
            newCustomerOnly: false,
            requiredTier: 'VIP',
            description: 'Giam 20% dac quyen danh rieng cho thanh vien VIP',
            isActive: true,
            startDate: null,
            endDate: null,
        },
    ];

    let created = 0;
    let updated = 0;
    for (const c of coupons) {
        const existing = await Coupon.findOne({ code: c.code });
        if (existing) {
            await Coupon.findByIdAndUpdate(existing._id, { startDate: null, isActive: true });
            console.log('Updated:', c.code);
            updated++;
        } else {
            await Coupon.create(c);
            console.log('Created:', c.code);
            created++;
        }
    }
    console.log('Done! Created:', created, '| Updated:', updated);
    await mongoose.disconnect();
}
seed().catch(console.error);
