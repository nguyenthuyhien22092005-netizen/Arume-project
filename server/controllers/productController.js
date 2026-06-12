const Product = require('../models/Product');

// 1. Lấy toàn bộ sản phẩm (hỗ trợ query: ?isBestSeller=true, ?category=..., ?collectionName=...)
exports.getAllProducts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.isBestSeller === 'true') filter.isBestSeller = true;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.collectionName) filter.collectionName = req.query.collectionName;
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Lấy chi tiết 1 sản phẩm theo ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Thêm sản phẩm mới (Admin)
exports.createProduct = async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Tên sản phẩm là bắt buộc' });
        if (!price || isNaN(price) || price < 0) return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ' });
        if (stock === undefined || isNaN(stock) || stock < 0) return res.status(400).json({ message: 'Tồn kho không hợp lệ' });

        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 5. Đồng bộ giá và tồn kho cho giỏ hàng
// POST /api/products/sync-cart
// Body: { ids: ["id1", "id2", ...] }
// Trả về mảng { _id, price, stock } để client cập nhật giỏ hàng
exports.syncCart = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'ids phải là mảng không rỗng' });
        }

        const products = await Product.find(
            { _id: { $in: ids } },
            '_id name price stock size' // chỉ lấy các trường cần thiết
        );

        // Map theo _id để client dễ tra cứu
        const result = {};
        products.forEach(p => {
            result[p._id.toString()] = {
                name: p.name,
                price: p.price,
                stock: p.stock,
                size: p.size,  // đồng bộ danh sách size từ DB
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.status(200).json({ message: 'Sản phẩm đã được xóa!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};