import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProducts } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { AuthModal } from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import { Heart, SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';

// ─── Filter Section ───────────────────────────────────────────────────────────
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 py-5 pr-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-[11px] uppercase tracking-[0.2em] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
      >
        {title}
        {open ? <ChevronUp size={12} className="stroke-[2]" /> : <ChevronDown size={12} className="stroke-[2]" />}
      </button>
      {open && <div className="mt-4 animate-fade-in">{children}</div>}
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ShopProductCard = ({ product, onBuyNow, compact, onRequireAuth }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const isFav = isInWishlist(product._id);

  const handleBuyNow = (e) => {
    e.preventDefault();
    // Nếu có size → redirect sang trang detail để chọn size
    if (Array.isArray(product.size) && product.size.length > 0) {
      navigate(`/product/${product._id || product.id}`);
      return;
    }
    if (!user) { onRequireAuth(); return; }
    onBuyNow(product);
  };

  return (
    <div className="group flex flex-col bg-transparent">
      <Link
        to={`/product/${product._id}`}
        className="block relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/10 mb-4"
        style={{ aspectRatio: compact ? '1/1' : '3/4' }}
      >
        <img
          src={product.image || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover scale-100 transition-transform duration-[1500ms] ease-out group-hover:scale-103"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.stock <= 0 && (
            <span className="bg-zinc-900 text-white dark:bg-white dark:text-black text-[9px] px-2 py-0.5 uppercase tracking-[0.15em] font-medium">Tuyệt bản</span>
          )}
          {product.isNewProduct && (
            <span className="bg-amber-800 text-white text-[11px] px-2 py-0.5 uppercase tracking-[0.15em] font-medium">Mới nhất</span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className="absolute top-3 right-3 w-8 h-8 bg-[#FAF6F0]/90 dark:bg-zinc-900/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
        >
          <Heart size={13} className={isFav ? 'fill-amber-800 text-amber-800' : 'text-zinc-500 stroke-[1.5]'} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex backdrop-blur-xs">
          <button
            onClick={(e) => { e.preventDefault(); navigate(`/product/${product._id || product.id}`); }}
            className="flex-1 bg-[#FAF6F0]/95 dark:bg-zinc-900/95 text-zinc-800 dark:text-zinc-200 py-3 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors border-r border-zinc-200/40 flex items-center justify-center"
          >
            Xem chi tiết
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="flex-1 bg-zinc-900 text-white dark:bg-white dark:text-black py-3 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-amber-900 dark:hover:bg-amber-400 dark:hover:text-black transition-colors disabled:opacity-30"
          >
            Sở hữu
          </button>
        </div>
      </Link>
      <div className="flex flex-col gap-1 px-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-800 dark:text-amber-500 font-semibold">
          {product.category || 'ARUME'}
        </p>
        <h3 className="text-sm font-sans font-normal text-zinc-800 dark:text-zinc-200 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors duration-300 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-sm font-serif font-medium text-zinc-900 dark:text-zinc-100">${product.price?.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-[11px] text-zinc-400 line-through font-light">${product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const ProductList = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(true);
  const [gridCols, setGridCols] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  // ── Filter states ──
  const [maxPrice, setMaxPrice] = useState(0); // will be set after products load
  const [priceRange, setPriceRange] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [activeCategory, setActiveCategory] = useState(category || 'all');
  const [activeType, setActiveType] = useState('Tất cả');
  const [selectedGoldTypes, setSelectedGoldTypes] = useState([]);

  const jewelryTypes = ['Tất cả', 'Nhẫn', 'Dây chuyền', 'Khuyên tai', 'Vòng tay', 'Đồng hồ'];

  useEffect(() => {
    getProducts()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setProducts(data);
        setLoading(false);
        // Set price range max from actual data
        if (data.length > 0) {
          const max = Math.max(...data.map(p => p.price || 0));
          const roundedMax = Math.ceil(max / 100) * 100 + 100; // round up + buffer
          setMaxPrice(roundedMax);
          setPriceRange(roundedMax);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const decoded = category ? decodeURIComponent(category) : '';
    if (decoded && decoded !== 'All products') setActiveCategory(decoded);
    else setActiveCategory('all');
  }, [category]);

  // Kiểm tra đây có phải route 'Bán chạy' không
  const isBestSellerRoute = category ? decodeURIComponent(category) === 'isBestSeller' : false;

  const handleBuyNowClick = (product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Compute dynamic filter options from actual product data
  const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
  const goldTypesInData = [...new Set(products.map(p => p.goldType).filter(Boolean))];
  // If goldType not populated, fall back to a static list
  const goldTypeOptions = goldTypesInData.length > 0 ? goldTypesInData : ['Vàng 18K', 'Vàng Trắng 14K', 'Vàng Hồng', 'Bạch Kim'];
  const sizes = [...new Set(products.flatMap(p => p.size || []).filter(Boolean))];

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  // ── Jewelry type → category keywords mapping (comprehensive) ──
  const typeKeywords = {
    'Nhẫn':       ['ring', 'nhẫn'],
    'Dây chuyền': ['necklace', 'choker', 'dây chuyền', 'pendant', 'chain'],
    'Khuyên tai': ['earring', 'khuyên', 'stud', 'hoop'],
    'Vòng tay':   ['bracelet', 'bangle', 'anklet', 'vòng tay', 'vòng cổ tay'],
    'Đồng hồ':    ['watch', 'đồng hồ'],
  };

  const matchesType = (product, type) => {
    if (type === 'Tất cả') return true;
    const keywords = typeKeywords[type] || [];
    const haystack = [
      product.category,
      product.jewelleryType,
      product.name,
      product.collectionName,
      product.tags?.join(' '),
    ].filter(Boolean).join(' ').toLowerCase();
    return keywords.some(kw => haystack.includes(kw));
  };

  const matchesCategory = (product, cat) => {
    if (cat === 'all' || cat === 'isBestSeller') return true;
    const catLower = cat.toLowerCase();
    const haystack = [
      product.category,
      product.collectionName,
      product.material,
      product.goldType,
    ].filter(Boolean).join(' ').toLowerCase();
    return (
      haystack.includes(catLower) ||
      product.category?.toLowerCase() === catLower ||
      product.collectionName?.toLowerCase() === catLower
    );
  };

  const matchesGoldType = (product, selected) => {
    if (selected.length === 0) return true;
    // Check dedicated goldType field first, then material
    const val = (product.goldType || product.material || '').toLowerCase();
    return selected.some(g => val.includes(g.toLowerCase()));
  };

  const filteredProducts = products
    .filter(p => {
      if (isBestSellerRoute && !p.isBestSeller) return false;
      if (!isBestSellerRoute && !matchesCategory(p, activeCategory)) return false;
      if (!matchesType(p, activeType)) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (maxPrice > 0 && p.price > priceRange) return false;
      if (!matchesGoldType(p, selectedGoldTypes)) return false;
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(p.material)) return false;
      if (selectedSizes.length > 0 && !(p.size || []).some(s => selectedSizes.includes(s))) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.category?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const displayCategory = category === 'All products' ? 'TỔNG HÒA THIẾT KẾ' : category === 'isBestSeller' ? 'BÁN CHẠY NHẤT' : (category?.toUpperCase() || 'TỔNG HÒA THIẾT KẾ');
  const currentTitle = activeType !== 'Tất cả' ? activeType : displayCategory;

  const totalActive = [
    inStockOnly,
    selectedMaterials.length > 0,
    selectedSizes.length > 0,
    maxPrice > 0 && priceRange < maxPrice,
    activeType !== 'Tất cả',
    selectedGoldTypes.length > 0,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setPriceRange(maxPrice);
    setInStockOnly(false);
    setSelectedMaterials([]);
    setSelectedSizes([]);
    setSearchQuery('');
    setActiveType('Tất cả');
    setSelectedGoldTypes([]);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] dark:bg-zinc-950">
      <div className="text-center">
        <div className="w-6 h-6 border border-amber-900/40 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif italic text-xs tracking-widest text-zinc-400">Đang khởi tạo bộ sưu tập...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAF6F0] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen transition-colors duration-500 antialiased">

      {/* Hero Banner */}
      <div className="relative h-[340px] w-full bg-zinc-900 dark:bg-zinc-900 overflow-hidden flex items-center border-b border-zinc-200/30">
        <img
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&q=80"
          alt="Arume Luxury Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />
        <div className="relative z-10 max-w-[1450px] w-full mx-auto px-6 sm:px-10 flex flex-col items-start">
          <nav className="text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-2">
            <Link to="/" className="text-zinc-300 hover:text-amber-400 transition-colors duration-300">Arumė</Link>
            <span className="text-zinc-600 font-light">/</span>
            <span className="text-amber-500/90 font-semibold">{currentTitle.toLowerCase()}</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-serif font-extralight tracking-wide text-white leading-none">
            <span className="italic block font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              {currentTitle.toUpperCase()}
            </span>
          </h1>
          <div className="w-16 h-[1px] bg-amber-500/50 my-5" />
          <p className="text-xs md:text-sm text-zinc-400 max-w-md font-light leading-relaxed tracking-wide">
            Những đường nét hình học thuần khiết kết hợp cùng chất liệu vàng bản vị. Nơi lưu giữ giá trị di sản vượt thời gian của Arume.
          </p>
        </div>
      </div>

      {/* Category navigation bar */}
      <div className="border-b border-zinc-200/40 dark:border-zinc-900/40 bg-transparent overflow-x-auto scrollbar-none">
        <div className="max-w-[1450px] mx-auto flex gap-8 px-6 sm:px-10 py-5 min-w-max">
          {jewelryTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`pb-1 text-[11px] uppercase tracking-[0.25em] transition-all duration-300 relative
                ${activeType === type
                  ? 'text-amber-950 dark:text-amber-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-light'}`}
            >
              {type}
              {activeType === type && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-950 dark:bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-[#FAF6F0]/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-900/60">
        <div className="max-w-[1450px] mx-auto flex items-center justify-between px-6 sm:px-10 py-4 gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] transition-colors py-1 font-medium
                ${showFilter ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-800'}`}
            >
              <SlidersHorizontal size={12} className="stroke-[2]" />
              Bộ Chắt Lọc
              {totalActive > 0 && (
                <span className="bg-zinc-900 text-white dark:bg-amber-400 dark:text-black w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-mono">{totalActive}</span>
              )}
            </button>
            <div className="relative hidden md:block">
              <Search size={12} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 stroke-[2]" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tạo tác..."
                className="pl-5 pr-6 py-1 text-xs border-b border-transparent focus:border-zinc-400 outline-none w-48 bg-transparent font-light"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-serif italic text-zinc-400">{filteredProducts.length} tuyệt tác hiển thị</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-[11px] uppercase tracking-[0.15em] font-medium bg-transparent text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer border-none focus:ring-0"
            >
              <option value="newest" className="bg-[#FAF6F0] dark:bg-zinc-900">Mới Nhất</option>
              <option value="price-asc" className="bg-[#FAF6F0] dark:bg-zinc-900">Giá Thấp Đến Cao</option>
              <option value="price-desc" className="bg-[#FAF6F0] dark:bg-zinc-900">Giá Cao Đến Thấp</option>
              <option value="name" className="bg-[#FAF6F0] dark:bg-zinc-900">Danh Mục A–Z</option>
            </select>
            <div className="hidden md:flex items-center gap-3 border-l border-zinc-200/60 dark:border-zinc-800/60 pl-6">
              {[2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setGridCols(n)}
                  className={`text-[11px] font-mono transition-colors duration-300 ${gridCols === n ? 'text-amber-900 dark:text-amber-400 font-bold scale-110' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  0{n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-[1450px] mx-auto flex px-6 sm:px-10 py-10">

        {/* Filter sidebar */}
        {showFilter && (
          <aside className="w-64 flex-shrink-0 pr-8 border-r border-zinc-200/60 dark:border-zinc-800/60 animate-fade-in hidden lg:block">
            <div className="sticky top-28 space-y-2">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-zinc-100">Bộ Lọc Tinh Hoa</h3>
                {totalActive > 0 && (
                  <button onClick={resetFilters} className="text-[10px] text-amber-950 dark:text-amber-400 uppercase tracking-widest hover:underline">
                    Xoá tất cả
                  </button>
                )}
              </div>

              <FilterSection title="Hiện Trạng">
                <label className="flex items-center gap-3 cursor-pointer text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-2.5 hover:text-black dark:hover:text-white transition-colors">
                  <input type="checkbox" className="accent-zinc-900 w-3 h-3 rounded-none" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                  Sẵn có tại cửa hàng ({products.filter(p => p.stock > 0).length})
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  <input type="checkbox" className="accent-zinc-900 w-3 h-3 rounded-none" />
                  Đặt hàng chế tác ({products.filter(p => p.stock <= 0).length})
                </label>
              </FilterSection>

              {maxPrice > 0 && (
                <FilterSection title="Hạn Mức Định Giá">
                  <input
                    type="range" min="0" max={maxPrice} value={priceRange}
                    onChange={e => setPriceRange(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-amber-400 mb-3 cursor-pointer h-[2px] appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>$0</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-bold">
                      {priceRange >= maxPrice ? 'Tất cả' : `$${priceRange.toLocaleString()}`}
                    </span>
                  </div>
                </FilterSection>
              )}

              {goldTypeOptions.length > 0 && (
                <FilterSection title="Bản Vị Kim Hoàn">
                  {goldTypeOptions.map(gold => (
                    <label key={gold} className="flex items-center gap-3 cursor-pointer text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-2.5 hover:text-black dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        className="accent-zinc-900 w-3 h-3"
                        checked={selectedGoldTypes.includes(gold)}
                        onChange={() => toggleArr(selectedGoldTypes, setSelectedGoldTypes, gold)}
                      />
                      {gold}
                    </label>
                  ))}
                </FilterSection>
              )}

              {materials.length > 0 && (
                <FilterSection title="Chất Liệu Nền" defaultOpen={false}>
                  {materials.map(mat => (
                    <label key={mat} className="flex items-center gap-3 cursor-pointer text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-2.5">
                      <input
                        type="checkbox"
                        className="accent-zinc-900 w-3 h-3"
                        checked={selectedMaterials.includes(mat)}
                        onChange={() => toggleArr(selectedMaterials, setSelectedMaterials, mat)}
                      />
                      {mat}
                    </label>
                  ))}
                </FilterSection>
              )}

              {sizes.length > 0 && (
                <FilterSection title="Thông Số Đo Đạc" defaultOpen={false}>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleArr(selectedSizes, setSelectedSizes, s)}
                        className={`px-2.5 py-1 text-[10px] font-mono border transition-colors duration-300
                          ${selectedSizes.includes(s) ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              )}
            </div>
          </aside>
        )}

        {/* Product grid */}
        <div className={`flex-1 ${showFilter ? 'lg:pl-8' : ''}`}>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-6 rounded-full">
                <Search size={16} className="text-zinc-300 stroke-[1]" />
              </div>
              <h3 className="font-serif italic text-xl text-zinc-400 mb-2">Hư Không Không Gian</h3>
              <p className="text-xs text-zinc-400 mb-6 font-light">Chưa có tạo tác nào tương thích với bộ chắt lọc hiện hành.</p>
              <button onClick={resetFilters} className="px-6 py-2.5 border border-zinc-900 dark:border-white text-[11px] uppercase tracking-widest font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300">
                Xoá Bộ Lọc
              </button>
            </div>
          ) : (
            <div
              className="grid gap-x-6 gap-y-12 animate-fade-in"
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {filteredProducts.map(product => (
                <ShopProductCard
                  key={product._id}
                  product={product}
                  onBuyNow={handleBuyNowClick}
                  compact={gridCols >= 4}
                  onRequireAuth={() => setIsAuthModalOpen(true)}
                />
              ))}
            </div>
          )}
        </div>
      </div>



      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
        cartTotal={null}
      />
    </div>
  );
};