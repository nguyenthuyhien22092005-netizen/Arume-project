import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, User, Gift, Sun, Moon, Heart, ChevronRight, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getProducts } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { SearchModal } from './SearchModal';
import { AuthModal } from './AuthModal';
import { OffersModal } from './OffersModal';

export const Header = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistItems, setIsWishlistOpen } = useWishlist();
  const { user, logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Đọc từ DOM class để đồng bộ với khởi tạo trong main.jsx
    return document.documentElement.classList.contains('dark');
  });
  const fallbackMockData = {
    'The Promise': [
      { _id: 'feat-1', name: 'Radiant Pearl Ring', image: '/assets/images/Radiant Pearl Ring.jpg' },
      { _id: 'feat-2', name: 'Golden Twist Ring', image: '/assets/images/Golden Twist Ring.jpg' },
      { _id: 'feat-3', name: 'Eternal Glow Ring', image: '/assets/images/Eternal Glow Ring.jpg' },
      { _id: 'feat-4', name: 'Starlight Crown Band', image: '/assets/images/Starlight Crown Band.jpg' }
    ],
    'The Sculpt': [
      { _id: 'feat-5', name: 'Twilight Spark Hoops', image: '/assets/images/Twilight Spark Hoops.jpg' },
      { _id: 'feat-6', name: 'Golden Pearl Studs', image: '/assets/images/Golden Pearl Studs.jpg' },
      { _id: 'feat-7', name: 'Luna Drop Earrings', image: '/assets/images/Luna Drop Earrings.jpg' },
      { _id: 'feat-8', name: 'Radiant Bloom Drops', image: '/assets/images/Radiant Bloom Drops.jpg' }
    ],
    'Ocean Whisper': [
      { _id: 'feat-9', name: 'Eternal Glow Necklace', image: '/assets/images/Eternal Glow Necklace.jpg' },
      { _id: 'feat-10', name: 'Serene Pearl Strand', image: '/assets/images/Serene Pearl Strand.jpg' },
      { _id: 'feat-11', name: 'Pearl Drift Anklet', image: '/assets/images/Pearl Drift Anklet.jpg' },
      { _id: 'feat-12', name: 'Luxe Pearl Bangle', image: '/assets/images/Luxe Pearl Bangle.jpg' }
    ]
  };

  const [activeBestSellerTab, setActiveBestSellerTab] = useState('The Promise');
  const [bestSellerData, setBestSellerData] = useState(fallbackMockData);

  // Lấy sản phẩm bán chạy từ DB, gom theo collectionName
  useEffect(() => {
    const groupAndSet = (products) => {
      const grouped = {};
      products.forEach(p => {
        const key = p.collectionName || p.category || 'Khác';
        if (!grouped[key]) grouped[key] = [];
        if (grouped[key].length < 4) grouped[key].push(p);
      });
      const filtered = Object.fromEntries(
        Object.entries(grouped).filter(([, items]) => items.length > 0)
      );
      if (Object.keys(filtered).length > 0) {
        setBestSellerData(filtered);
        setActiveBestSellerTab(Object.keys(filtered)[0]);
      }
    };

    // Bước 1: thử lấy sản phẩm có isBestSeller=true
    getProducts({ isBestSeller: true })
      .then(res => {
        const bestSellers = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        if (bestSellers && bestSellers.length > 0) {
          // Có sản phẩm đánh dấu bán chạy → dùng luôn
          groupAndSet(bestSellers);
        } else {
          // Bước 2: không có → lấy tất cả và gom theo collection, mỗi collection lấy tối đa 4
          getProducts()
            .then(res2 => {
              const all2 = Array.isArray(res2.data) ? res2.data : (res2.data?.products || []);
              if (all2.length > 0) {
                groupAndSet(all2);
              }
              // Nếu DB rỗng hoàn toàn → giữ fallbackMockData
            })
            .catch(err => console.error('Lỗi tải sản phẩm:', err));
        }
      })
      .catch(err => console.error('Lỗi tải bestseller:', err));
  }, []);

  // Countdown logic cho Topbar
  const [timeLeft, setTimeLeft] = useState({
    days: 2, hours: 14, minutes: 30, seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Đóng user menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Announcement Bar with Countdown */}
      <div className="bg-black text-white py-2 px-4 text-center text-xs sm:text-xs uppercase tracking-[0.2em] font-medium flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 sticky top-0 z-[1002]">
        <span>CHỈ CÒN VÀI NGÀY NỮA LÀ KẾT THÚC ƯU ĐÃI TỚI 30%</span>
        <div className="flex items-center gap-1 font-mono font-bold bg-black/20 px-3 py-1 rounded">
          <span>{String(timeLeft.days).padStart(2, '0')} NGÀY</span>
          <span>:</span>
          <span>{String(timeLeft.hours).padStart(2, '0')} GIỜ</span>
          <span>:</span>
          <span>{String(timeLeft.minutes).padStart(2, '0')} PHÚT</span>
          <span>:</span>
          <span>{String(timeLeft.seconds).padStart(2, '0')} GIÂY</span>
        </div>
      </div>

      <header className="bg-[#330000] text-white dark:bg-gray-900 sticky top-[36px] z-[1001] transition-colors duration-300 border-b border-white/10 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between py-5 px-6">

          {/* Left Links */}
          <div className="flex items-center gap-8 text-sm uppercase tracking-wide">

            {/* Mega Menu cho BÁN CHẠY */}
            <div className="group relative">
              <Link to="/collections" className="hover:text-gray-300 transition flex items-center gap-1 font-semibold cursor-pointer py-4">
                BÁN CHẠY ⌄
              </Link>
              <div className="absolute top-full left-0 bg-white text-black dark:bg-gray-800 dark:text-white w-[900px] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border-t-2 border-black dark:border-white flex">

                {/* Left Sidebar Categories */}
                <div className="w-48 border-r border-gray-100 dark:border-gray-700 py-4 flex flex-col">
                  {Object.keys(bestSellerData).map((tab) => (
                    <Link
                      to={`/collections/${encodeURIComponent(tab)}`}
                      key={tab}
                      onMouseEnter={() => setActiveBestSellerTab(tab)}
                      className={`px-4 py-3 text-xs font-semibold cursor-pointer flex justify-between items-center ${activeBestSellerTab === tab ? 'bg-[#EEF2F0] dark:bg-gray-700 text-black dark:text-white' : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <span>{tab}</span>
                      <ChevronRight size={12} className="text-gray-400" />
                    </Link>
                  ))}
                </div>

                {/* Right Products Grid */}
                <div className="flex-1 p-6 grid grid-cols-4 gap-4">
                  {bestSellerData[activeBestSellerTab]?.map((product) => (
                    <Link to={`/product/${product._id}`} key={product._id} className="group/item">
                      <h3 className="text-xs font-sans font-medium text-gray-700 dark:text-gray-300 mb-2 truncate">{product.name}</h3>
                      <div className="aspect-[4/3] bg-[#F7F5F2] dark:bg-gray-700 overflow-hidden flex items-center justify-center p-2">
                        <img src={product.image || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/collections" className="hover:text-gray-300 flex items-center gap-1 relative font-semibold">
              BỘ SƯU TẬP
              <span className="absolute -top-4 left-0 bg-red-800 text-xs px-1 text-white font-bold rounded-sm">50% OFF</span>
            </Link>

            <Link to="/collections/All products" className="hover:text-gray-300 font-semibold">SHOP ALL</Link>

            {/* Mega Menu cho VỀ ARUME */}
            <div className="group relative">
              <span className="hover:text-gray-300 font-semibold cursor-pointer flex items-center gap-1 py-4">
                VỀ ARUME ⌄
              </span>

              {/* Dropdown */}
              <div className="absolute top-full left-0 bg-white text-black dark:bg-gray-800 dark:text-white w-56 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border-t-2 border-black dark:border-white">
                
                <Link to="/about" className="block px-6 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm">
                  Câu chuyện thương hiệu
                </Link>
                
                <Link to="/contact" className="block px-6 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm">
                  Dịch vụ & Liên hệ
                </Link>
                
                <div className="group/item relative">
                  <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center cursor-pointer">
                    <span className="font-medium text-sm">Chính sách</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                  {/* Sub-menu */}
                  <div className="absolute top-0 left-full bg-white text-black dark:bg-gray-800 dark:text-white w-56 shadow-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 min-h-full border-l border-gray-100 dark:border-gray-700">
                    <Link to="/policies/shipping" className="block px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                      Vận chuyển
                    </Link>
                    <Link to="/policies/refund" className="block px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                      Đổi trả & Hoàn tiền
                    </Link>
                    <Link to="/policies/privacy" className="block px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                      Bảo mật
                    </Link>
                    <Link to="/policies/terms" className="block px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                      Điều khoản
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Center Logo */}
          <div className="text-3xl tracking-widest font-serif font-bold text-center pl-8">
            <Link to="/">ARUME</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-white/20 pr-4">
              <Gift size={20} className="cursor-pointer hover:text-gray-300 transition" onClick={() => setIsOffersOpen(true)} />
              <Search size={20} className="cursor-pointer hover:text-gray-300 transition" onClick={() => setIsSearchOpen(true)} />

              {/* User icon / dropdown */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 hover:text-gray-300 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block max-w-[80px] truncate">{user.name}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white text-black shadow-xl w-48 rounded-lg overflow-hidden z-50">
                      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition">
                        <User size={16} />
                        Tài khoản của tôi
                      </Link>
                      {user.isAdmin && (
                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition text-purple-700 font-semibold">
                          <LayoutDashboard size={16} />
                          Admin Panel
                        </Link>
                      )}
                      <hr className="border-gray-100" />
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 text-red-600 transition">
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <User size={20} className="cursor-pointer hover:text-gray-300 transition" onClick={() => setIsAuthOpen(true)} />
              )}

              <div className="relative cursor-pointer hover:text-gray-300 transition" onClick={() => setIsWishlistOpen(true)}>
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </div>

              <div className="relative cursor-pointer hover:text-gray-300 transition" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>

            {isDarkMode ? (
              <Sun size={20} className="cursor-pointer hover:text-gray-300 transition" onClick={() => setIsDarkMode(false)} />
            ) : (
              <Moon size={20} className="cursor-pointer hover:text-gray-300 transition" onClick={() => setIsDarkMode(true)} />
            )}
          </div>
        </div>

        {/* Modals */}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <OffersModal isOpen={isOffersOpen} onClose={() => setIsOffersOpen(false)} />
      </header>
    </>
  );
};