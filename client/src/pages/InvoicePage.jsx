import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Package, MapPin, CreditCard, Tag, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import API from '../api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const toVND = (usd) => Math.round(usd * 25000);
const fmtVND = (n) => n?.toLocaleString('vi-VN') + ' ₫';
const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PAYMENT_LABELS = { cod: 'Thanh toán khi nhận hàng (COD)', bank: 'Chuyển khoản ngân hàng', momo: 'Ví MoMo', ewallet: 'Ví điện tử' };

const STATUS_META = {
  'Đang xử lý':  { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Clock },
  'Đã xác nhận': { color: 'text-blue-700 bg-blue-50 border-blue-200',       icon: CheckCircle },
  'Đang giao':   { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Truck },
  'Đã giao':     { color: 'text-green-700 bg-green-50 border-green-200',    icon: CheckCircle },
  'Đã hủy':      { color: 'text-red-700 bg-red-50 border-red-200',          icon: XCircle },
  'Chờ thanh toán': { color: 'text-orange-700 bg-orange-50 border-orange-200', icon: Clock },
};

// ── Invoice Page ───────────────────────────────────────────────────────────────
export const InvoicePage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Không tìm thấy đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-gray-900 flex items-center justify-center pt-32">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 uppercase tracking-widest">Đang tải hóa đơn…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-gray-900 flex items-center justify-center pt-32">
      <div className="text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Link to="/profile" className="text-sm underline underline-offset-4 text-[#C9A96E]">← Quay lại đơn hàng của tôi</Link>
      </div>
    </div>
  );

  const statusMeta = STATUS_META[order.status] || STATUS_META['Đang xử lý'];
  const StatusIcon = statusMeta.icon;
  const shippingFee = order.shippingDiscount > 0 ? 0 : (order.totalPrice >= 100 ? 0 : 5);
  const subtotal = order.originalPrice || order.totalPrice;

  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-gray-900 pt-24 pb-16 transition-colors duration-300">
      {/* ── Action bar (ẩn khi in) ── */}
      <div className="print:hidden max-w-3xl mx-auto px-4 mb-6 flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft size={15} /> Quay lại đơn hàng
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm hover:border-black dark:hover:border-white transition-colors dark:text-white"
          >
            <Printer size={14} /> In hóa đơn
          </button>
        </div>
      </div>

      {/* ── Invoice card ── */}
      <div ref={printRef} className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 print:border-gray-200 print:shadow-none shadow-sm">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              {/* Logo / Brand */}
              <h1 className="text-2xl font-serif italic tracking-tight text-gray-900 dark:text-white mb-1">Arumé</h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Tinh hoa trang sức cao cấp</p>
              <p className="text-xs text-gray-400 mt-1">arume.vn · support@arume.vn</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Hóa đơn</p>
              <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                {order.orderCode || `#${order._id?.slice(-10).toUpperCase()}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">Ngày đặt: {fmtDate(order.createdAt)}</p>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold border rounded-sm ${statusMeta.color}`}>
                <StatusIcon size={11} /> {order.status}
              </span>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">

            {/* Customer + Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Khách hàng */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Package size={10} className="text-gray-500" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Khách hàng</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{order.user?.name || order.shippingAddress?.name}</p>
                {order.user?.email && <p className="text-xs text-gray-500 mt-0.5">{order.user.email}</p>}
                {order.shippingAddress?.phone && <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>}
              </div>

              {/* Địa chỉ giao hàng */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <MapPin size={10} className="text-gray-500" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Địa chỉ giao hàng</span>
                </div>
                {order.shippingAddress ? (
                  <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5 leading-relaxed">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.address}{order.shippingAddress.district ? ', ' + order.shippingAddress.district : ''}</p>
                    <p>{order.shippingAddress.province}</p>
                    {order.shippingAddress.note && (
                      <p className="italic text-gray-400">Ghi chú: {order.shippingAddress.note}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-300">{order.address || '—'}</p>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/40 px-4 py-3 border border-gray-100 dark:border-gray-700">
              <CreditCard size={14} className="text-[#C9A96E] flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block">Phương thức thanh toán</span>
                <span className="text-sm text-gray-800 dark:text-white font-medium">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </span>
              </div>
              <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                order.paymentStatus === 'Đã thanh toán'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {order.paymentStatus}
              </span>
            </div>

            {/* Products table */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Chi tiết sản phẩm</span>
              </div>

              {/* Table header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">SL</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-t-0 border-gray-100 dark:border-gray-700">
                {(order.items || []).map((item, idx) => {
                  const price = item.price || item.product?.price || 0;
                  const total = price * item.quantity;
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-3 items-center">
                      {/* Product info */}
                      <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F4F2EE] dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                          {item.product?.image
                            ? <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                            : <Package size={14} className="m-auto mt-2.5 text-gray-400" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                            {item.product?.name || 'Sản phẩm đã xóa'}
                          </p>
                          {item.size && <p className="text-[11px] text-gray-400 mt-0.5">Size: {item.size}</p>}
                          {/* Mobile: show price × qty inline */}
                          <p className="sm:hidden text-xs text-gray-500 mt-0.5">
                            {fmtVND(toVND(price))} × {item.quantity} = <strong>{fmtVND(toVND(total))}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block col-span-2 text-center text-sm text-gray-600 dark:text-gray-300">
                        {fmtVND(toVND(price))}
                      </div>
                      <div className="hidden sm:block col-span-2 text-center text-sm text-gray-600 dark:text-gray-300">
                        {item.quantity}
                      </div>
                      <div className="hidden sm:block col-span-2 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {fmtVND(toVND(total))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span>{fmtVND(toVND(subtotal))}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1.5">
                      <Tag size={12} />
                      Giảm giá {order.couponCode && `(${order.couponCode})`}
                    </span>
                    <span>−{fmtVND(toVND(order.discountAmount))}</span>
                  </div>
                )}

                {order.shippingDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Freeship</span>
                    <span>Miễn phí</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span>{order.shippingDiscount > 0 || order.totalPrice >= 100 ? <span className="text-green-600">Miễn phí</span> : fmtVND(toVND(5))}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-end">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white text-base">Tổng cộng</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">Đã bao gồm VAT (nếu có)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-[#C9A96E]">{fmtVND(toVND(order.totalPrice))}</p>
                    {order.originalPrice > 0 && order.originalPrice !== order.totalPrice && (
                      <p className="text-xs line-through text-gray-400 font-normal">{fmtVND(toVND(order.originalPrice))}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking timeline */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Lịch sử vận chuyển</p>
                <div className="border-l-2 border-[#C9A96E]/30 ml-2 space-y-4">
                  {[...order.trackingHistory].reverse().map((entry, i) => (
                    <div key={i} className="pl-5 relative">
                      <div className={`absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${i === 0 ? 'bg-[#C9A96E] border-[#C9A96E]' : 'bg-white dark:bg-gray-800 border-[#C9A96E]'}`} />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{entry.status}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entry.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(entry.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-4 py-3">
                <Truck size={14} className="text-indigo-600 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 block">Mã vận đơn</span>
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{order.trackingNumber}</span>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <p>Cảm ơn quý khách đã tin tưởng Arumé · arume.vn</p>
            <p className="font-mono">Đơn hàng: {order.orderCode || order._id?.slice(-10).toUpperCase()}</p>
          </div>
        </div>

        {/* Print-only note */}
        <p className="hidden print:block text-center text-xs text-gray-400 mt-6">
          Tài liệu được xuất từ hệ thống Arumé · {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #root * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          [ref="printRef"], [ref="printRef"] * { visibility: visible; }
          .max-w-3xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;
