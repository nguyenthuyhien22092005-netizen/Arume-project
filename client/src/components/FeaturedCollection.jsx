import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts } from '../api';

export const FeaturedCollection = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        // Ưu tiên bestSeller, lấy 2 sản phẩm đầu có ảnh
        const sorted = [...data].sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        setFeaturedProducts(sorted.filter(p => p.image).slice(0, 2));
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate(`/product/${product._id}`);
  };

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-20">
      <div className="flex flex-col lg:flex-row gap-12 items-start">

        {/* Ảnh lớn bên trái → link bộ sưu tập Nhẫn */}
        <Link to="/collections/Nhẫn" className="flex-1 w-full lg:w-1/2 h-[500px] overflow-hidden group relative block">
          <img
            src="/assets/images/Bộ sưu tập nhẫn.jpg"
            alt="Bộ sưu tập Nhẫn"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-500" />
          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-3xl font-serif italic mb-2">Nhẫn</h2>
            <p className="text-sm mb-4 opacity-90">Ưu đãi mùa Thu - Đông '26 lên đến 30%</p>
            <span className="border-b border-white pb-1 text-sm uppercase tracking-widest font-semibold">Khám phá bộ sưu tập →</span>
          </div>
        </Link>

        {/* Sản phẩm bên phải */}
        <div className="w-full lg:w-[400px] flex gap-8">
          {featuredProducts.length === 0
            ? [0, 1].map(i => (
                <div key={i} className="flex-1 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 mb-4" />
                  <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))
            : featuredProducts.map((product) => (
                <div key={product._id} className="flex-1 group">
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="bg-gray-50 aspect-[3/4] mb-4 overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex flex-col items-center justify-end pb-4 gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock <= 0}
                          className="w-[85%] bg-white text-black py-2 text-xs uppercase tracking-widest font-semibold hover:bg-black hover:text-white transition-colors duration-200 disabled:opacity-40"
                        >
                          {product.stock <= 0 ? 'Hết hàng' : '+ Giỏ hàng'}
                        </button>
                        <button
                          onClick={(e) => handleBuyNow(e, product)}
                          disabled={product.stock <= 0}
                          className="w-[85%] bg-black text-white py-2 text-xs uppercase tracking-widest font-semibold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-40"
                        >
                          Mua ngay
                        </button>
                      </div>
                    </div>
                    <h3 className="text-sm font-light text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </p>
                  </Link>
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
};
