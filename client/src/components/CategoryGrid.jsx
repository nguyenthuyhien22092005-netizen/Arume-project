import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';

const CATEGORIES = [
  { key: 'isBestSeller', name: 'BÁN CHẠY',   img: '/assets/images/Best sellers.jpg',  link: '/collections/isBestSeller' },
  { key: 'Nhẫn',        name: 'NHẪN',         img: '/assets/images/Nhẫn.jpg',          link: '/collections/Nhẫn' },
  { key: 'Hoa Tai',     name: 'KHUYÊN TAI',   img: '/assets/images/Khuyên tai.jpg',   link: '/collections/Hoa Tai' },
  { key: 'Dây Chuyền',  name: 'DÂY CHUYỀN',  img: '/assets/images/Dây chuyền.jpg',   link: '/collections/Dây Chuyền' },
];

export const CategoryGrid = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    getProducts()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        const c = {};
        CATEGORIES.forEach(cat => {
          if (cat.key === 'isBestSeller') {
            c[cat.key] = data.filter(p => p.isBestSeller).length;
          } else {
            c[cat.key] = data.filter(p =>
              p.category?.toLowerCase() === cat.key.toLowerCase() ||
              p.category?.toLowerCase().includes(cat.key.toLowerCase())
            ).length;
          }
        });
        setCounts(c);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link to={cat.link} key={cat.name} className="group relative overflow-hidden aspect-[3/4] block">
            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
              <h3 className="text-lg font-serif italic mb-1">{cat.name}</h3>
              <p className="text-xs uppercase tracking-widest opacity-80">
                {counts[cat.key] !== undefined ? `${counts[cat.key]} sản phẩm` : '...'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
