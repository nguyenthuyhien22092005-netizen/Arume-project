import React, { useState, useEffect, useRef } from 'react';
import { getProducts } from '../api';
import { Link, useNavigate } from 'react-router-dom';

// Từ khóa gợi ý phổ biến
const SUGGESTIONS = ['Nhẫn', 'Dây chuyền', 'Khuyên tai', 'Vòng tay', 'Ngọc trai', 'Kim cương', 'Vàng 18K', 'Bộ sưu tập cưới'];

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch toàn bộ sản phẩm 1 lần khi mở
  useEffect(() => {
    if (isOpen && allProducts.length === 0) {
      getProducts()
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
          setAllProducts(data);
        })
        .catch(() => {});
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Tìm kiếm realtime khi gõ
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase().trim();

      const matched = allProducts.filter(p => {
        return (
          (p.name         && p.name.toLowerCase().includes(q)) ||
          (p.category     && p.category.toLowerCase().includes(q)) ||
          (p.collectionName && p.collectionName.toLowerCase().includes(q)) ||
          (p.jewelleryType  && p.jewelleryType.toLowerCase().includes(q)) ||
          (p.material     && p.material.toLowerCase().includes(q)) ||
          (p.gemstone     && p.gemstone.toLowerCase().includes(q)) ||
          (p.description  && p.description.toLowerCase().includes(q)) ||
          (p.tags         && p.tags.some(t => t.toLowerCase().includes(q)))
        );
      });

      setResults(matched.slice(0, 8));
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, allProducts]);

  // Nhấn Enter → vào trang collections lọc theo query
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/collections/All products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestion = (text) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1005] bg-[#F9F7F2] dark:bg-gray-950 overflow-y-auto">
      {/* Nút đóng */}
      <div
        className="absolute top-8 right-8 cursor-pointer text-black dark:text-white hover:rotate-90 transition-transform duration-300"
        onClick={onClose}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto mt-32 px-6 pb-20">
        <p className="text-sm uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400 mb-4">
          Bạn đang tìm gì?
        </p>

        {/* Input tìm kiếm */}
        <form onSubmit={handleSubmit}>
          <div className="relative border-b-2 border-black dark:border-white pb-2 mb-6">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm tuyệt tác..."
              className="w-full text-5xl font-serif italic bg-transparent outline-none dark:text-white placeholder-gray-300 dark:placeholder-gray-600 text-black pr-12"
            />
            <button type="submit" className="absolute right-0 top-2 text-black dark:text-white hover:opacity-60 transition-opacity">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </form>

        {/* Gợi ý nhanh khi chưa gõ */}
        {query.trim().length === 0 && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Tìm kiếm phổ biến</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors rounded-full"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Đang tìm */}
        {loading && (
          <p className="text-gray-400 italic text-sm">Đang tìm kiếm...</p>
        )}

        {/* Kết quả */}
        {!loading && results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-xs uppercase tracking-widest font-semibold mb-6 text-gray-500 dark:text-gray-400">
              {results.length} kết quả cho &quot;{query}&quot;
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map(product => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  onClick={onClose}
                  className="group"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 mb-3 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80'; }}
                    />
                  </div>
                  <p className="text-[11px] uppercase tracking-widest text-[#C9A96E] mb-0.5">{product.category}</p>
                  <p className="text-sm font-semibold dark:text-white group-hover:text-gray-500 dark:group-hover:text-gray-300 leading-snug">{product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Không có kết quả */}
        {!loading && query.trim().length > 1 && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg italic mb-2">Không tìm thấy &quot;{query}&quot;</p>
            <p className="text-sm text-gray-400">Thử tìm: Nhẫn, Dây chuyền, Khuyên tai, Vòng tay...</p>
          </div>
        )}
      </div>
    </div>
  );
};