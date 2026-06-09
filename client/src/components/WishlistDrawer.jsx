import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const WishlistDrawer = () => {
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <>
      {isWishlistOpen && <div className="fixed inset-0 bg-black/50 z-[1002] backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)} />}
      
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#F9F7F2] dark:bg-gray-900 z-[1003] transform transition-transform duration-500 ease-in-out ${isWishlistOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-serif italic dark:text-white">Yêu thích <span className="bg-black dark:bg-white dark:text-black text-white px-2 py-0.5 rounded-full text-sm ml-2 font-sans not-italic">{wishlistItems.length}</span></h2>
            <button onClick={() => setIsWishlistOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition transform hover:rotate-90 duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {wishlistItems.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-20 flex flex-col items-center gap-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <p className="font-serif text-lg dark:text-gray-200">Danh sách yêu thích trống</p>
                <button 
                  onClick={() => setIsWishlistOpen(false)} 
                  className="mt-4 border border-black dark:border-white px-6 py-2 text-sm tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition dark:text-white"
                >
                  KHÁM PHÁ NGAY
                </button>
              </div>
            ) : (
              wishlistItems.map(item => (
                <div key={item._id || item.id} className="flex gap-6 mb-8 bg-white dark:bg-gray-800 p-4 shadow-sm relative group">
                  <button onClick={() => removeFromWishlist(item._id || item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition">✕</button>
                  <img src={item.image} className="w-24 h-24 object-cover" alt={item.name} />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${item._id || item.id}`} onClick={() => setIsWishlistOpen(false)}>
                        <h3 className="text-base font-serif font-bold dark:text-white hover:text-gray-600 transition">{item.name}</h3>
                      </Link>
                      <p className="text-sm font-medium mt-1 text-gray-600 dark:text-gray-300">${item.price?.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(item, 1)}
                      className="w-full mt-4 border border-black dark:border-white dark:text-white py-2 text-xs font-semibold tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                    >
                      THÊM VÀO GIỎ
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
