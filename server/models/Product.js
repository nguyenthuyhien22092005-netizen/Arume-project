const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    description: String,
    image: String,
    images: [String],
    category: { type: String },
    collectionName: { type: String },   // đổi từ "collection" (reserved)
    jewelleryType: { type: String },
    stock: { type: Number, default: 0 },
    material: String,
    goldType: String,
    size: [String],
    isNewProduct: { type: Boolean, default: false },   // đổi từ "isNew" (reserved)
    isBestSeller: { type: Boolean, default: false },
    isLimitedEdition: { type: Boolean, default: false },
    weight: String,
    gemstone: String,
    certification: String,
    tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
