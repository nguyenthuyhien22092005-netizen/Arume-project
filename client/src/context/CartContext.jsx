import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { syncCartPrices } from '../api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Trạng thái đồng bộ
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncWarnings, setSyncWarnings] = useState([]); // [{id, name, oldPrice, newPrice, outOfStock}]

  // Tránh sync nhiều lần liên tiếp
  const syncTimeout = useRef(null);

  // Lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Sync giá + tồn kho khi mở giỏ hàng ──────────────────────────────────
  useEffect(() => {
    if (!isCartOpen || cartItems.length === 0) return;

    // Debounce: tránh gọi API liên tục nếu drawer đóng/mở nhanh
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(async () => {
      setIsSyncing(true);
      setSyncWarnings([]);

      try {
        const ids = cartItems.map(item => item._id || item.id).filter(Boolean);
        if (ids.length === 0) return;

        const { data: freshData } = await syncCartPrices(ids);
        const warnings = [];

        setCartItems(prev =>
          prev.map(item => {
            const key = item._id || item.id;
            const fresh = freshData[key];
            if (!fresh) return item; // sản phẩm đã bị xóa khỏi DB → giữ nguyên

            const priceChanged = fresh.price !== item.price;
            const outOfStock = fresh.stock === 0;
            const overStock = item.quantity > fresh.stock && fresh.stock > 0;

            if (priceChanged || outOfStock || overStock) {
              warnings.push({
                id: key,
                name: item.name,
                oldPrice: item.price,
                newPrice: fresh.price,
                priceChanged,
                outOfStock,
                overStock,
                maxStock: fresh.stock,
              });
            }

            return {
              ...item,
              price: fresh.price,
              stock: fresh.stock,
              // Nếu số lượng vượt tồn kho, tự động giảm xuống còn max
              quantity: overStock ? fresh.stock : item.quantity,
            };
          })
        );

        setSyncWarnings(warnings);
      } catch (err) {
        console.warn('[Cart] Không thể đồng bộ giá:', err.message);
      } finally {
        setIsSyncing(false);
      }
    }, 300);

    return () => clearTimeout(syncTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartOpen]);
  // ─────────────────────────────────────────────────────────────────────────

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id || item.id === product.id);
      if (existing) {
        return prev.map(item =>
          (item._id === product._id || item.id === product.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId && item.id !== productId));
    setSyncWarnings(prev => prev.filter(w => w.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      (item._id === productId || item.id === productId)
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCartItems([]);
    setSyncWarnings([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartTotal,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      isSyncing,
      syncWarnings,
      setSyncWarnings,
    }}>
      {children}
    </CartContext.Provider>
  );
};
