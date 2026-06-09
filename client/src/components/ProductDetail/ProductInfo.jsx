import React, { useState } from 'react';
import { Truck, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductInfo = ({ product, onBuyNow }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product._id || product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
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
            className="flex-1 bg-black text-white py-3 hover:bg-gray-800 transition tracking-widest text-sm font-semibold"
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
          onClick={onBuyNow}
          className="w-full border border-black py-3 font-semibold tracking-widest text-sm hover:bg-gray-100 transition"
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