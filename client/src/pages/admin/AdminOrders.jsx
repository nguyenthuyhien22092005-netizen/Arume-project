import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Eye, X, Package, MapPin, User,
  Truck, CheckCircle, Clock, XCircle, ChevronDown, Filter,
  CreditCard, Edit3, Save, Tag, AlertTriangle, FileText, Printer
} from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../../api';
import API from '../../api';

const STATUS_OPTIONS = ['Đang xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];
const PAYMENT_STATUS = ['Chưa thanh toán', 'Đã thanh toán'];

const statusColor = (status) => {
  if (status === 'Đã giao')     return 'bg-green-100 text-green-700';
  if (status === 'Đang giao')   return 'bg-blue-100 text-blue-700';
  if (status === 'Đã xác nhận') return 'bg-indigo-100 text-indigo-700';
  if (status === 'Đã hủy')      return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
};

const paymentColor = (status) =>
  status === 'Đã thanh toán'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-gray-100 text-gray-500';

// ── Order Detail Modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onStatusChange }) => {
  const [status, setStatus] = useState(order.status || 'Đang xử lý');
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'Chưa thanh toán');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [adminNote, setAdminNote] = useState(order.adminNote || '');
  const [customDesc, setCustomDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const statusDescDefaults = {
    'Đã xác nhận': 'Đơn hàng đã được xác nhận, đang chuẩn bị hàng',
    'Đang giao':   'Đơn hàng đang trên đường vận chuyển',
    'Đã giao':     'Giao hàng thành công',
    'Đã hủy':      'Đơn hàng đã bị hủy',
  };

  // FIX: dùng state `status` thay vì biến `newStatus` undefined
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        status,
        paymentStatus,
        trackingNumber: trackingNumber || undefined,
        adminNote: adminNote || undefined,
        description: customDesc || statusDescDefaults[status] || undefined,
      };
      const res = await API.put(`/orders/${order._id}/status`, payload);
      onStatusChange(order._id, res.data);
      onClose();
    } catch (err) {
      alert('Cập nhật thất bại: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900">Chi tiết đơn hàng</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              {order.orderCode || `#${order._id.slice(-10).toUpperCase()}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/invoice/${order._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white rounded-lg transition-colors"
              title="Xem hóa đơn"
            >
              <FileText size={13} />
              Hóa đơn
            </a>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Customer info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-gray-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Khách hàng</span>
            </div>
            <p className="font-semibold text-gray-900">{order.user?.name || 'Khách vãng lai'}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
          </div>

          {/* Shipping address */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Địa chỉ giao hàng</span>
            </div>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-semibold">{order.shippingAddress.name} · {order.shippingAddress.phone}</p>
                {order.shippingAddress.email && <p className="text-gray-400">{order.shippingAddress.email}</p>}
                <p>{order.shippingAddress.address}{order.shippingAddress.district ? ', ' + order.shippingAddress.district : ''}, {order.shippingAddress.province}</p>
                {order.shippingAddress.note && <p className="italic text-gray-400">Ghi chú: {order.shippingAddress.note}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-700">{order.address || 'Chưa có địa chỉ'}</p>
            )}
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-gray-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Sản phẩm ({order.items?.length || 0})
              </span>
            </div>
            <div className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.image
                      ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      : <Package size={16} className="m-auto text-gray-300 mt-3" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Sản phẩm đã xóa'}</p>
                    <p className="text-xs text-gray-400">
                      {item.size && <span>Size: {item.size} · </span>}
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals + coupon */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {order.couponCode && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1"><Tag size={12} /> Mã giảm giá ({order.couponCode})</span>
                <span className="text-green-600 font-semibold">−${(order.discountAmount || 0).toFixed(2)}</span>
              </div>
            )}
            {order.shippingDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Freeship</span>
                <span className="text-green-600 font-semibold">−${order.shippingDiscount.toFixed(2)}</span>
              </div>
            )}
            {order.originalPrice > 0 && order.originalPrice !== order.totalPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Giá gốc</span>
                <span className="line-through text-gray-400">${order.originalPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <div>
                <span className="font-semibold text-gray-700">Tổng cộng</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Thanh toán: {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bank' ? 'Chuyển khoản' : order.paymentMethod === 'momo' ? 'MoMo' : order.paymentMethod || 'COD'}
                </p>
              </div>
              <span className="text-xl font-bold text-gray-900">${(order.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Tracking history */}
          {order.trackingHistory && order.trackingHistory.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">Lịch sử vận chuyển</span>
              <div className="border-l-2 border-gray-100 ml-2 space-y-3">
                {[...order.trackingHistory].reverse().map((entry, i) => (
                  <div key={i} className="pl-4 relative">
                    <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#C9A96E]" />
                    <p className="text-sm font-semibold text-gray-900">{entry.status}</p>
                    <p className="text-xs text-gray-500">{entry.description}</p>
                    <p className="text-[10px] text-gray-400">{new Date(entry.timestamp).toLocaleString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ADMIN CONTROLS ── */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Cập nhật đơn hàng</span>

            {/* Status */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Trạng thái vận chuyển</label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatus(s); setCustomDesc(statusDescDefaults[s] || ''); }}
                    className={`py-2 px-2 text-xs font-semibold border-2 rounded-xl transition-all
                      ${status === s ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom description */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Mô tả cập nhật (hiển thị cho khách)</label>
              <input
                value={customDesc}
                onChange={e => setCustomDesc(e.target.value)}
                placeholder="VD: Đơn hàng đã được bàn giao cho đơn vị vận chuyển..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-black transition"
              />
            </div>

            {/* Tracking number */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Mã vận đơn</label>
              <input
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="VD: VTP-123456789"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-black transition font-mono"
              />
            </div>

            {/* Payment status */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Trạng thái thanh toán</label>
              <div className="flex gap-2">
                {PAYMENT_STATUS.map(ps => (
                  <button
                    key={ps}
                    onClick={() => setPaymentStatus(ps)}
                    className={`flex-1 py-2 text-xs font-semibold border-2 rounded-xl transition-all
                      ${paymentStatus === ps ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 text-gray-500 hover:border-emerald-400'}`}
                  >
                    {ps}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin note */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Ghi chú nội bộ (admin only)</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Ghi chú nội bộ không hiển thị cho khách..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-black transition resize-none"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Đóng
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? 'Đang lưu...' : <><Save size={14} /> Lưu thay đổi</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main AdminOrders ──────────────────────────────────────────────────────────
export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await getAllOrders(params);
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = (id, updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === id ? updatedOrder : o));
  };

  // Stats
  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Đang xử lý').length,
    shipping: orders.filter(o => o.status === 'Đang giao').length,
    delivered: orders.filter(o => o.status === 'Đã giao').length,
    cancelled: orders.filter(o => o.status === 'Đã hủy').length,
    revenue: orders.filter(o => o.status !== 'Đã hủy').reduce((s, o) => s + (o.totalPrice || 0), 0),
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi và cập nhật trạng thái vận chuyển</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Tổng đơn',     val: stats.total,                  color: 'text-gray-900' },
          { label: 'Đang xử lý',   val: stats.processing,             color: 'text-yellow-600' },
          { label: 'Đang giao',    val: stats.shipping,               color: 'text-blue-600' },
          { label: 'Đã giao',      val: stats.delivered,              color: 'text-green-600' },
          { label: 'Đã hủy',       val: stats.cancelled,              color: 'text-red-500' },
          { label: 'Doanh thu',    val: `$${stats.revenue.toFixed(0)}`, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchOrders()}
              placeholder="Tìm mã đơn, địa chỉ... (Enter để tìm)"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-black transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black transition bg-white cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:border-black transition text-gray-600 hover:text-black">
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
            Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={32} className="mx-auto mb-3 text-gray-200" />
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Sản phẩm</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Thanh toán</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Ngày đặt</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs font-bold text-gray-900">
                        {order.orderCode || `#${order._id.slice(-8).toUpperCase()}`}
                      </p>
                      {order.couponCode && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 mt-0.5">
                          <Tag size={9} /> {order.couponCode}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{order.user?.name || 'Khách'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-500">{order.items?.length || 0} sản phẩm</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-gray-900">${(order.totalPrice || 0).toFixed(2)}</p>
                      {order.discountAmount > 0 && (
                        <p className="text-xs text-green-600">−${order.discountAmount.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${statusColor(order.status)}`}>
                        {order.status || 'Đang xử lý'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${paymentColor(order.paymentStatus)}`}>
                        {order.paymentStatus || 'Chưa TT'}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black px-3 py-1.5 border border-gray-200 rounded-lg hover:border-black transition-colors"
                        >
                          <Eye size={12} /> Xem
                        </button>
                        <a
                          href={`/invoice/${order._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-[#C9A96E] hover:text-[#a8843d] px-2.5 py-1.5 border border-[#C9A96E]/40 rounded-lg hover:border-[#C9A96E] transition-colors"
                          title="Xem hóa đơn"
                        >
                          <FileText size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};
