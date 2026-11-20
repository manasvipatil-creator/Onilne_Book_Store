import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (bookId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (bookId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (bookId: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setItems(res.data.data.items);
        setSubtotal(res.data.data.subtotal);
        setTotalItems(res.data.data.totalItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (bookId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return false;
    }
    try {
      await api.post('/cart/items', { bookId, quantity });
      await fetchCart();
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (bookId: string, quantity: number): Promise<boolean> => {
    try {
      await api.patch(`/cart/items/${bookId}`, { quantity });
      await fetchCart();
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update quantity');
      return false;
    }
  };

  const removeFromCart = async (bookId: string): Promise<boolean> => {
    try {
      await api.delete(`/cart/items/${bookId}`);
      await fetchCart();
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove item');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        totalItems,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
