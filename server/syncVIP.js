require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

async function syncVIP() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB. Bắt đầu đồng bộ VIP...');

        const users = await User.find();
        let updatedCount = 0;

        for (const user of users) {
            // Lấy tất cả đơn hàng đã giao hoặc đã thanh toán của user này
            const orders = await Order.find({
                user: user._id,
                $or: [
                    { status: 'Đã giao' },
                    { paymentStatus: 'Đã thanh toán' }
                ]
            });

            // Tính tổng tiền
            const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

            // Xác định hạng
            let tier = 'MEMBER';
            if (totalSpent >= 5000) tier = 'VIP';
            else if (totalSpent >= 1000) tier = 'GOLD';

            // Đánh dấu các đơn này đã được tính để sau này không bị tính đúp
            await Order.updateMany(
                { _id: { $in: orders.map(o => o._id) } },
                { $set: { isCountedTowardsVIP: true } }
            );

            // Cập nhật User
            user.totalSpent = totalSpent;
            user.memberTier = tier;
            await user.save();

            console.log(`User ${user.email} -> Đã mua: $${totalSpent.toFixed(2)} -> Hạng: ${tier}`);
            updatedCount++;
        }

        console.log(`\nHoàn tất! Đã đồng bộ ${updatedCount} khách hàng.`);
    } catch (err) {
        console.error('Lỗi đồng bộ:', err);
    } finally {
        await mongoose.disconnect();
    }
}

syncVIP();
