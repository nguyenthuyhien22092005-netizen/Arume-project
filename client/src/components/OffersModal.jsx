import React, { useState } from 'react';

export const OffersModal = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState('');

  if (!isOpen) return null;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[1005] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F9F7F2] text-black dark:bg-gray-900 dark:text-white w-full max-w-lg relative animate-in zoom-in-95 duration-300 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          ✕
        </button>
        
        <div className="p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif italic mb-2 text-red-800 dark:text-red-400">Ưu Đãi Đặc Quyền</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dành riêng cho bạn hôm nay.</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-lg dark:text-white">Giảm 30% đơn hàng đầu tiên</h3>
                <p className="text-xs text-gray-500 mt-1">Dành riêng cho khách hàng mới · Tối đa $50.</p>
              </div>
              <div className="text-center">
                <span className="block border-2 border-dashed border-red-800 dark:border-red-400 text-red-800 dark:text-red-400 font-mono px-3 py-1 bg-red-50 dark:bg-red-900/20 font-bold mb-2">WELCOME30</span>
                <button
                  onClick={() => handleCopy('WELCOME30')}
                  className={`text-[10px] uppercase font-bold tracking-widest transition ${copiedCode === 'WELCOME30' ? 'text-green-600' : 'text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}
                >
                  {copiedCode === 'WELCOME30' ? '✓ Đã copy!' : 'Copy Mã'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-lg dark:text-white">Miễn phí Vận chuyển nhanh</h3>
                <p className="text-xs text-gray-500 mt-1">Đơn hàng từ $200 trở lên.</p>
              </div>
              <div className="text-center">
                <span className="block border-2 border-dashed border-black dark:border-white dark:text-white font-mono px-3 py-1 bg-gray-50 dark:bg-gray-700 font-bold mb-2">FREESHIP200</span>
                <button
                  onClick={() => handleCopy('FREESHIP200')}
                  className={`text-[10px] uppercase font-bold tracking-widest transition ${copiedCode === 'FREESHIP200' ? 'text-green-600' : 'text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}
                >
                  {copiedCode === 'FREESHIP200' ? '✓ Đã copy!' : 'Copy Mã'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-lg dark:text-white">Giảm 15% toàn bộ sản phẩm</h3>
                <p className="text-xs text-gray-500 mt-1">Áp dụng cho mọi đơn hàng · Tối đa $30.</p>
              </div>
              <div className="text-center">
                <span className="block border-2 border-dashed border-amber-700 dark:border-amber-400 text-amber-800 dark:text-amber-400 font-mono px-3 py-1 bg-amber-50 dark:bg-amber-900/20 font-bold mb-2">SALE15</span>
                <button
                  onClick={() => handleCopy('SALE15')}
                  className={`text-[10px] uppercase font-bold tracking-widest transition ${copiedCode === 'SALE15' ? 'text-green-600' : 'text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}
                >
                  {copiedCode === 'SALE15' ? '✓ Đã copy!' : 'Copy Mã'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
