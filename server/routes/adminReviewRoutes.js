const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const Review = require('../models/Review');

// GET /api/admin/reviews - Lấy tất cả đánh giá (Admin)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const { rating, search, sort = 'newest', page = 1, limit = 20 } = req.query;

        const filter = {};
        if (rating) filter.rating = Number(rating);
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { comment: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest')  sortOption = { createdAt: 1 };
        if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'lowest')  sortOption = { rating: 1, createdAt: -1 };
        if (sort === 'helpful') sortOption = { helpful: -1, createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Review.countDocuments(filter);

        const reviews = await Review.find(filter)
            .populate('product', 'name image')
            .populate('user', 'name email')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        // Thống kê tổng hợp
        const allReviews = await Review.find({});
        const totalAll = allReviews.length;
        const avgRating = totalAll
            ? (allReviews.reduce((s, r) => s + r.rating, 0) / totalAll).toFixed(1)
            : 0;
        const distribution = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: allReviews.filter(r => r.rating === star).length,
        }));

        res.json({
            reviews,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            stats: { totalAll, avgRating: Number(avgRating), distribution },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/reviews/:id - Xóa bất kỳ đánh giá nào (Admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
        res.json({ message: 'Đã xóa đánh giá' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
