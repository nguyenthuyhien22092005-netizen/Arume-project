import React, { useState, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getMyOrders } from '../api';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, MapPin, FileText } from 'lucide-react';

// ── Status helpers ────────────────────────────────────────────────────────────
const statusConfig = {
  'Đang xử lý':  { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock,       step: 0 },
  'Đã xác nhận': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',         icon: CheckCircle, step: 1 },
  'Đang giao':   { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Truck,       step: 2 },
  'Đã giao':     { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',     icon: CheckCircle, step: 3 },
  'Đã hủy':      { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',             icon: XCircle,     step: -1 },
};
const STATUS_STEPS = ['Đang xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao'];

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig['Đang xử lý'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-widest font-semibold rounded-sm ${cfg.color}`}>
      <Icon size={11} />
      {status}
    </span>
  );
};

// ── Tracking Timeline ─────────────────────────────────────────────────────────
const TrackingTimeline = ({ order }) => {
  const currentStep = statusConfig[order.status]?.step ?? 0;
  const cancelled = order.status === 'Đã hủy';

  return (
    <div className="mt-4">
      {/* Progress steps */}
      {!cancelled && (
        <div className="flex items-center justify-between mb-6 relative">
          <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-gray-100 dark:bg-gray-700 z-0" />
          <div
            className="absolute top-3.5 left-0 h-[2px] bg-[#C9A96E] z-0 transition-all duration-700"
            style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentStep;
            return (
              <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-xs font-bold
                  ${done ? 'bg-[#C9A96E] border-[#C9A96E] text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-[9px] uppercase tracking-wider text-center max-w-[60px] leading-tight font-medium
                  ${done ? 'text-[#C9A96E]' : 'text-gray-400 dark:text-gray-600'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking history */}
      {order.trackingHistory && order.trackingHistory.length > 0 && (
        <div className="border-l-2 border-gray-100 dark:border-gray-700 ml-3 space-y-4">
          {[...order.trackingHistory].reverse().map((entry, i) => (
            <div key={i} className="pl-5 relative">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-[#C9A96E]" />
              <p className="font-semibold text-sm dark:text-white">{entry.status}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entry.description}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {new Date(entry.timestamp).toLocaleString('vi-VN')}
                {entry.updatedBy && ` · ${entry.updatedBy}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {order.trackingNumber && (
        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-3 py-2">
          <Truck size={12} />
          Mã vận đơn: <span className="font-mono font-bold">{order.trackingNumber}</span>
        </div>
      )}
    </div>
  );
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header row */}
      <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-bold font-mono text-sm dark:text-white">
              {order.orderCode || `#${order._id?.slice(-8).toUpperCase()}`}
            </p>
            <StatusBadge status={order.status || 'Đang xử lý'} />
            {order.paymentStatus === 'Đã thanh toán' && (
              <span className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider">
                Đã thanh toán
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}{order.items?.length || 0} sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="font-serif italic text-lg dark:text-white">${(order.totalPrice || 0).toFixed(2)}</p>
          <Link
            to={`/invoice/${order._id}`}
            className="text-xs text-[#C9A96E] hover:text-[#a8843d] flex items-center gap-1 transition"
            title="Xem hóa đơn"
          >
            <FileText size={13} />
            <span className="hidden sm:inline">Hóa đơn</span>
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition"
          >
            {expanded ? <><ChevronUp size={13} />Thu gọn</> : <><ChevronDown size={13} />Chi tiết</>}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Products */}
          <div className="space-y-3">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                  {item.product?.image
                    ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    : <Package size={16} className="m-auto text-gray-300 mt-3" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">{item.product?.name || 'Sản phẩm'}</p>
                  <p className="text-xs text-gray-400">×{item.quantity} {item.size ? `· Size ${item.size}` : ''}</p>
                </div>
                <span className="text-sm font-semibold dark:text-white whitespace-nowrap">
                  ${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          {(order.shippingAddress || order.address) && (
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3">
              <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#C9A96E]" />
              <div>
                {order.shippingAddress ? (
                  <>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{order.shippingAddress.name} · {order.shippingAddress.phone}</span>
                    <br />{order.shippingAddress.address}{order.shippingAddress.district ? ', ' + order.shippingAddress.district : ''}, {order.shippingAddress.province}
                  </>
                ) : (
                  order.address
                )}
              </div>
            </div>
          )}

          {/* Discount / Coupon info */}
          {order.couponCode && (
            <div className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
              <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 font-semibold">
                🏷️ Mã giảm giá: <span className="font-mono">{order.couponCode}</span>
              </span>
              {order.discountAmount > 0 && (
                <span className="text-green-600 font-bold">−${(order.discountAmount || 0).toFixed(2)}</span>
              )}
            </div>
          )}

          {/* Tracking */}
          <TrackingTimeline order={order} />
        </div>
      )}
    </div>
  );
};

