import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts } from '../api';

export const InteractiveLifestyle = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setProducts(data.filter(p => p.image).slice(0, 2));
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const product = products[currentIndex] || products[0];

  const prev = () => setCurrentIndex(i => (i === 0 ? products.length - 1 : i - 1));
  const next = () => setCurrentIndex(i => (i + 1) % products.length);

  const hotspots = [{ top: '30%', left: '30%' }, { top: '60%', left: '55%' }];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={product._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="relative bg-gray-50 p-12 h-[500px] flex flex-col items-center justify-center rounded-2xl"
          >
            {products.length > 1 && (
              <button onClick={prev} className="absolute left-6 text-2xl text-gray-500 hover:text-black transition-colors">←</button>
            )}

            {/* Ảnh sản phẩm → click vào trang chi tiết */}
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={product.image}
              className="w-64 h-64 object-contain mb-6 cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80'; }}
            />
            <h4 className="text-2xl font-serif text-center mb-1">{product.name}</h4>
            <p className="text-gray-500 mb-4">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>

            <div className="flex gap-3">
              <Link
                to={`/product/${product._id}`}
                className="border border-black text-black px-6 py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                Xem chi tiết
              </Link>
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40"
              >
                + Giỏ hàng
              </button>
            </div>

            {products.length > 1 && (
              <button onClick={next} className="absolute right-6 text-2xl text-gray-500 hover:text-black transition-colors">→</button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hotspot Image */}
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-gray-200">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            src="/assets/images/Ảnh mẫu inter.jpg"
            className="w-full h-full object-cover"
            alt="Lifestyle"
          />
          {hotspots.map((pos, i) => (
            <Link
              key={i}
              to={`/product/${product._id}`}
              style={{ top: pos.top, left: pos.left }}
              className="absolute w-8 h-8 border-2 border-white rounded-full bg-white/40 hover:bg-white hover:scale-110 animate-pulse shadow-xl transition-all flex items-center justify-center"
            >
              <span className="w-2 h-2 bg-white rounded-full block"></span>
            </Link>
          ))}
          <div className="absolute bottom-6 right-6">
            <Link
              to={`/product/${product._id}`}
              className="bg-white text-black px-5 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Mua ngay →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};