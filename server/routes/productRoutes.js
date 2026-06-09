const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, syncCart } = require('../controllers/productController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', getAllProducts);
router.post('/sync-cart', syncCart); // ← phải đứng trước /:id để không bị hiểu là id
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', adminMiddleware, createProduct);
router.put('/:id', adminMiddleware, updateProduct);
router.delete('/:id', adminMiddleware, deleteProduct);

module.exports = router;
