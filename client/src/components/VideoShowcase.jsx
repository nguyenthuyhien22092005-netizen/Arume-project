import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api';

// Tên sản phẩm tĩnh + video/ảnh tương ứng
const videoItems = [
  {
    id: 1,
    title: 'Golden Pearl Studs',
    price: '100.00$',
    videoUrl: '/assets/videos/Golden Pearl Studs.mp4',
    imageUrl: '/assets/images/Golden Pearl Studs.jpg',
  },
  {
    id: 2,
    title: 'Starlight Crown',
    price: '120.00$',
    videoUrl: '/assets/videos/Starlight Crown.mp4',
    imageUrl: '/assets/images/Starlight Crown.jpg',
  },
  {
    id: 3,
    title: 'Crystal Hoop Charm',
    price: '250.00$',
    videoUrl: '/assets/videos/Crystal Hoop Charm.mp4',
    imageUrl: '/assets/images/Crystal Hoop Charm.jpg',
  },
  {
    id: 4,
    title: 'Golden Horizon Choker',
    price: '250.00$',
    videoUrl: '/assets/videos/Golden Horizon Choker.mp4',
    imageUrl: '/assets/images/Golden Horizon Choker.jpg',
  },
];

export const VideoShowcase = () => {
  const navigate = useNavigate();
  // Map: tên sản phẩm (lowercase) → _id từ DB
  const [productIdMap, setProductIdMap] = useState({});

  useEffect(() => {
    getProducts()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        const map = {};
        data.forEach(p => {
          if (p.name) map[p.name.toLowerCase().trim()] = p._id;
        });
        setProductIdMap(map);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (title) => {
    const id = productIdMap[title.toLowerCase().trim()];
    if (id) {
      navigate(`/product/${id}`);
    } else {
      // Fallback: tìm kiếm theo tên nếu không khớp _id
      navigate(`/collections/All products?search=${encodeURIComponent(title)}`);
    }
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Tiêu đề */}
      <div className="text-center mb-16">
        <p className="text-sm text-gray-500 mb-2 tracking-[0.2em] uppercase">
          Khám phá không gian trưng bày và dịch vụ xỏ khuyên đầy tinh tế
        </p>
        <h2 className="text-3xl font-serif text-gray-900 tracking-wide uppercase">
          LẤY CẢM HỨNG TỪ BẠN, CHẾ TÁC BỞI ARUME
        </h2>
      </div>

      {/* Lưới video */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {videoItems.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => handleSearch(item.title)}
          >
            {/* Video container */}
            <video
              className="w-full h-[500px] object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={item.videoUrl} type="video/mp4" />
            </video>

            {/* Thông tin sản phẩm */}
            <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-900 p-3 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-10 h-10 object-cover rounded-sm border border-gray-100"
                />
                <div>
                  <h4 className="font-serif text-[14.5px] text-gray-900 dark:text-white truncate">{item.title}</h4>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest">{item.price}</p>
                </div>
              </div>
              {/* Nút tìm kiếm → điều hướng đến trang sản phẩm */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSearch(item.title); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title={`Xem sản phẩm ${item.title}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};