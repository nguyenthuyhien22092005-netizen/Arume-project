import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../api';

// Card khớp với ProductCard.jsx
const SignatureCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(product._id || product.id);

  const mainImg =
    product.image ||
    product.mainImage ||
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80';
  const hoverImg = product.hoverImage || mainImg;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Nếu có size → redirect sang trang detail để chọn size
    if (Array.isArray(product.size) && product.size.length > 0) {
      navigate(`/product/${product._id || product.id}`);
      return;
    }
    addToCart(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Nếu có size → redirect sang trang detail để chọn size
    if (Array.isArray(product.size) && product.size.length > 0) {
      navigate(`/product/${product._id || product.id}`);
      return;
    }
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
            <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
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

        <h3 className="text-sm font-light text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
          {product.name}
        </h3>
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

// Skeleton placeholder trong khi load
const SkeletonCard = () => (
  <div className="flex flex-col animate-pulse">
    <div className="aspect-[3/4] bg-gray-200 mb-4" />
    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
    <div className="h-3 bg-gray-200 rounded w-1/4" />
  </div>
);

export const SignatureSet = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 3 })
      .then((res) => {
        // API trả về mảng trực tiếp
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setProducts(data.slice(0, 3));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif mb-2">SỞ HỮU BỘ SƯU TẬP & TIẾT KIỆM 30%</h2>
        <p className="text-gray-600">Chọn đủ 3 món đồ thiết yếu và nhận ưu đãi 30%</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Sản phẩm – 3 cột */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : products.length > 0
            ? products.map((product) => (
                <SignatureCard key={product._id || product.id} product={product} />
              ))
            : (
              <p className="col-span-3 text-center text-gray-400 text-sm py-12">
                Không tìm thấy sản phẩm.
              </p>
            )}
        </div>

        {/* Ảnh model bên phải → link vào collections */}
        <Link
          to="/collections"
          className="md:col-span-1 bg-gray-100 aspect-[3/4] overflow-hidden block group relative"
        >
          <img
            src="/assets/images/ảnh mẫu sig.jpg"
            alt="Signature Set Model"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-end justify-center pb-6">
            <span className="text-white text-xs uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Xem bộ sưu tập →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};