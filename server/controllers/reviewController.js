const Review = require('../models/Review');
const Order = require('../models/Order');

// 1. Lấy tất cả review của 1 sản phẩm
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { sort = 'newest', rating } = req.query;

        const filter = { product: productId };
        if (rating) filter.rating = Number(rating);

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };
        if (sort === 'helpful') sortOption = { helpful: -1, createdAt: -1 };

        const reviews = await Review.find(filter).sort(sortOption);

        // Tính thống kê
        const allReviews = await Review.find({ product: productId });
        const totalReviews = allReviews.length;
        const avgRating = totalReviews
            ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        const distribution = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: allReviews.filter(r => r.rating === star).length,
            percent: totalReviews
                ? Math.round((allReviews.filter(r => r.rating === star).length / totalReviews) * 100)
                : 0,
        }));

        res.status(200).json({ reviews, totalReviews, avgRating: Number(avgRating), distribution });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Thêm review mới (phải đăng nhập)
exports.createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, title, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Vui lòng nhập đánh giá và nhận xét' });
        }

        // Kiểm tra đã mua chưa
        const hasPurchased = await Order.exists({
            user: req.user.id,
            'items.product': productId,
            status: { $in: ['delivered', 'completed'] },
        });

        const existing = await Review.findOne({ product: productId, user: req.user.id });
        if (existing) {
            return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }

        const review = new Review({
            product: productId,
            user: req.user.id,
            userName: req.user.name || req.user.email?.split('@')[0] || 'Khách hàng',
            rating: Number(rating),
            title: title?.trim(),
            comment: comment.trim(),
            verifiedPurchase: !!hasPurchased,
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }
        res.status(400).json({ message: error.message });
    }
};

// 3. Cập nhật review của chính mình
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;

        const review = await Review.findOne({ _id: reviewId, user: req.user.id });
        if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

        if (rating) review.rating = Number(rating);
        if (title !== undefined) review.title = title.trim();
        if (comment) review.comment = comment.trim();

        await review.save();
        res.status(200).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Xóa review (chính mình hoặc admin)
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const filter = req.user.isAdmin
            ? { _id: reviewId }
            : { _id: reviewId, user: req.user.id };

        const review = await Review.findOneAndDelete(filter);
        if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

        res.status(200).json({ message: 'Đã xóa đánh giá' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 5. Vote helpful
exports.voteHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

        const alreadyVoted = review.helpfulVoters.includes(userId);
        if (alreadyVoted) {
            review.helpfulVoters.pull(userId);
            review.helpful = Math.max(0, review.helpful - 1);
        } else {
            review.helpfulVoters.push(userId);
            review.helpful += 1;
        }

        await review.save();
        res.status(200).json({ helpful: review.helpful, voted: !alreadyVoted });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
