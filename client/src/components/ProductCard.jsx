import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const isFavorite = isInWishlist(product._id || product.id);

  // Hỗ trợ cả dạng dữ liệu từ DB (image) và dạng mock (mainImage/hoverImage)
  const mainImg = product.image || product.mainImage || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80';
  const hoverImg = product.hoverImage || product.image || mainImg;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div className="group relative flex flex-col">
      <Link to={`/product/${product._id || product.id}`}>
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-gray-50">
          {/* Ảnh chính */}
          <img
            src={mainImg}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          {/* Ảnh hover */}
          <img
            src={hoverImg}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Nút yêu thích */}
          <button 
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-black text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
          >
            <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
          </button>

          {/* Badge hết hàng */}
          {product.stock <= 0 && (
            <span className="absolute top-3 left-3 bg-white text-black text-[10px] px-2 py-1 uppercase tracking-widest font-bold">
              Hết hàng
            </span>
          )}

          {/* Nút hành động khi hover — trượt lên từ dưới ảnh */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col z-10">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full bg-white/95 dark:bg-gray-900/95 text-black dark:text-white py-3 text-xs uppercase tracking-widest font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-100 dark:border-gray-800"
            >
              {product.stock <= 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest font-semibold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mua ngay
            </button>
          </div>
        </div>

        <h3 className="text-sm font-light text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
          )}
        </div>
      </Link>
    </div>
  );
};