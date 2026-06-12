import React, { useState } from 'react';
import { Truck, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductInfo = ({ product, onBuyNow }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product._id || product.id);
  const hasSizes = Array.isArray(product.size) && product.size.length > 0;
  const canAddToCart = !hasSizes || selectedSize !== '';

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addToCart(product, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    if (!canAddToCart) return;
    onBuyNow(selectedSize);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-serif italic mb-2">{product.name}</h1>
        <p className="text-2xl text-gray-700">${product.price.toFixed(2)}</p>
        <p className="text-xs text-gray-400 mt-2">Đã bao gồm thuế. Phí vận chuyển tính tại trang thanh toán.</p>
      </div>

      <div className="py-4">
        <p className="text-gray-600 leading-relaxed text-sm">
          {product.description || "Một sản phẩm mang đậm phong cách ARUME, sự kết hợp hoàn hảo giữa thiết kế đương đại và chất liệu cao cấp. Từng đường nét được chăm chút tỉ mỉ để mang đến trải nghiệm tuyệt vời nhất."}
        </p>
      </div>

      {/* Size picker — chỉ hiển thị khi sản phẩm có size */}
      {hasSizes && (
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Kích thước
            {selectedSize && (
              <span className="ml-2 text-gray-400 font-normal normal-case tracking-normal">
                — {selectedSize}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.size.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s === selectedSize ? '' : s)}
                className={`px-4 py-2 text-sm border transition-all duration-200
                  ${selectedSize === s
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'border-gray-300 text-gray-700 hover:border-black dark:border-gray-600 dark:text-gray-300 dark:hover:border-white'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
          {!selectedSize && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              ⚠ Vui lòng chọn kích thước trước khi thêm vào giỏ
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))} 
            className="w-16 p-3 border border-gray-300 text-center bg-transparent focus:outline-none"
          />
          <button 
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            title={!canAddToCart ? 'Vui lòng chọn kích thước' : undefined}
            className="flex-1 bg-black text-white py-3 hover:bg-gray-800 transition tracking-widest text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            THÊM VÀO GIỎ
          </button>
          <button 
            onClick={() => toggleWishlist(product)}
            className="w-12 h-12 flex items-center justify-center border border-gray-300 hover:border-black transition dark:border-gray-700 dark:hover:border-white"
          >
            <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400"} />
          </button>
        </div>
        <button 
          onClick={handleBuyNow}
          disabled={!canAddToCart}
          title={!canAddToCart ? 'Vui lòng chọn kích thước' : undefined}
          className="w-full border border-black py-3 font-semibold tracking-widest text-sm hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          MUA NGAY
        </button>
      </div>

      <div className="border-t border-b border-gray-200 py-6 my-4 space-y-4">
        <div className="flex items-center gap-3 text-sm text-gray-700"><Truck size={18} /> <span>Giao hàng miễn phí cho đơn từ $100</span></div>
        <div className="flex items-center gap-3 text-sm text-gray-700"><RotateCcw size={18} /> <span>Đổi trả dễ dàng trong 30 ngày</span></div>
        <div className="flex items-center gap-3 text-sm text-gray-700"><ShieldCheck size={18} /> <span>Bảo hành chính hãng 1 năm</span></div>
      </div>
    </div>
  );
};

export default ProductInfo;