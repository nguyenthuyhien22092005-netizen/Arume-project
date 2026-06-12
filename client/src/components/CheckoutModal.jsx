import React, { useState, useEffect } from 'react';
import {
  X, Lock, ChevronRight, ChevronLeft, Check,
  MapPin, Wallet, Truck, ShieldCheck, Copy, ExternalLink,
  CreditCard, Banknote, Smartphone, Package, Tag, AlertCircle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createOrder, createMomoPayment, validateCoupon } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toVND = (usd) => Math.round(usd * 25000);
const fmtVND = (n) => n.toLocaleString('vi-VN') + ' ₫';

const BANKS = [
  { code: '970423', name: 'TPBank', short: 'TPB', color: '#5b1f69' },
];

const STEPS = ['Giao hàng', 'Thanh toán', 'Xác nhận'];

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((s, i) => (
      <React.Fragment key={s}>
        <div className="flex flex-col items-center gap-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
            ${i < current ? 'bg-[#C9A96E] text-white' : i === current ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
            {i < current ? <Check size={13} /> : i + 1}
          </div>
          <span className={`text-xs uppercase tracking-widest font-semibold ${i === current ? 'text-black dark:text-white' : 'text-gray-400'}`}>{s}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`h-[1px] w-16 mx-1 mb-4 transition-all duration-500 ${i < current ? 'bg-[#C9A96E]' : 'bg-gray-200 dark:bg-gray-700'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Input component ───────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400">
      {label}{required && <span className="text-[#C9A96E] ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500">{error}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:border-black dark:focus:border-white outline-none transition text-sm ${className}`}
    {...props}
  />
);

const Select = ({ className = '', children, ...props }) => (
  <select
    className={`w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:border-black dark:focus:border-white outline-none transition text-sm cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </select>
);

// ─── Order Summary ─────────────────────────────────────────────────────────────
const OrderSummary = ({ product, cartItems, displayTotal, bankAmount, subtotal, appliedCoupon, discountAmount, shippingDiscount, shippingFee, shippingMethod }) => {
  const isCart = !product;
  const items = isCart ? cartItems : [{ ...product, quantity: product?.quantity || 1, selectedSize: product?.selectedSize }];
  const hasDiscount = discountAmount > 0 || shippingDiscount > 0;

  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-4 space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="w-12 h-12 bg-[#F4F2EE] dark:bg-gray-700 flex-shrink-0 overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{item.name}</p>
            <div className="flex flex-wrap gap-x-2 mt-0.5">
              {item.selectedSize && (
                <p className="text-[11px] text-[#C9A96E] font-semibold">Size: {item.selectedSize}</p>
              )}
              {item.quantity > 1 && (
                <p className="text-[11px] text-gray-400">×{item.quantity}</p>
              )}
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-800 dark:text-white whitespace-nowrap">
            ${(item.price * (item.quantity || 1)).toFixed(2)}
          </span>
        </div>
      ))}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Tạm tính</span><span>${subtotal.toFixed(2)}</span>
        </div>
        {(discountAmount > 0 || shippingDiscount > 0) && (
          <div className="flex justify-between text-xs text-green-600 font-semibold">
            <span>🏷️ {appliedCoupon?.code}</span>
            <span>{shippingDiscount > 0 ? 'Freeship' : `−$${discountAmount.toFixed(2)}`}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Phí vận chuyển {shippingMethod === 'express' ? '(Nhanh)' : '(Tiêu chuẩn)'}</span>
          {shippingDiscount > 0
            ? <span className="text-green-600 font-semibold">Miễn phí (freeship)</span>
            : shippingFee > 0
              ? <span className="text-gray-700 dark:text-gray-300 font-semibold">+${shippingFee}.00</span>
              : <span className="text-green-600 font-semibold">Miễn phí</span>
          }
        </div>
        <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
          <span>Tổng cộng</span>
          <div className="text-right">
            {hasDiscount && <div className="text-[11px] line-through text-gray-400 font-normal">${subtotal.toFixed(2)}</div>}
            <div className={hasDiscount ? 'text-green-600' : ''}>${displayTotal.toFixed(2)}</div>
            <div className="text-[11px] font-normal text-gray-400">≈ {fmtVND(bankAmount)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── Main Modal ────────────────────────────────────────────────────────────────
const CheckoutModal = ({ isOpen, onClose, product, cartTotal }) => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  // step: 0=shipping, 1=payment-method, 2=confirm+place-order, 3=payment-qr (bank/momo/ewallet), done=success
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Đơn hàng đã tạo trên backend (sau khi bấm "Đặt hàng")
  const [createdOrder, setCreatedOrder] = useState(null); // { _id, orderCode, ... }

  // Coupon / discount
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Shipping info
  const [ship, setShip] = useState({
    name: user?.defaultAddress?.name || user?.name || '',
    phone: user?.defaultAddress?.phone || '',
    email: user?.email || '',
    province: user?.defaultAddress?.province || '',
    district: user?.defaultAddress?.district || '',
    address: user?.defaultAddress?.address || '',
    note: '',
  });
  const [shipErrors, setShipErrors] = useState({});

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState('standard');
  const SHIPPING_FEE = 3; // USD cho express

  // Payment
  const [payMethod, setPayMethod] = useState('cod');
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [eWallet, setEWallet] = useState('momo');

  // Tính tổng
  const isCart = !product;
  const subtotal = isCart
    ? (cartItems && cartItems.length > 0 ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0)
    : (product.price * (product.quantity || 1));

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const shippingDiscount = appliedCoupon?.shippingDiscount || 0;
  const shippingFee = shippingMethod === 'express' ? SHIPPING_FEE : 0;
  const displayTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const bankAmount = toVND(displayTotal);

  const bankAccount = '57272579999';
  // Nội dung chuyển khoản dùng mã đơn hàng nếu đã tạo, fallback về SĐT
  const bankContent = createdOrder
    ? `ARUME ${createdOrder.orderCode}`
    : `ARUME ${ship.phone.replace(/\s/g, '') || 'PAY'}`;

  // QR tĩnh
  const qrUrl = '/assets/images/QR TPBank.jpg';
  const momoQr = '/assets/images/QR MoMo.jpg';
  const zaloQr = '/assets/images/QR ZaloPay.jpg';

  useEffect(() => {
    if (!isOpen) {
      setStep(0); setDone(false); setShipErrors({});
      setCouponInput(''); setCouponError(''); setAppliedCoupon(null);
      setCreatedOrder(null);
      // Reset ship state with latest user data
      setShip({
        name: user?.defaultAddress?.name || user?.name || '',
        phone: user?.defaultAddress?.phone || '',
        email: user?.email || '',
        province: user?.defaultAddress?.province || '',
        district: user?.defaultAddress?.district || '',
        address: user?.defaultAddress?.address || '',
        note: '',
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;
  if (!product && (!cartItems || cartItems.length === 0)) return null;

  // ── Validation ──
  const validateShip = () => {
    const e = {};
    if (!ship.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!/^\d{9,11}$/.test(ship.phone.replace(/\s/g, ''))) e.phone = 'Số điện thoại không hợp lệ';
    if (!ship.email.includes('@')) e.email = 'Email không hợp lệ';
    if (!ship.province) e.province = 'Vui lòng chọn tỉnh/thành';
    if (!ship.address.trim()) e.address = 'Vui lòng nhập địa chỉ';
    setShipErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Coupon ──
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    if (!user) { setCouponError('Vui lòng đăng nhập để sử dụng mã giảm giá'); return; }
    setCouponLoading(true); setCouponError('');
    try {
      const res = await validateCoupon({ code: couponInput.trim(), orderValue: subtotal });
      setAppliedCoupon({ ...res.data.coupon, discountAmount: res.data.discountAmount, shippingDiscount: res.data.shippingDiscount });
      setCouponError('');
    } catch (err) {
      setAppliedCoupon(null);
      const status = err.response?.status;
      if (status === 401) setCouponError('Vui lòng đăng nhập để sử dụng mã giảm giá');
      else setCouponError(err.response?.data?.error || 'Mã không hợp lệ');
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponInput(''); setCouponError(''); };

  const handleNextFromShipping = () => { if (validateShip()) setStep(1); };

  // ── BƯỚC QUAN TRỌNG: Đặt hàng trước, hiện QR sau ──
  // Gọi khi user bấm "Đặt hàng ngay" ở step 2
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = isCart
        ? cartItems.map(item => ({
          product: item._id || item.id,
          quantity: item.quantity || 1,
          size: typeof item.selectedSize === 'string' ? item.selectedSize : '',
          price: item.price
        }))
        : [{
          product: product?._id || product?.id,
          quantity: product?.quantity || 1,
          size: typeof product?.selectedSize === 'string' ? product.selectedSize : '',
          price: product?.price
        }];

      if (!orderItems.length || orderItems.some(i => !i.product)) {
        alert('Không tìm thấy sản phẩm hợp lệ để đặt hàng.');
        setLoading(false);
        return;
      }

      const res = await createOrder({
        items: orderItems,
        totalPrice: displayTotal,
        shippingAddress: {
          name: ship.name, phone: ship.phone, email: ship.email,
          address: ship.address, district: ship.district, province: ship.province, note: ship.note,
        },
        paymentMethod: payMethod,
        shippingMethod: shippingMethod,
        shippingFee: shippingFee,
        couponCode: appliedCoupon?.code || null,
      });

      const order = res.data;
      setCreatedOrder(order);
      clearCart?.();

      // COD: hoàn tất ngay, không cần màn hình QR
      if (payMethod === 'cod') {
        setDone(true);
      } else {
        // bank / momo / ewallet: chuyển sang màn hình QR thanh toán
        setStep(3);
      }
    } catch (err) {
      console.error('Lỗi đặt hàng:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Có lỗi khi đặt hàng. Vui lòng thử lại.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Khách bấm "Tôi đã chuyển khoản" sau khi quét QR
  const handleConfirmTransfer = () => {
    setDone(true);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Done screen ──
  if (done) return (
    <div className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#F9F7F2] dark:bg-gray-900 w-full max-w-md shadow-2xl p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center mb-6">
          <Check size={28} className="text-[#C9A96E]" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-serif italic mb-2 dark:text-white">
          {payMethod === 'cod' ? 'Đặt hàng thành công!' : 'Đơn hàng đã ghi nhận!'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {payMethod === 'cod'
            ? 'Cảm ơn bạn đã tin tưởng ARUME. Đơn hàng đang được xử lý và sẽ sớm được giao.'
            : 'Chúng tôi đã nhận thông tin đơn hàng. Admin sẽ xác nhận sau khi kiểm tra thanh toán trong vòng 30 phút.'}
        </p>
        <div className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 uppercase tracking-widest">Mã đơn</span>
            <span className="font-bold font-mono text-gray-800 dark:text-white">{createdOrder?.orderCode}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 uppercase tracking-widest">Tổng tiền</span>
            <div className="text-right">
              {discountAmount > 0 && <div className="text-[10px] line-through text-gray-400">${subtotal.toFixed(2)}</div>}
              <span className="font-bold text-[#C9A96E]">${displayTotal.toFixed(2)}</span>
            </div>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 uppercase tracking-widest">Mã giảm giá</span>
              <span className="font-bold text-green-600">{appliedCoupon.code} (−${discountAmount.toFixed(2)})</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 uppercase tracking-widest">Trạng thái</span>
            <span className={`font-semibold ${payMethod === 'cod' ? 'text-amber-600' : 'text-blue-600'}`}>
              {payMethod === 'cod' ? '📦 Đang xử lý' : '⏳ Chờ xác nhận thanh toán'}
            </span>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => { onClose(); navigate('/profile'); }}
            className="flex-1 border border-black dark:border-white text-black dark:text-white py-3 text-xs uppercase tracking-widest font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Theo dõi đơn
          </button>
          <button onClick={() => { onClose(); navigate('/collections'); }}
            className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#C9A96E] dark:hover:bg-gray-200 transition">
            Tiếp tục mua
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Màn hình QR thanh toán (SAU khi đã tạo đơn hàng) ──
  if (step === 3) return (
    <div className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#F9F7F2] dark:bg-gray-900 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Mã đơn hàng</p>
            <p className="font-mono font-bold text-lg text-[#C9A96E]">{createdOrder?.orderCode}</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-1.5">
            <Clock size={13} className="text-amber-600" />
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Chờ thanh toán</span>
          </div>
        </div>

        <div className="p-7 space-y-5">
          {/* Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3.5 flex gap-2.5">
            <AlertCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              Đơn hàng <strong>{createdOrder?.orderCode}</strong> đã được tạo. Vui lòng chuyển khoản để hoàn tất —
              đơn sẽ được xử lý sau khi admin xác nhận thanh toán.
            </p>
          </div>

          {/* Bank selector hidden — chỉ dùng TPBank */}
          {false && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2 font-semibold">Chọn ngân hàng</p>
              <div className="grid grid-cols-4 gap-2">
                {BANKS.map(b => (
                  <button key={b.code} onClick={() => setSelectedBank(b)}
                    className={`py-2 px-2 border-2 text-xs font-bold transition flex items-center gap-1.5
                      ${selectedBank.code === b.code ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400 bg-white dark:bg-gray-800'}`}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                    {b.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QR + thông tin chuyển khoản */}
          <div className={`bg-white dark:bg-gray-800 border p-5 flex gap-5 items-start ${
            payMethod === 'ewallet' && eWallet === 'momo' ? 'border-[#A50064]/30' :
            payMethod === 'ewallet' && eWallet === 'zalo' ? 'border-[#0068ff]/30' :
            'border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex-shrink-0">
              {payMethod === 'ewallet' && eWallet === 'momo' ? (
                <>
                  <div className="border-2 border-[#A50064]/20 p-2 bg-white">
                    <img src={momoQr} alt="MoMo QR" className="w-[130px] h-[130px] object-cover" />
                  </div>
                  <p className="text-[10px] text-center text-[#A50064] font-semibold mt-1">MoMo</p>
                </>
              ) : payMethod === 'ewallet' && eWallet === 'zalo' ? (
                <>
                  <div className="border-2 border-[#0068ff]/20 p-2 bg-white">
                    <img src={zaloQr} alt="ZaloPay QR" className="w-[130px] h-[130px] object-cover" />
                  </div>
                  <p className="text-[10px] text-center text-[#0068ff] font-semibold mt-1">ZaloPay</p>
                </>
              ) : (
                <>
                  <img src={qrUrl} alt="VietQR" className="w-[130px] h-[130px] object-contain border border-gray-100 dark:border-gray-700" />
                  <p className="text-[10px] text-center text-gray-400 mt-1">VietQR</p>
                </>
              )}
            </div>

            <div className="flex-1 space-y-2.5">
              {payMethod === 'bank' && (
                <>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Ngân hàng</p>
                    <p className="font-bold text-sm" style={{ color: selectedBank.color }}>{selectedBank.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Chủ tài khoản</p>
                    <p className="font-semibold text-sm dark:text-white">NGUYEN THUY HIEN</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Số tài khoản</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base tracking-widest dark:text-white">{bankAccount}</span>
                      <button onClick={() => copy(bankAccount)} className="text-gray-400 hover:text-black dark:hover:text-white transition">
                        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </>
              )}
              {payMethod === 'ewallet' && (
                <>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Ví điện tử</p>
                    <p className="font-bold text-sm" style={{ color: eWallet === 'momo' ? '#A50064' : '#0068ff' }}>
                      {eWallet === 'momo' ? 'MoMo' : 'ZaloPay'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold" style={{ color: eWallet === 'momo' ? '#A50064' : '#0068ff' }}>0342396910</p>
                      <button onClick={() => copy('0342396910')} className="text-gray-400 hover:text-black dark:hover:text-white transition">
                        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Tên người nhận</p>
                    <p className="font-semibold text-sm dark:text-white">NGUYEN THUY HIEN</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Số tiền</p>
                <p className="font-bold text-green-600 text-lg">{fmtVND(bankAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Nội dung chuyển khoản</p>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400 font-mono font-bold text-xs px-2 py-1">
                    {bankContent}
                  </span>
                  <button onClick={() => copy(bankContent)} className="text-gray-400 hover:text-black dark:hover:text-white transition">
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <p className="text-[10px] text-amber-600 mt-1">⚠️ Nhập đúng nội dung để đơn được xử lý tự động</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirmTransfer}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A96E] dark:hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <Check size={14} /> Tôi đã chuyển khoản
            </button>
          </div>
          <p className="text-[11px] text-center text-gray-400">
            Admin sẽ xác nhận trong vòng 30 phút • Đơn <strong>{createdOrder?.orderCode}</strong> sẽ được cập nhật qua email
          </p>
        </div>
      </div>
    </div>
  );

  // ── Payment method options ──
  const PAY_METHODS = [
    { id: 'cod', icon: Package, label: 'COD', color: '#d97706', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-500' },
    { id: 'bank', icon: Banknote, label: 'Ngân hàng', color: '#1e40af', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-600' },
    { id: 'ewallet', icon: Wallet, label: 'Ví điện tử', color: '#059669', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' },
  ];

  const provinces = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
    'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
  ];

  return (
    <div className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#F9F7F2] dark:bg-gray-900 w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#C9A96E]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-gray-500 dark:text-gray-400">Thanh toán bảo mật · SSL 256-bit</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition p-1">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <div className="px-8 py-6">
            <StepBar current={step} />

            <div className="grid grid-cols-[1fr_280px] gap-8 items-start">

              {/* ── Left panel ── */}
              <div>

                {/* STEP 0: Shipping */}
                {step === 0 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-2xl font-serif italic dark:text-white flex items-center gap-2">
                      <MapPin size={20} className="text-[#C9A96E]" /> Thông tin giao hàng
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Họ và tên" required error={shipErrors.name}>
                        <Input value={ship.name} onChange={e => setShip({ ...ship, name: e.target.value })} placeholder="Nguyễn Văn A" />
                      </Field>
                      <Field label="Số điện thoại" required error={shipErrors.phone}>
                        <Input value={ship.phone} onChange={e => setShip({ ...ship, phone: e.target.value })} placeholder="0912 345 678" />
                      </Field>
                    </div>

                    <Field label="Email" required error={shipErrors.email}>
                      <Input type="email" value={ship.email} onChange={e => setShip({ ...ship, email: e.target.value })} placeholder="email@example.com" />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Tỉnh / Thành phố" required error={shipErrors.province}>
                        <Select value={ship.province} onChange={e => setShip({ ...ship, province: e.target.value })}>
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map(p => <option key={p}>{p}</option>)}
                        </Select>
                      </Field>
                      <Field label="Quận / Huyện">
                        <Input value={ship.district} onChange={e => setShip({ ...ship, district: e.target.value })} placeholder="Quận Hoàn Kiếm" />
                      </Field>
                    </div>

                    <Field label="Địa chỉ cụ thể" required error={shipErrors.address}>
                      <Input value={ship.address} onChange={e => setShip({ ...ship, address: e.target.value })} placeholder="Số nhà, tên đường, phường/xã" />
                    </Field>

                    <Field label="Ghi chú">
                      <textarea
                        value={ship.note}
                        onChange={e => setShip({ ...ship, note: e.target.value })}
                        placeholder="Ghi chú thêm cho đơn hàng (tuỳ chọn)"
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:border-black dark:focus:border-white outline-none transition text-sm resize-none"
                      />
                    </Field>

                    {/* Shipping method */}
                    <div>
                      <p className="text-[11px] uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400 mb-3">Phương thức vận chuyển</p>
                      <div className="space-y-2">
                        {[
                          { id: 'standard', label: 'Giao hàng tiêu chuẩn', sub: '3–5 ngày làm việc', price: 'Miễn phí', fee: 0 },
                          { id: 'express', label: 'Giao hàng nhanh', sub: '1–2 ngày làm việc', price: `+$${SHIPPING_FEE}.00`, fee: SHIPPING_FEE },
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:border-black dark:hover:border-white transition has-[:checked]:border-black dark:has-[:checked]:border-white">
                            <input type="radio" name="ship" checked={shippingMethod === opt.id} onChange={() => setShippingMethod(opt.id)} className="accent-black" />
                            <Truck size={16} className="text-gray-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold dark:text-white">{opt.label}</p>
                              <p className="text-[11px] text-gray-400">{opt.sub}</p>
                            </div>
                            <span className={`text-sm font-bold ${opt.price === 'Miễn phí' ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>{opt.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleNextFromShipping}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A96E] dark:hover:bg-gray-200 transition flex items-center justify-center gap-2">
                      Tiếp tục thanh toán <ChevronRight size={15} />
                    </button>
                  </div>
                )}

                {/* STEP 1: Chọn phương thức thanh toán */}
                {step === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-2xl font-serif italic dark:text-white flex items-center gap-2">
                      <CreditCard size={20} className="text-[#C9A96E]" /> Phương thức thanh toán
                    </h2>

                    {/* Method tabs */}
                    <div className="grid grid-cols-3 gap-2">
                      {PAY_METHODS.map(m => (
                        <button key={m.id} onClick={() => setPayMethod(m.id)}
                          className={`flex flex-col items-center gap-1.5 py-3.5 border-2 transition text-xs font-bold uppercase tracking-wider
                            ${payMethod === m.id ? m.bg + ' text-gray-900 dark:text-white' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'}`}>
                          <m.icon size={20} style={{ color: payMethod === m.id ? m.color : undefined }} />
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* COD */}
                    {payMethod === 'cod' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                              <Package size={22} className="text-amber-600" />
                            </div>
                            <div>
                              <p className="font-bold text-sm dark:text-white">Thanh toán khi nhận hàng (COD)</p>
                              <p className="text-xs text-gray-400">Bạn chỉ thanh toán khi nhận được sản phẩm</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            {[
                              ['Số tiền cần thanh toán', fmtVND(bankAmount)],
                              ['Thời gian giao hàng', '3–5 ngày làm việc'],
                              ['Hỗ trợ đổi trả', '30 ngày nếu có lỗi từ nhà sản xuất'],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">{k}</span>
                                <span className="font-semibold dark:text-white">{v}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-gray-400 italic">Lưu ý: Vui lòng chuẩn bị đúng số tiền khi nhận hàng</p>
                        </div>
                      </div>
                    )}

                    {/* Bank */}
                    {payMethod === 'bank' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <Banknote size={20} className="text-blue-600" />
                          <div>
                            <p className="font-bold text-sm dark:text-white">Chuyển khoản ngân hàng</p>
                            <p className="text-xs text-gray-400">QR sẽ được tạo sau khi đặt hàng, kèm mã đơn hàng</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-2.5">
                          ℹ️ Bạn sẽ thấy mã QR kèm <strong>Mã đơn hàng</strong> ở bước tiếp theo. Đơn được ghi nhận trước, tiền chuyển sau.
                        </p>
                      </div>
                    )}

                    {/* E-wallet */}
                    {payMethod === 'ewallet' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {/* MoMo */}
                          <button onClick={() => setEWallet('momo')}
                            className={`p-4 border-2 flex items-center gap-3 transition
                              ${eWallet === 'momo' ? 'border-[#A50064] bg-[#A50064]/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 bg-white dark:bg-gray-800'}`}>
                            <img src="/assets/images/MOMO.jpg" alt="MoMo" className="h-8 w-8 object-contain" />
                            <span className="font-bold text-sm dark:text-white">MoMo</span>
                          </button>
                          {/* ZaloPay */}
                          <button onClick={() => setEWallet('zalo')}
                            className={`p-4 border-2 flex items-center gap-3 transition
                              ${eWallet === 'zalo' ? 'border-[#0068ff] bg-[#0068ff]/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 bg-white dark:bg-gray-800'}`}>
                            <img src="/assets/images/ZaloPay.jpg" alt="ZaloPay" className="h-8 w-8 object-contain" />
                            <span className="font-bold text-sm dark:text-white">ZaloPay</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-2.5">
                          ℹ️ Đơn hàng sẽ được tạo trước, sau đó bạn quét QR để thanh toán {eWallet === 'momo' ? 'MoMo' : 'ZaloPay'}.
                        </p>
                      </div>
                    )}

                    {/* Nav */}
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setStep(0)}
                        className="flex items-center gap-1.5 px-5 py-3 border border-gray-300 dark:border-gray-600 text-xs uppercase tracking-widest font-semibold hover:border-black dark:hover:border-white dark:text-white transition">
                        <ChevronLeft size={14} /> Quay lại
                      </button>
                      <button onClick={() => setStep(2)}
                        className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A96E] dark:hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        Xem lại đơn hàng <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Xác nhận + Đặt hàng */}
                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-2xl font-serif italic dark:text-white flex items-center gap-2">
                      <ShieldCheck size={20} className="text-[#C9A96E]" /> Xác nhận đơn hàng
                    </h2>

                    {/* Shipping review */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Địa chỉ giao hàng</p>
                        <button onClick={() => setStep(0)} className="text-[11px] text-[#C9A96E] hover:underline">Sửa</button>
                      </div>
                      <p className="font-semibold text-sm dark:text-white">{ship.name} · {ship.phone}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{ship.address}{ship.district ? ', ' + ship.district : ''}{ship.province ? ', ' + ship.province : ''}</p>
                      {ship.note && <p className="text-xs text-gray-400 italic">"{ship.note}"</p>}
                    </div>

                    {/* Payment review */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Phương thức thanh toán</p>
                        <button onClick={() => setStep(1)} className="text-[11px] text-[#C9A96E] hover:underline">Sửa</button>
                      </div>
                      <p className="font-semibold text-sm dark:text-white">
                        {payMethod === 'bank' && `🏦 Chuyển khoản ngân hàng`}
                        {payMethod === 'ewallet' && `💜 Ví điện tử · ${eWallet === 'momo' ? 'MoMo' : 'ZaloPay'}`}
                        {payMethod === 'cod' && '📦 Thanh toán khi nhận hàng (COD)'}
                      </p>
                      {payMethod !== 'cod' && (
                        <p className="text-[11px] text-blue-500 mt-1">ℹ️ Mã QR thanh toán sẽ hiển thị SAU khi đặt hàng</p>
                      )}
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-black mt-0.5 w-4 h-4" />
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        Tôi đồng ý với <a href="/policies/terms" className="text-[#C9A96E] hover:underline">Điều khoản sử dụng</a> và <a href="/policies/privacy" className="text-[#C9A96E] hover:underline">Chính sách bảo mật</a> của ARUME
                      </span>
                    </label>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 px-5 py-3 border border-gray-300 dark:border-gray-600 text-xs uppercase tracking-widest font-semibold hover:border-black dark:hover:border-white dark:text-white transition">
                        <ChevronLeft size={14} /> Quay lại
                      </button>
                      <button onClick={handlePlaceOrder} disabled={loading}
                        className={`flex-1 bg-black dark:bg-white text-white dark:text-black py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-[#C9A96E] dark:hover:bg-gray-200 transition flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? (
                          <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                        ) : (
                          <><Check size={15} />
                            {payMethod === 'cod' ? `Đặt hàng · ${fmtVND(bankAmount)}` : `Đặt hàng & Xem QR · ${fmtVND(bankAmount)}`}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: Order summary ── */}
              <div className="sticky top-0">
                <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-3">Đơn hàng của bạn</p>
                <OrderSummary
                  product={product}
                  cartItems={cartItems?.length > 0 ? cartItems : null}
                  displayTotal={displayTotal}
                  bankAmount={bankAmount}
                  shippingFee={shippingFee}
                  shippingMethod={shippingMethod}
                  subtotal={subtotal}
                  appliedCoupon={appliedCoupon}
                  discountAmount={discountAmount}
                  shippingDiscount={shippingDiscount}
                />

                {/* ── Coupon input ── */}
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2 flex items-center gap-1">
                    <Tag size={11} className="text-[#C9A96E]" /> Mã giảm giá
                  </p>

                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 px-3 py-2">
                      <Check size={13} className="text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-green-600 dark:text-green-500 truncate">{appliedCoupon.description}</p>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-green-500 hover:text-red-500 transition flex-shrink-0">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-0">
                        <input
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Nhập mã (vd: WELCOME30)"
                          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-xs outline-none focus:border-[#C9A96E] transition font-mono uppercase placeholder:normal-case placeholder:font-sans"
                        />
                        <button
                          id="coupon-apply-btn"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-widest hover:bg-[#C9A96E] transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                          {couponLoading ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin inline-block" /> : 'Áp dụng'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1">
                          <AlertCircle size={11} /> {couponError}
                        </p>
                      )}
                      <div className="space-y-1 pt-1">
                        {[
                          { code: 'WELCOME30', hint: '30% cho đơn đầu tiên' },
                          { code: 'FREESHIP200', hint: 'Freeship đơn từ $200' },
                          { code: 'ARUME10', hint: '10% đơn từ $50' },
                          { code: 'SALE15', hint: '15% tất cả sản phẩm' },
                        ].map(({ code, hint }) => (
                          <button key={code} onClick={() => {
                            setCouponInput(code);
                            setCouponError('');
                            setTimeout(() => {
                              const btn = document.getElementById('coupon-apply-btn');
                              if (btn) btn.click();
                            }, 50);
                          }}
                            className="w-full text-left flex items-center justify-between px-2 py-1.5 bg-[#F9F7F2] dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 hover:border-[#C9A96E] transition group">
                            <span className="font-mono text-[11px] font-bold text-[#C9A96E] group-hover:underline">{code}</span>
                            <span className="text-[10px] text-gray-400">{hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    { icon: ShieldCheck, text: 'Bảo mật SSL 256-bit' },
                    { icon: Truck, text: 'Miễn phí vận chuyển' },
                    { icon: Package, text: 'Đổi trả trong 30 ngày' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-[11px] text-gray-400">
                      <Icon size={13} className="text-[#C9A96E] flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;