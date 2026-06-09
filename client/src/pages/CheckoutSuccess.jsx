import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const orderIdRef = useRef('ORD-' + Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="bg-[#F9F7F2] dark:bg-gray-900 min-h-screen pt-32 pb-24 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-xl mx-auto px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-700">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-4xl font-serif italic mb-6 text-gray-900 dark:text-white">Cảm ơn bạn đã đặt hàng</h1>
        <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-10">
          Tuyệt tác của bạn đang được chúng tôi chuẩn bị với sự cẩn trọng cao nhất. 
          Email xác nhận đơn hàng cùng với mã vận đơn đã được gửi đến hộp thư của bạn.
        </p>
        
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 mb-10 text-left">
          <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Mã đơn hàng</p>
          <p className="font-serif italic text-xl dark:text-white">#{orderIdRef.current}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile" className="bg-white dark:bg-gray-800 border border-black dark:border-white text-black dark:text-white px-8 py-4 text-sm uppercase tracking-[0.2em] font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Xem đơn hàng
          </Link>
          <Link to="/collections" className="bg-black text-white px-8 py-4 text-sm uppercase tracking-[0.2em] font-semibold hover:bg-gray-800 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};
