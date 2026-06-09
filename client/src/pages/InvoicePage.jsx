import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Package, CreditCard, Tag, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import API from '../api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const toVND = (usd) => Math.round(usd * 25000);
const fmtVND = (n) => n?.toLocaleString('vi-VN') + ' ₫';
const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PAYMENT_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  ewallet: 'Ví điện tử',
};

const STATUS_META = {
  'Đang xử lý':     { color: '#92400e', bg: '#fffbeb', border: '#fde68a', icon: Clock },
  'Đã xác nhận':    { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: CheckCircle },
  'Đang giao':      { color: '#3730a3', bg: '#eef2ff', border: '#c7d2fe', icon: Truck },
  'Đã giao':        { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle },
  'Đã hủy':         { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: XCircle },
  'Chờ thanh toán': { color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', icon: Clock },
};

// CSS print styles — inject vào <head>, xóa sau khi print xong
const PRINT_STYLE = `
@media print {
  body > * { display: none !important; }
  #arume-invoice-print { display: block !important; }
  #arume-invoice-print { position: fixed; top: 0; left: 0; width: 100%; }
}
#arume-invoice-print { display: none; }
`;

export const InvoicePage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Inject print CSS một lần
    const style = document.createElement('style');
    style.id = 'arume-print-style';
    style.textContent = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.getElementById('arume-print-style')?.remove();
  }, []);

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

  const handlePrint = () => {
    if (!invoiceRef.current) return;

    // Clone nội dung hóa đơn vào một div ẩn dành riêng cho print
    const printDiv = document.getElementById('arume-invoice-print') || (() => {
      const d = document.createElement('div');
      d.id = 'arume-invoice-print';
      document.body.appendChild(d);
      return d;
    })();

    printDiv.innerHTML = invoiceRef.current.outerHTML;
    window.print();
    // Không cần xóa — CSS ẩn nó sau khi print
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center pt-32">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 uppercase tracking-widest">Đang tải hóa đơn…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center pt-32">
      <div className="text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/profile" className="text-sm underline underline-offset-4 text-[#C9A96E]">← Quay lại đơn hàng của tôi</Link>
      </div>
    </div>
  );

  const sm = STATUS_META[order.status] || STATUS_META['Đang xử lý'];
  const StatusIcon = sm.icon;
  const subtotal = order.originalPrice || order.totalPrice;

  return (
    <div className="min-h-screen bg-[#F9F7F2] pt-24 pb-16">
      {/* Action bar */}
      <div className="max-w-3xl mx-auto px-4 mb-6 flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={15} /> Quay lại đơn hàng
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-sm hover:border-black transition-colors"
        >
          <Printer size={14} /> In hóa đơn
        </button>
      </div>

      {/* Preview card */}
      <div className="max-w-3xl mx-auto px-4">
        <div ref={invoiceRef} style={{ fontFamily: 'Arial, sans-serif', background: '#fff' }} className="bg-white border border-gray-100 shadow-sm">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-serif italic tracking-tight text-gray-900 mb-1">Arumé</h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Tinh hoa trang sức cao cấp</p>
              <p className="text-xs text-gray-400 mt-1">arume.vn · support@arume.vn</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Hóa đơn</p>
              <p className="font-mono font-bold text-lg text-gray-900">{order.orderCode || `#${order._id?.slice(-10).toUpperCase()}`}</p>
              <p className="text-xs text-gray-400 mt-1">Ngày đặt: {fmtDate(order.createdAt)}</p>
              <span
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold border rounded-sm"
                style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}
              >
                <StatusIcon size={11} /> {order.status}
              </span>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Customer + Shipping */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Khách hàng</p>
                <p className="font-semibold text-gray-900 text-sm">{order.user?.name || order.shippingAddress?.name}</p>
                {order.user?.email && <p className="text-xs text-gray-500 mt-0.5">{order.user.email}</p>}
                {order.shippingAddress?.phone && <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Địa chỉ giao hàng</p>
                {order.shippingAddress && (
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p className="font-semibold text-sm text-gray-900">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.address}{order.shippingAddress.district ? ', ' + order.shippingAddress.district : ''}</p>
                    <p>{order.shippingAddress.province}</p>
                    {order.shippingAddress.note && <p className="italic text-gray-400">Ghi chú: {order.shippingAddress.note}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border border-gray-100">
              <CreditCard size={14} className="text-[#C9A96E] flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Phương thức thanh toán</p>
                <p className="text-sm text-gray-800 font-medium">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
              </div>
              <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-sm ${order.paymentStatus === 'Đã thanh toán' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {order.paymentStatus}
              </span>
            </div>

            {/* Products */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Chi tiết sản phẩm</p>
              <div className="grid grid-cols-12 px-3 py-2 bg-gray-50 border border-gray-100 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">SL</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>
              <div className="divide-y divide-gray-100 border border-t-0 border-gray-100">
                {(order.items || []).map((item, idx) => {
                  const price = item.price || item.product?.price || 0;
                  const total = price * item.quantity;
                  return (
                    <div key={idx} className="grid grid-cols-12 px-3 py-3 items-center">
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F4F2EE] flex-shrink-0 overflow-hidden">
                          {item.product?.image
                            ? <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                            : <Package size={14} className="m-auto mt-3 text-gray-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Sản phẩm đã xóa'}</p>
                          {item.size && <p className="text-[11px] text-gray-400">Size: {item.size}</p>}
                        </div>
                      </div>
                      <div className="col-span-2 text-center text-sm text-gray-600">{fmtVND(toVND(price))}</div>
                      <div className="col-span-2 text-center text-sm text-gray-600">{item.quantity}</div>
                      <div className="col-span-2 text-right text-sm font-semibold text-gray-900">{fmtVND(toVND(total))}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Tạm tính</span><span>{fmtVND(toVND(subtotal))}</span></div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1"><Tag size={12} /> Giảm giá {order.couponCode && `(${order.couponCode})`}</span>
                    <span>−{fmtVND(toVND(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Phí vận chuyển</span>
                  <span className={order.shippingDiscount > 0 || order.totalPrice >= 100 ? 'text-green-600' : ''}>
                    {order.shippingDiscount > 0 || order.totalPrice >= 100 ? 'Miễn phí' : fmtVND(toVND(5))}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
                  <div>
                    <p className="font-bold text-gray-900 text-base">Tổng cộng</p>
                    <p className="text-[10px] text-gray-400">Đã bao gồm VAT (nếu có)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl" style={{ color: '#C9A96E' }}>{fmtVND(toVND(order.totalPrice))}</p>
                    {order.originalPrice > 0 && order.originalPrice !== order.totalPrice && (
                      <p className="text-xs line-through text-gray-400">{fmtVND(toVND(order.originalPrice))}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-3">
                <Truck size={14} className="text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Mã vận đơn</p>
                  <p className="font-mono font-bold text-indigo-700">{order.trackingNumber}</p>
                </div>
              </div>
            )}

            {/* Tracking history */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Lịch sử vận chuyển</p>
                <div className="border-l-2 border-[#e8d9c0] ml-2 space-y-4">
                  {[...order.trackingHistory].reverse().map((entry, i) => (
                    <div key={i} className="pl-5 relative">
                      <div
                        className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#C9A96E]"
                        style={{ background: i === 0 ? '#C9A96E' : '#fff' }}
                      />
                      <p className="text-sm font-semibold text-gray-900">{entry.status}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(entry.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-2 text-xs text-gray-400">
            <p>Cảm ơn quý khách đã tin tưởng Arumé · arume.vn</p>
            <p className="font-mono">Đơn hàng: {order.orderCode || order._id?.slice(-10).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;