// ── Main Profile Page ─────────────────────────────────────────────────────────
export const Profile = () => {
  const { wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      setOrdersLoading(true);
      getMyOrders()
        .then(res => { setOrders(res.data); setOrdersLoading(false); })
        .catch(() => { setOrders([]); setOrdersLoading(false); });
    }
  }, [user, activeTab]);

  if (!user) return null;

  const tabs = [
    { id: 'orders', label: 'Lịch sử mua hàng' },
    { id: 'wishlist', label: 'Danh sách yêu thích' },
    { id: 'account', label: 'Thông tin tài khoản' },
  ];

  return (
    <div className="bg-[#F9F7F2] dark:bg-gray-900 min-h-screen pt-28 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-300 dark:border-gray-700 pb-8 mb-12">
          <div>
            <h1 className="text-3xl font-serif italic dark:text-white mb-1">{user.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            {user.memberTier && <p className="text-xs uppercase tracking-widest text-[#C9A96E] mt-1">{user.memberTier}</p>}
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm uppercase tracking-widest text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-semibold border-b border-red-800 dark:border-red-400 pb-1 mt-6 md:mt-0">
            Đăng xuất
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-16">

          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <ul className="space-y-4 text-sm uppercase tracking-[0.15em] font-semibold">
              {tabs.map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full text-left py-3 border-b transition-colors ${activeTab === t.id ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    {t.label}
                    {t.id === 'orders' && orders.length > 0 && (
                      <span className="ml-2 bg-[#C9A96E] text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">{orders.length}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="flex-1">

            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-serif italic dark:text-white">Lịch sử mua hàng</h2>
                  {orders.length > 0 && (
                    <span className="text-xs text-gray-400 font-light">{orders.length} đơn hàng</span>
                  )}
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 animate-pulse h-24" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <Package size={40} className="mx-auto text-gray-200 dark:text-gray-600 mb-4" />
                    <p className="font-serif italic text-gray-400 text-lg mb-2">Chưa có đơn hàng nào</p>
                    <p className="text-xs text-gray-400 mb-6">Hãy bắt đầu mua sắm và quay lại đây để theo dõi đơn hàng</p>
                    <button onClick={() => navigate('/collections/All products')} className="text-xs uppercase tracking-widest border border-black dark:border-white px-6 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">
                      Khám phá bộ sưu tập
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <OrderCard key={order._id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist tab */}
            {activeTab === 'wishlist' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-serif italic mb-8 dark:text-white">Danh sách yêu thích</h2>
                {wishlistItems.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 font-light italic">Bạn chưa lưu tuyệt tác nào.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlistItems.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Account tab */}
            {activeTab === 'account' && (
              <div className="animate-fade-in bg-white dark:bg-gray-800 p-8 border border-gray-100 dark:border-gray-700 max-w-2xl">
                <h2 className="text-2xl font-serif italic mb-8 dark:text-white">Thông tin cá nhân</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Họ và tên</label>
                      <input type="text" defaultValue={user.name} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Số điện thoại</label>
                      <input type="text" defaultValue={user.phone} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Email</label>
                    <input type="email" defaultValue={user.email} disabled className="w-full border-b border-gray-300 dark:border-gray-700 py-2 outline-none bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                  </div>
                  <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-sm uppercase tracking-[0.2em] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mt-4">
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
