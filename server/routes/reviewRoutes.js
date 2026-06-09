const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams để lấy :productId từ parent
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Review = require('../models/Review');
const {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    voteHelpful,
} = require('../controllers/reviewController');

// Public
router.get('/', getProductReviews);

// Cần đăng nhập
router.post('/', authMiddleware, createReview);
router.put('/:reviewId', authMiddleware, updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);
router.post('/:reviewId/helpful', authMiddleware, voteHelpful);

module.exports = router;
