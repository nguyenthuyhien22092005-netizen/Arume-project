import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';

// Các chất liệu nổi bật — link về collections lọc theo collectionName/category
// Nếu DB có sản phẩm khớp collectionName, chúng sẽ hiện đúng
const MATERIAL_ITEMS = [
  { name: 'GOLD PLATED',     image: '/assets/images/gold plated.jpg',      link: '/collections/Gold Plated' },
  { name: 'STERLING SILVER', image: '/assets/images/stearling sliver.jpg', link: '/collections/Sterling Silver' },
  { name: 'GEMSTONE',        image: '/assets/images/Gemstone.jpg',         link: '/collections/Gemstone' },
];

export const CategoryInteractiveBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState(MATERIAL_ITEMS);

  useEffect(() => {
    // Nếu DB có collectionName khớp → dùng ảnh thật từ DB
    getProducts()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setItems(prev => prev.map(item => {
          const slug = item.name.toLowerCase().replace(/\s+/g, ' ');
          const matched = data.find(p =>
            p.collectionName?.toLowerCase().includes(slug) ||
            p.category?.toLowerCase().includes(slug) ||
            (p.material || '').toLowerCase().includes(slug)
          );
          return matched ? { ...item, image: matched.image || item.image } : item;
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col md:flex-row gap-8">
      {/* Ảnh lớn bên trái */}
      <div className="flex-1 relative overflow-hidden aspect-[4/5]">
        <img
          src={items[activeIndex].image}
          alt={items[activeIndex].name}
          className="w-full h-full object-cover transition-all duration-700"
        />
      </div>
      {/* Danh sách bên phải */}
      <div className="flex flex-col justify-center gap-6 w-full md:w-64">
        {items.map((cat, idx) => (
          <Link
            to={cat.link}
            key={cat.name}
            onMouseEnter={() => setActiveIndex(idx)}
            className={`text-2xl font-serif italic border-b pb-4 transition-colors duration-300
              ${activeIndex === idx ? 'text-black border-black' : 'text-gray-400 border-gray-200 hover:text-black'}`}
          >
            {cat.name}
          </Link>
        ))}
        <Link
          to="/collections"
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mt-2"
        >
          Xem tất cả bộ sưu tập →
        </Link>
      </div>
    </section>
  );
};
