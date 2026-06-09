import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from './CheckoutModal';
import { AuthModal } from './AuthModal';

export const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal, isSyncing, syncWarnings, setSyncWarnings } = useCart();
  const { user } = useAuth();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutClick = () => {
    if (!user) {
      // Yêu cầu đăng nhập trước khi checkout
      setShowAuthPrompt(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleLoginToCheckout = () => {
    setShowAuthPrompt(false);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />}

      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#F9F7F2] dark:bg-gray-900 z-50 transform transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-serif italic dark:text-white">Giỏ hàng <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-full text-sm ml-2 font-sans not-italic">{cartCount}</span></h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition transform hover:rotate-90 duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Auth prompt banner */}
          {showAuthPrompt && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-center animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-3">
                🔐 Vui lòng đăng nhập để tiến hành thanh toán
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleLoginToCheckout}
                  className="bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-xs font-bold tracking-widest hover:bg-amber-900 dark:hover:bg-gray-200 transition"
                >
                  ĐĂNG NHẬP
                </button>
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 text-xs tracking-widest hover:border-black transition"
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}

          {/* Sync indicator */}
          {isSyncing && (
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded">
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Đang cập nhật giá và tồn kho…
            </div>
          )}

          {/* Price / stock change warnings */}
          {syncWarnings.length > 0 && (
            <div className="mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">⚠️ Giỏ hàng đã được cập nhật</p>
                <button onClick={() => setSyncWarnings([])} className="text-amber-500 hover:text-amber-700 text-xs">✕</button>
              </div>
              <ul className="space-y-1">
                {syncWarnings.map(w => (
                  <li key={w.id} className="text-xs text-amber-700 dark:text-amber-400">
                    {w.outOfStock && (
                      <span>🚫 <strong>{w.name}</strong> đã hết hàng và bị xoá khỏi giỏ</span>
                    )}
                    {!w.outOfStock && w.overStock && (
                      <span>📦 <strong>{w.name}</strong>: số lượng đã điều chỉnh xuống còn {w.maxStock} (tồn kho)</span>
                    )}
                    {!w.outOfStock && w.priceChanged && (
                      <span>
                        💰 <strong>{w.name}</strong>: giá đổi từ{' '}
                        <span className="line-through">${w.oldPrice?.toFixed(2)}</span>
                        {' → '}
                        <span className="font-bold text-amber-900 dark:text-amber-200">${w.newPrice?.toFixed(2)}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Product list */}
          <div className="flex-1 overflow-y-auto pr-2">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-20 flex flex-col items-center gap-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <p className="font-serif text-lg dark:text-gray-200">Giỏ hàng của bạn đang trống</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-4 border border-black dark:border-white text-black dark:text-white px-6 py-2 text-sm tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">
                  TIẾP TỤC MUA SẮM
                </button>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item._id || item.id} className="flex gap-6 mb-8 bg-white dark:bg-gray-800 p-4 shadow-sm">
                  <img src={item.image} className="w-24 h-24 object-cover" alt={item.name} />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-serif font-bold dark:text-white">{item.name}</h3>
                        <button onClick={() => removeFromCart(item._id || item.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                      </div>
                      <p className="text-sm font-medium mt-1 text-gray-600 dark:text-gray-300">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-4 border border-gray-200 dark:border-gray-700 px-3 py-1">
                        <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">-</button>
                        <span className="text-sm font-semibold w-4 text-center dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">+</button>
                      </div>
                      <p className="font-semibold dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
              <div className="bg-[#F4F6F4] dark:bg-gray-800 p-3 mb-6 text-sm text-gray-700 dark:text-gray-200 text-center font-medium border border-green-100 dark:border-gray-700">
                Giao hàng miễn phí cho đơn hàng này!
              </div>
              {!user && (
                <div className="mb-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 px-3 py-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Đăng nhập để đặt hàng và theo dõi vận chuyển
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">Thuế và phí vận chuyển được tính tại bước thanh toán</p>
              <div className="flex justify-between text-xl font-serif mb-6 border-b border-dashed border-gray-300 dark:border-gray-700 pb-4 dark:text-white">
                <span>Tổng cộng</span> <span>${getCartTotal().toFixed(2)} USD</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsCartOpen(false)} className="border border-black dark:border-white text-black dark:text-white py-4 text-sm font-semibold tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 transition">TIẾP TỤC MUA SẮM</button>
                <button onClick={handleCheckoutClick} className="bg-black text-white dark:bg-white dark:text-black py-4 text-sm font-semibold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  {!user && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  THANH TOÁN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        product={cartItems.length === 1 ? cartItems[0] : null}
        cartTotal={getCartTotal()}
      />

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            // Nếu đã đăng nhập sau khi modal đóng thì mở checkout
          }}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setIsCartOpen(false);
            setIsCheckoutModalOpen(true);
          }}
        />
      )}
    </>
  );
};
