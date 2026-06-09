import React, { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item._id === product._id || item.id === product.id);
      if (exists) {
        return prev.filter(item => item._id !== product._id && item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item._id !== productId && item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId || item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      toggleWishlist, 
      removeFromWishlist,
      isInWishlist,
      isWishlistOpen,
      setIsWishlistOpen
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
