import React, { useEffect, useState, useRef } from 'react';
import { ReviewSection } from '../components/ProductDetail/ReviewSection';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getProduct, getProducts } from '../api';
import CheckoutModal from '../components/CheckoutModal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Heart, Truck, RotateCcw, ShieldCheck, ChevronDown, ChevronUp,
  ZoomIn, Star, Share2, Copy, Check, Gem, Award, Tag, Ruler,
  Package, ChevronLeft, ChevronRight, BadgeCheck
} from 'lucide-react';

// ─── Mã giảm giá (đồng bộ với DB — xem seedCoupons.js) ──────────────────────
const COUPONS = [
  { code: 'ARUME10',    desc: 'Giảm 10% cho đơn từ $50',           discount: '10%',       type: 'percent',  min: 50,  color: 'from-amber-50 to-yellow-50',    border: 'border-amber-200',  badge: 'Mới' },
  { code: 'WELCOME30',  desc: 'Giảm 30% cho khách hàng mới (tối đa $50)', discount: '30%', type: 'percent',  min: 0,   color: 'from-purple-50 to-indigo-50',  border: 'border-purple-200', badge: 'Mới' },
  { code: 'FREESHIP200',desc: 'Miễn phí vận chuyển nhanh từ $200', discount: 'Free Ship', type: 'ship',     min: 200, color: 'from-green-50 to-emerald-50',   border: 'border-green-200',  badge: 'HOT' },
  { code: 'SALE15',     desc: 'Giảm 15% toàn bộ sản phẩm (tối đa $30)',  discount: '15%', type: 'percent',  min: 0,   color: 'from-orange-50 to-red-50',     border: 'border-orange-200', badge: 'Sale' },
];

// ─── Copy coupon ──────────────────────────────────────────────────────────────
const CouponCard = ({ coupon }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={`relative flex items-center gap-0 border ${coupon.border} rounded-lg overflow-hidden bg-gradient-to-r ${coupon.color} flex-shrink-0 w-[220px]`}>
      {/* Discount pill */}
      <div className="flex-shrink-0 px-3 py-4 flex flex-col items-center justify-center border-r border-dashed border-gray-300 min-w-[64px]">
        <span className="text-lg font-black text-gray-900 leading-none">{coupon.discount}</span>
        <span className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">OFF</span>
      </div>
      {/* Info */}
      <div className="flex-1 px-3 py-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 rounded-sm">{coupon.badge}</span>
        </div>
        <p className="text-xs text-gray-600 leading-tight mb-1.5">{coupon.desc}</p>
        <div className="flex items-center gap-1.5">
          <code className="text-[11px] font-black tracking-widest text-gray-900 bg-white/70 px-2 py-0.5 rounded border border-dashed border-gray-300">{coupon.code}</code>
          <button onClick={copy} className="p-1 hover:bg-white/60 rounded transition-colors">
            {copied ? <Check size={11} className="text-green-600" /> : <Copy size={11} className="text-gray-500" />}
          </button>
        </div>
      </div>
      {/* Circles notch */}
      <div className="absolute left-[64px] -top-2 w-4 h-4 rounded-full bg-white border border-dashed border-gray-300" />
      <div className="absolute left-[64px] -bottom-2 w-4 h-4 rounded-full bg-white border border-dashed border-gray-300" />
    </div>
  );
};

// ─── Accordion ────────────────────────────────────────────────────────────────
const Accordion = ({ title, children, defaultOpen = false, icon }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 text-xs uppercase tracking-[0.18em] font-semibold text-left hover:text-[#C9A96E] transition-colors dark:text-gray-200"
      >
        <span className="flex items-center gap-2">{icon}{title}</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-[fadeIn_0.2s_ease]">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Stars ────────────────────────────────────────────────────────────────────
const Stars = ({ rating = 5, count = 0 }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} className={i <= rating ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-gray-200'} />
      ))}
    </div>
    {count > 0 && <span className="text-[11px] text-gray-400">({count} đánh giá)</span>}
  </div>
);

