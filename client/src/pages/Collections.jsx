import React, { useEffect, useState } from 'react';
import { getProducts } from '../api';
import { Link } from 'react-router-dom';

export const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(res => {
        const products = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        
        // Nhóm sản phẩm theo chế tác (category)
        const categoryMap = products.reduce((acc, product) => {
          const cat = product.category || 'Khác';
          if (!acc[cat]) {
            acc[cat] = {
              name: cat,
              count: 0,
              image: product.image
            };
          }
          acc[cat].count += 1;
          return acc;
        }, {});

        const categoriesArray = Object.values(categoryMap);
        
        // Khởi tạo mục Tổng hòa thiết kế ở vị trí tôn quý đầu tiên
        const allProducts = {
          name: 'All products',
          displayName: 'Tất cả tạo tác',
          count: products.length,
          image: products.length > 0 ? products[0].image : '/assets/images/collection.avif'
        };

        const placeholderCollections = [
        ];

        const dbCategoryNames = categoriesArray.map(c => c.name);
        const uniquePlaceholders = placeholderCollections.filter(p => !dbCategoryNames.includes(p.name));

        setCollections([allProducts, ...categoriesArray, ...uniquePlaceholders]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi kết nối thư viện sản phẩm:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-serif text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 bg-[#FAF6F0] dark:bg-zinc-950 min-h-screen flex items-center justify-center">Đang khởi tạo không gian...</div>;

  return (
    <div className="bg-[#FAF6F0] dark:bg-zinc-950 min-h-screen transition-colors duration-500 antialiased selection:bg-amber-100/50">
      
      {/* BỐ CỤC ĐƯỢC GIẢI PHÓNG KHOẢNG TRỐNG THEO NGUYÊN MẪU IMAGE_77A0E4.PNG */}
      <div className="max-w-[1450px] mx-auto px-6 sm:px-10 pt-28 pb-32 font-sans">
        
        {/* Tiêu đề đặt lệch góc trái - Tối giản & Tĩnh lặng */}
        <div className="mb-14 border-b border-zinc-200/40 dark:border-zinc-900/60 pb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100">
            Collections
          </h1>
        </div>

        {/* Hệ lưới Kinh điển 5 cột (5-Column Minimal Grid) giúp thị giác cực kỳ thư thái */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
          {collections.map((col, idx) => (
            <Link 
              to={`/collections/${encodeURIComponent(col.name)}`} 
              key={idx} 
              className="group flex flex-col items-center text-center"
            >
              {/* Khung ảnh tỷ lệ 1:1 hình học tinh khiết */}
              <div className="w-full aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900/50 relative border border-zinc-200/20 dark:border-zinc-800/20">
                {col.image ? (
                  <img 
                    src={col.image} 
                    alt={col.displayName || col.name} 
                    className="w-full h-full object-cover scale-100 transition-transform duration-[1500ms] ease-out group-hover:scale-102" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-serif italic text-xs tracking-widest">
                    Đang Cập Nhật
                  </div>
                )}
              </div>
              
              {/* Phần thông tin tinh giản dưới chân ảnh */}
              <div className="mt-4 flex flex-col items-center px-2">
                <h2 className="text-[13px] font-normal text-zinc-800 dark:text-zinc-200 tracking-wide transition-colors duration-300 group-hover:text-amber-900 dark:group-hover:text-amber-400 line-clamp-1">
                  {col.displayName || col.name}
                </h2>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-light tracking-wide italic font-serif">
                  {col.count} tạo tác
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};