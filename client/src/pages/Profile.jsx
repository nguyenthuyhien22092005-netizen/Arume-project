import React, { useState, useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API, { getMyOrders, changePassword, cancelMyOrder, createReview } from '../api';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, MapPin, FileText, ArrowLeft, AlertCircle, X } from 'lucide-react';

// -- Status helpers --
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

// -- Tracking Timeline --
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

// -- Order Card --
const OrderCard = ({ order, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null); // id của product đang review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = async (productId) => {
    setIsSubmittingReview(true);
    setReviewMsg({ type: '', text: '' });
    try {
      await createReview(productId, { rating, comment });
      setReviewMsg({ type: 'success', text: 'Cảm ơn bạn đã đánh giá!' });
      setTimeout(() => {
        setReviewingItem(null);
        setReviewMsg({ type: '', text: '' });
        setRating(5);
        setComment('');
      }, 2000);
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
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

                {order.status === 'Đã giao' && (
                  <div className="w-full sm:w-auto mt-2 sm:mt-0">
                    {reviewingItem === item.product?._id ? (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 mt-2 rounded-lg text-sm border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-xs font-semibold mr-2">Đánh giá:</span>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} className={`text-lg focus:outline-none transition-colors ${star <= rating ? 'text-[#C9A96E]' : 'text-gray-300'}`}>
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          className="w-full text-xs p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:border-black dark:focus:border-white outline-none resize-none mb-2"
                          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                        />
                        {reviewMsg.text && (
                          <p className={`text-xs mb-2 ${reviewMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {reviewMsg.text}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => setReviewingItem(null)} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300 transition">Hủy</button>
                          <button onClick={() => handleSubmitReview(item.product?._id)} disabled={isSubmittingReview} className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition disabled:opacity-50">
                            {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setReviewingItem(item.product?._id); setRating(5); setComment(''); setReviewMsg({type:'', text:''}); }}
                        className="text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        Viết đánh giá
                      </button>
                    )}
                  </div>
                )}
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
                <span className="text-green-600 font-bold">-${(order.discountAmount || 0).toFixed(2)}</span>
              )}
            </div>
          )}

          {/* Tracking */}
          <TrackingTimeline order={order} />
          {/* Action Buttons for Order */}
          <div className="flex justify-end mt-4">
            {(order.status === 'Đang xử lý' || order.status === 'Chờ thanh toán') && (
              <button 
                onClick={() => onCancel(order._id)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2 transition-colors"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// -- Main Profile Page --
export const Profile = () => {
  const { wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // State for Profile Update
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelToast, setCancelToast] = useState({ show: false, message: '', type: '' });
  const [updating, setUpdating] = useState(false);

  // State for Change Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [changingPwd, setChangingPwd] = useState(false);

  // State for Default Address
  const [address, setAddress] = useState({ name: '', phone: '', address: '', district: '', province: '' });

  useEffect(() => {
    if (!user) navigate('/');
    else {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.defaultAddress) {
        setAddress(user.defaultAddress);
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      setOrdersLoading(true);
      getMyOrders()
        .then(res => { setOrders(res.data); setOrdersLoading(false); })
        .catch(() => { setOrders([]); setOrdersLoading(false); });
    }
  }, [user, activeTab]);

  const handleCancelClick = (orderId) => {
    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      await cancelMyOrder(orderToCancel);
      // Refresh orders
      const { data } = await getMyOrders();
      setOrders(data);
      
      setCancelToast({ show: true, message: 'Đã hủy đơn hàng thành công', type: 'success' });
    } catch (err) {
      setCancelToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng', type: 'error' });
    } finally {
      setCancelModalOpen(false);
      setOrderToCancel(null);
      setTimeout(() => setCancelToast({ show: false, message: '', type: '' }), 4000);
    }
  };

  if (!user) return null;

  const tabs = [
    { id: 'orders', label: 'Lịch sử mua hàng' },
    { id: 'wishlist', label: 'Danh sách yêu thích' },
    { id: 'account', label: 'Thông tin tài khoản' },
  ];

  return (
    <>
      {/* Toast Notification */}
      {cancelToast.show && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${cancelToast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {cancelToast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{cancelToast.message}</span>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setCancelModalOpen(false); setOrderToCancel(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-serif italic mb-2 dark:text-white">Xác nhận hủy đơn</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => { setCancelModalOpen(false); setOrderToCancel(null); }}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Đóng
                </button>
                <button 
                  onClick={confirmCancelOrder}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold uppercase tracking-widest transition-colors"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="bg-[#F9F7F2] dark:bg-gray-900 min-h-screen pt-28 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Nút quay lại */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={14} /> Trang chủ
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-300 dark:border-gray-700 pb-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-serif italic dark:text-white">{user.name}</h1>
              <span className="px-3 py-1 bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] text-[10px] uppercase tracking-widest font-bold">
                {user.memberTier || 'MEMBER'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
            
            {/* Thanh tiến trình VIP */}
            {user.memberTier !== 'VIP' && (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  <span>Chi tiêu: ${((user.totalSpent || 0)).toFixed(0)}</span>
                  <span>
                    Mục tiêu: ${user.memberTier === 'MEMBER' ? '1000 (GOLD)' : '5000 (VIP)'}
                  </span>
                </div>
                <div className="h-1 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div 
                    className="h-full bg-[#C9A96E] transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(100, ((user.totalSpent || 0) / (user.memberTier === 'MEMBER' ? 1000 : 5000)) * 100)}%` 
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                  Mua thêm ${(user.memberTier === 'MEMBER' ? 1000 - (user.totalSpent || 0) : 5000 - (user.totalSpent || 0)).toFixed(0)} để thăng hạng
                </p>
              </div>
            )}
            {user.memberTier === 'VIP' && (
              <p className="text-xs text-[#C9A96E]">Chúc mừng! Bạn đã đạt hạng VIP cao nhất. Đừng quên dùng mã VIP20.</p>
            )}
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
                      <OrderCard key={order._id} order={order} onCancel={handleCancelClick} />
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
                {updateMsg.text && (
                  <div className={`mb-6 p-4 text-sm flex items-center gap-2 ${updateMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {updateMsg.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {updateMsg.text}
                  </div>
                )}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Họ và tên</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Số điện thoại</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Chưa cập nhật" className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Email</label>
                    <input type="email" value={user.email} disabled className="w-full border-b border-gray-300 dark:border-gray-700 py-2 outline-none bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                  </div>
                  
                  {/* Địa chỉ mặc định */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                    <h3 className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 font-semibold">Địa chỉ giao hàng mặc định</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Họ Tên người nhận</label>
                        <input type="text" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Số điện thoại nhận hàng</label>
                        <input type="text" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Địa chỉ cụ thể (Số nhà, đường...)</label>
                      <input type="text" value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Quận / Huyện</label>
                        <input type="text" value={address.district} onChange={e => setAddress({ ...address, district: e.target.value })} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Tỉnh / Thành phố</label>
                        <input type="text" value={address.province} onChange={e => setAddress({ ...address, province: e.target.value })} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                      </div>
                    </div>
                  </div>
                    <button 
                    onClick={async () => {
                      setUpdating(true);
                      setUpdateMsg({ type: '', text: '' });
                      try {
                        const { data } = await API.put('/auth/profile', { name, phone, defaultAddress: address });
                        setUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setUpdateMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
                        setTimeout(() => setUpdateMsg({ type: '', text: '' }), 3000);
                      } catch (err) {
                        setUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    disabled={updating}
                    className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-sm uppercase tracking-[0.2em] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mt-4 disabled:opacity-50"
                  >
                    {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>

                {/* Đổi mật khẩu */}
                <h2 className="text-2xl font-serif italic mb-8 mt-16 dark:text-white border-t border-gray-100 dark:border-gray-700 pt-8">Đổi mật khẩu</h2>
                {pwdMsg.text && (
                  <div className={`mb-6 p-4 text-sm flex items-center gap-2 ${pwdMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {pwdMsg.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {pwdMsg.text}
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Mật khẩu hiện tại</label>
                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Mật khẩu mới</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Xác nhận mật khẩu mới</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border-b border-gray-300 dark:border-gray-600 py-2 outline-none focus:border-black dark:focus:border-white transition-colors bg-transparent text-black dark:text-white" />
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (newPassword !== confirmPassword) {
                        setPwdMsg({ type: 'error', text: 'Mật khẩu mới không khớp' });
                        return;
                      }
                      setChangingPwd(true);
                      setPwdMsg({ type: '', text: '' });
                      try {
                        const { data } = await changePassword({ oldPassword, newPassword });
                        setPwdMsg({ type: 'success', text: data.message || 'Đổi mật khẩu thành công!' });
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setTimeout(() => setPwdMsg({ type: '', text: '' }), 3000);
                      } catch (err) {
                        setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi khi đổi mật khẩu.' });
                      } finally {
                        setChangingPwd(false);
                      }
                    }}
                    disabled={changingPwd}
                    className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-sm uppercase tracking-[0.2em] font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors mt-4 disabled:opacity-50"
                  >
                    {changingPwd ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
    </>
  );
};