import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    item_count: 0,
    subtotal: 0,
    delivery_fee: 0,
    total_amount: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || role !== 'buyer') {
      setCart({ items: [], item_count: 0, subtotal: 0, delivery_fee: 0, total_amount: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/api/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, role]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/api/cart/items', { product_id: productId, quantity });
      await fetchCart();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to add item to cart';
      return { success: false, error: errorMsg };
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      await api.patch(`/api/cart/items/${cartItemId}`, { quantity: newQuantity });
      await fetchCart();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update quantity';
      return { success: false, error: errorMsg };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/api/cart/items/${cartItemId}`);
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to remove item' };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart/clear');
      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      itemCount: cart.item_count || 0,
      subtotal: cart.subtotal || 0,
      deliveryFee: cart.delivery_fee || 0,
      totalAmount: cart.total_amount || 0,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