// ─── Gallery ──────────────────────────────────────────────────────────────────
const Gallery = ({ images }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  const fallback = '/assets/images/Adriana Pearl Bracelet 1.webp';
  const handleImgError = (e) => { e.target.src = fallback; };

  return (
    <div className="flex gap-4 sticky top-24 h-max">
      {/* Thumbnails — chỉ hiện khi có > 1 ảnh */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-[60px]">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-full aspect-square border-2 transition-all overflow-hidden bg-[#F4F2EE] rounded-sm
                ${active === i ? 'border-black dark:border-white' : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'}`}
            >
              <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover" onError={handleImgError} />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 relative overflow-hidden bg-[#F4F2EE] group" style={{ aspectRatio: '3/4' }}>
        <img
          src={images[active]}
          alt="product"
          className={`w-full h-full object-cover transition-transform duration-700 cursor-zoom-in ${zoomed ? 'scale-150' : 'group-hover:scale-105'}`}
          onClick={() => setZoomed(!zoomed)}
          onError={handleImgError}
        />
        {/* Zoom icon */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm">
          <ZoomIn size={14} className="text-gray-600" />
        </div>
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronLeft size={14} />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronRight size={14} />
            </button>
          </>
        )}
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${active === i ? 'bg-black w-4' : 'bg-white/70'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Related Products ─────────────────────────────────────────────────────────
const RelatedProducts = ({ products, category, currentId }) => {
  const related = products
    .filter(p => p.category === category && p._id !== currentId)
    .slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="mt-24 pt-16 border-t border-gray-200 dark:border-gray-800">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-[#C9A96E] mb-2">Gợi ý cho bạn</p>
        <h2 className="text-2xl font-serif italic dark:text-white">Có thể bạn cũng thích</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map(p => (
          <Link to={`/product/${p._id}`} key={p._id} className="group flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F2EE] mb-3">
              <img src={p.image} alt={p.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {p.isNewProduct && <span className="absolute top-2 left-2 text-[11px] bg-black text-white px-2 py-0.5 font-bold uppercase">Mới</span>}
              {p.isBestSeller && <span className="absolute top-2 left-2 text-[11px] bg-[#C9A96E] text-white px-2 py-0.5 font-bold uppercase">Hot</span>}
            </div>
            <p className="text-xs uppercase tracking-widest text-[#C9A96E] font-medium">{p.jewelleryType || p.category || 'ARUME'}</p>
            <h3 className="text-sm font-serif group-hover:text-[#C9A96E] transition-colors dark:text-white leading-snug mt-0.5">{p.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">${p.price?.toFixed(2)}</span>
              {p.originalPrice > p.price && <span className="text-xs text-gray-400 line-through">${p.originalPrice?.toFixed(2)}</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProduct(id),
      getProducts()
    ])
      .then(([r1, r2]) => {
        setProduct(r1.data);
        setAllProducts(r2.data);
        setLoading(false);
      })
      .catch(() => { setError('Không thể tải sản phẩm.'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
      <div className="text-center">
        <div className="w-8 h-8 border border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif italic text-gray-400 text-sm">Đang tải...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  );

  const isFav = isInWishlist(product._id);

  // Build image array: gộp ảnh chính + ảnh phụ, lọc null/rỗng
  const FALLBACK = '/assets/images/Adriana Pearl Bracelet 1.webp';
  const extraImages = (product.images || []).filter(Boolean);
  const mainImage = product.image || '';
  const allImgs = mainImage
    ? [mainImage, ...extraImages.filter(i => i !== mainImage)]
    : extraImages;
  const images = allImgs.length > 0 ? allImgs : [FALLBACK];

  const sizes = product.size || [];

  // Discount % nếu có giá gốc
  const discountPct = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShareMsg(true);
    setTimeout(() => setShareMsg(false), 2000);
  };

  return (
    <div className="bg-[#F9F7F2] dark:bg-gray-900 min-h-screen pt-28 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Breadcrumb */}
        <nav className="text-xs uppercase tracking-widest text-gray-400 mb-10 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-black dark:hover:text-white transition-colors">Bộ sưu tập</Link>
          {product.collectionName && (
            <>
              <span>/</span>
              <span className="text-[#C9A96E]">{product.collectionName}</span>
            </>
          )}
          <span>/</span>
          <span className="text-black dark:text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* ── Gallery ── */}
          <Gallery images={images} />

          {/* ── Product Info ── */}
          <div className="flex flex-col">

            {/* Top bar: collection + share */}
            <div className="flex justify-between items-start mb-3">
              <div>
                {product.collectionName && (
                  <p className="text-xs uppercase tracking-[0.25em] text-[#C9A96E] font-bold mb-0.5">{product.collectionName}</p>
                )}
                {product.jewelleryType && (
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">{product.jewelleryType}</p>
                )}
              </div>
              <button onClick={handleShare} className="relative text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1.5 hover:bg-gray-100 rounded-full">
                <Share2 size={15} />
                {shareMsg && (
                  <span className="absolute -bottom-8 right-0 bg-black text-white text-[11px] px-2 py-1 rounded whitespace-nowrap">Đã copy!</span>
                )}
              </button>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-serif italic mb-3 dark:text-white leading-tight">{product.name}</h1>

            {/* Rating – sẽ được cập nhật khi load reviews */}
            <div className="mb-4">
              <Stars rating={5} count={0} />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {product.isNewProduct && (
                <span className="text-[11px] font-black uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-sm">Sản phẩm mới</span>
              )}
              {product.isBestSeller && (
                <span className="text-[11px] font-black uppercase tracking-widest bg-[#C9A96E] text-white px-2.5 py-1 rounded-sm">Bán chạy</span>
              )}
              {product.isLimitedEdition && (
                <span className="text-[11px] font-black uppercase tracking-widest bg-purple-600 text-white px-2.5 py-1 rounded-sm">Phiên bản giới hạn</span>
              )}
              {product.certification && (
                <span className="text-[11px] font-bold uppercase tracking-widest border border-[#C9A96E] text-[#C9A96E] px-2.5 py-1 rounded-sm flex items-center gap-1">
                  <BadgeCheck size={10} /> {product.certification}
                </span>
              )}
            </div>

            {/* Price block */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${product.price?.toFixed(2)}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">${product.originalPrice?.toFixed(2)}</span>
                    <span className="text-xs font-black bg-red-500 text-white px-2 py-0.5 rounded-full">-{discountPct}%</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400">Đã bao gồm thuế · Phí ship tính tại trang thanh toán</p>

              {/* Stock */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-400'} animate-pulse`} />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {product.stock > 5
                    ? `Còn hàng (${product.stock} sản phẩm)`
                    : product.stock > 0
                      ? `Chỉ còn ${product.stock} sản phẩm – Mua ngay!`
                      : 'Tạm hết hàng'}
                </span>
              </div>
            </div>

            {/* Specs nhanh */}
            {(product.material || product.goldType || product.gemstone || product.weight) && (
              <div className="grid grid-cols-2 gap-2 mb-5">
                {product.goldType && (
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-amber-100 dark:border-gray-700">
                    <Gem size={12} className="text-[#C9A96E] flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400">Vàng</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">{product.goldType}</p>
                    </div>
                  </div>
                )}
                {product.gemstone && (
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-blue-100 dark:border-gray-700">
                    <Star size={12} className="text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400">Đá quý</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">{product.gemstone}</p>
                    </div>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    <Package size={12} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400">Chất liệu</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">{product.material}</p>
                    </div>
                  </div>
                )}
                {product.weight && (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    <Ruler size={12} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-400">Trọng lượng</p>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">{product.weight}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2.5">
                  <p className="text-xs uppercase tracking-widest font-bold dark:text-white">
                    Kích thước {selectedSize && <span className="text-[#C9A96E] normal-case font-normal">— {selectedSize}</span>}
                  </p>
                  <button className="text-xs text-gray-400 hover:text-black underline underline-offset-2 transition-colors">Hướng dẫn chọn size</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s === selectedSize ? '' : s)}
                      className={`min-w-[44px] px-4 py-2.5 text-xs font-bold uppercase border-2 transition-all rounded-sm
                        ${selectedSize === s
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                          : 'border-gray-200 text-gray-600 hover:border-black dark:text-gray-300 dark:border-gray-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add */}
            <div className="flex gap-2 mb-3">
              <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors text-lg font-light">−</button>
                <span className="w-10 text-center text-sm font-bold dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors text-lg font-light">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 h-11 text-xs uppercase tracking-widest font-bold transition-all duration-300 border-2 rounded-sm
                  ${addedMsg
                    ? 'bg-green-600 text-white border-green-600'
                    : product.stock <= 0
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black'}`}
              >
                {addedMsg ? '✓ Đã thêm vào giỏ' : product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-11 h-11 flex items-center justify-center border-2 rounded-sm transition-all
                  ${isFav ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-black dark:border-gray-600'}`}
              >
                <Heart size={16} className={isFav ? 'fill-red-400 text-red-400' : 'text-gray-400'} />
              </button>
            </div>

            {/* Buy Now */}
            <button
              onClick={() => {
                setIsCheckoutOpen(true);
              }}
              disabled={product.stock <= 0}
              className="w-full bg-black text-white h-13 py-4 text-xs uppercase tracking-[0.25em] font-black hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-40 mb-6 rounded-sm"
            >
              Mua ngay
            </button>

            {/* Trust icons */}
            <div className="grid grid-cols-3 gap-2 mb-6 py-4 border-y border-gray-100 dark:border-gray-800">
              {[
                { icon: <Truck size={18} />, text: 'Miễn phí ship', sub: 'Đơn từ $100' },
                { icon: <RotateCcw size={18} />, text: 'Đổi trả 30 ngày', sub: 'Miễn phí' },
                { icon: <ShieldCheck size={18} />, text: 'Bảo hành 1 năm', sub: 'Chính hãng' },
              ].map(({ icon, text, sub }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1 text-gray-600 dark:text-gray-300 px-2">
                  <span className="text-[#C9A96E]">{icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider leading-tight">{text}</span>
                  <span className="text-[11px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* ── Mã giảm giá ── */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-[#C9A96E]" />
                <p className="text-xs uppercase tracking-widest font-bold text-gray-700 dark:text-white">Mã giảm giá</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {COUPONS.map(coupon => (
                  <CouponCard key={coupon.code} coupon={coupon} />
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2 italic">* Nhấn vào mã để sao chép. Áp dụng tại trang thanh toán.</p>
            </div>

            {/* Accordions */}
            <div>
              <Accordion title="Mô tả sản phẩm" defaultOpen={true} icon={<Package size={12} className="text-[#C9A96E]" />}>
                <p className="leading-relaxed">{product.description || 'Một sản phẩm mang đậm phong cách ARUME – sự kết hợp hoàn hảo giữa thiết kế đương đại và chất liệu cao cấp. Từng đường nét được chăm chút tỉ mỉ để mang đến trải nghiệm tuyệt vời nhất.'}</p>
              </Accordion>

              <Accordion title="Chất liệu & Chăm sóc" icon={<Gem size={12} className="text-[#C9A96E]" />}>
                <ul className="space-y-2.5 text-gray-600 dark:text-gray-300">
                  {product.material && <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Chất liệu: <span className="font-semibold">{product.material}</span></li>}
                  {product.goldType && <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Loại vàng: <span className="font-semibold">{product.goldType}</span></li>}
                  {product.gemstone && <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Đá quý: <span className="font-semibold">{product.gemstone}</span></li>}
                  {product.weight && <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Trọng lượng: <span className="font-semibold">{product.weight}</span></li>}
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Tránh tiếp xúc với nước hoa, hóa chất và nước</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Lau nhẹ bằng vải mềm sau khi sử dụng</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Đưa đến cửa hàng ARUME để vệ sinh định kỳ</li>
                </ul>
              </Accordion>

              <Accordion title="Vận chuyển & Đổi trả" icon={<Truck size={12} className="text-[#C9A96E]" />}>
                <ul className="space-y-2.5 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Miễn phí giao hàng cho đơn từ $100</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Giao hàng trong 3–5 ngày làm việc</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Đổi trả miễn phí trong vòng 30 ngày</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Sản phẩm phải còn nguyên tem, chưa qua sử dụng</li>
                  <li className="flex items-start gap-2"><span className="text-[#C9A96E] mt-0.5">•</span> Hỗ trợ đổi size miễn phí 1 lần</li>
                </ul>
              </Accordion>

              {product.certification && (
                <Accordion title="Chứng nhận & Bảo đảm" icon={<Award size={12} className="text-[#C9A96E]" />}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award size={20} className="text-[#C9A96E]" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white mb-1">Chứng nhận {product.certification}</p>
                      <p className="text-gray-500 text-sm">Sản phẩm này đi kèm chứng nhận chất lượng quốc tế {product.certification}, đảm bảo nguồn gốc và tiêu chuẩn chất lượng cao nhất.</p>
                    </div>
                  </div>
                </Accordion>
              )}

              <Accordion title="Câu hỏi thường gặp" icon={<ChevronDown size={12} className="text-[#C9A96E]" />}>
                <div className="space-y-5">
                  {[
                    ['Sản phẩm có chứng nhận không?', 'Tất cả sản phẩm ARUME đều có chứng nhận chất lượng và xuất xứ rõ ràng.'],
                    ['Tôi có thể đặt hàng theo yêu cầu riêng không?', 'Có, vui lòng liên hệ chúng tôi qua trang Contact để được tư vấn cá nhân hóa.'],
                    ['Chính sách bảo hành như thế nào?', 'ARUME bảo hành 12 tháng cho tất cả sản phẩm. Bảo hành miễn phí lỗi từ nhà sản xuất.'],
                    ['Có thể khắc tên lên sản phẩm không?', 'Dịch vụ khắc laser có thêm phí. Liên hệ để biết thêm chi tiết và thời gian thực hiện.'],
                  ].map(([q, a]) => (
                    <div key={q} className="border-l-2 border-[#C9A96E]/30 pl-4">
                      <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{q}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>

          </div>
        </div>

        {/* Customer Reviews */}
        <ReviewSection productId={product._id} />

        {/* Related Products */}
        <RelatedProducts products={allProducts} category={product.category} currentId={product._id} />

      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={{ ...product, quantity, selectedSize }}
        cartTotal={null}
      />
    </div>
  );
};