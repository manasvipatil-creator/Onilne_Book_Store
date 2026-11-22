import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CartItem, Book } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const GUEST_CART_STORAGE_KEY = 'bookstore_guest_cart';

interface StoredGuestCartItem {
  bookId: string;
  quantity: number;
  bookData?: CartItem['book'];
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (bookId: string, quantity?: number, bookData?: Book | CartItem['book']) => Promise<boolean>;
  updateQuantity: (bookId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (bookId: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const isMergingRef = useRef<boolean>(false);

  // Helper to calculate totals from items
  const calculateTotals = (cartItems: CartItem[]) => {
    let sub = 0;
    let total = 0;
    for (const item of cartItems) {
      const price = item.book?.price || 0;
      const qty = item.book?.type === 'ebook' ? 1 : item.quantity;
      sub += price * qty;
      total += qty;
    }
    return { subtotal: sub, totalItems: total };
  };

  // Helper to read guest cart from localStorage
  const getGuestCartFromStorage = (): StoredGuestCartItem[] => {
    try {
      const data = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Helper to save guest cart to localStorage
  const saveGuestCartToStorage = (guestItems: StoredGuestCartItem[]) => {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(guestItems));
  };

  // Hydrate guest cart items by fetching book details if needed
  const loadGuestCart = useCallback(async () => {
    const guestItems = getGuestCartFromStorage();
    if (guestItems.length === 0) {
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
      return;
    }

    setLoading(true);
    try {
      const resolvedItems: CartItem[] = [];

      for (const item of guestItems) {
        if (item.bookData) {
          const qty = item.bookData.type === 'ebook' ? 1 : item.quantity;
          resolvedItems.push({
            book: item.bookData,
            quantity: qty,
            subtotal: item.bookData.price * qty,
          });
        } else {
          // Fetch book info using slug/id endpoint
          try {
            const res = await api.get(`/books/${item.bookId}`);
            if (res.data?.success && res.data?.data?.book) {
              const b: Book = res.data.data.book;
              const formattedBook: CartItem['book'] = {
                id: b._id,
                title: b.title,
                slug: b.slug,
                author: b.author,
                coverImage: b.coverImage,
                type: b.type,
                price: b.pricing.price,
                originalPrice: b.pricing.originalPrice,
                stock: b.physical?.stock ?? 0,
              };
              item.bookData = formattedBook;
              const qty = b.type === 'ebook' ? 1 : item.quantity;
              resolvedItems.push({
                book: formattedBook,
                quantity: qty,
                subtotal: formattedBook.price * qty,
              });
            }
          } catch (err) {
            console.error(`Failed to load guest book info for ${item.bookId}:`, err);
          }
        }
      }

      // Update storage with filled bookData caches
      saveGuestCartToStorage(guestItems);

      const totals = calculateTotals(resolvedItems);
      setItems(resolvedItems);
      setSubtotal(totals.subtotal);
      setTotalItems(totals.totalItems);
    } finally {
      setLoading(false);
    }
  }, []);

  // Merge guest cart to backend upon login
  const mergeGuestCart = useCallback(async () => {
    const guestItems = getGuestCartFromStorage();
    if (guestItems.length === 0) return;

    if (isMergingRef.current) return;
    isMergingRef.current = true;

    try {
      const payload = guestItems.map((g) => ({
        bookId: g.bookId,
        quantity: g.quantity,
      }));
      await api.post('/cart/merge', { items: payload });
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to merge guest cart:', err);
    } finally {
      isMergingRef.current = false;
    }
  }, []);

  const fetchCart = useCallback(async () => {
    if (!user) {
      await loadGuestCart();
      return;
    }

    try {
      setLoading(true);
      // Check if we need to merge guest cart first
      const guestItems = getGuestCartFromStorage();
      if (guestItems.length > 0) {
        await mergeGuestCart();
      }

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
  }, [user, loadGuestCart, mergeGuestCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (
    bookId: string,
    quantity: number = 1,
    bookData?: Book | CartItem['book']
  ): Promise<boolean> => {
    if (!user) {
      // Guest cart handling in localStorage
      try {
        const guestItems = getGuestCartFromStorage();
        let formattedBookData: CartItem['book'] | undefined;

        if (bookData) {
          if ('pricing' in bookData) {
            formattedBookData = {
              id: bookData._id,
              title: bookData.title,
              slug: bookData.slug,
              author: bookData.author,
              coverImage: bookData.coverImage,
              type: bookData.type,
              price: bookData.pricing.price,
              originalPrice: bookData.pricing.originalPrice,
              stock: bookData.physical?.stock ?? 0,
            };
          } else {
            formattedBookData = bookData as CartItem['book'];
          }
        } else {
          // Fetch from server if not provided
          try {
            const res = await api.get(`/books/${bookId}`);
            if (res.data?.success && res.data?.data?.book) {
              const b: Book = res.data.data.book;
              formattedBookData = {
                id: b._id,
                title: b.title,
                slug: b.slug,
                author: b.author,
                coverImage: b.coverImage,
                type: b.type,
                price: b.pricing.price,
                originalPrice: b.pricing.originalPrice,
                stock: b.physical?.stock ?? 0,
              };
            }
          } catch {
            // continue without formattedBookData
          }
        }

        const existingIndex = guestItems.findIndex((i) => i.bookId === bookId);
        const isEbook = formattedBookData?.type === 'ebook';

        if (isEbook) {
          if (existingIndex > -1) {
            toastError('This eBook is already in your cart');
            return false;
          }
          guestItems.push({
            bookId,
            quantity: 1,
            bookData: formattedBookData,
          });
        } else {
          const reqQty = Math.max(1, quantity);
          const maxStock = formattedBookData?.stock ?? 99;
          if (maxStock <= 0) {
            toastError('This book is currently out of stock');
            return false;
          }

          if (existingIndex > -1) {
            const newQty = guestItems[existingIndex].quantity + reqQty;
            if (newQty > maxStock) {
              toastError(`Only ${maxStock} copies currently available`);
              return false;
            }
            guestItems[existingIndex].quantity = newQty;
            if (formattedBookData) {
              guestItems[existingIndex].bookData = formattedBookData;
            }
          } else {
            if (reqQty > maxStock) {
              toastError(`Only ${maxStock} copies currently available`);
              return false;
            }
            guestItems.push({
              bookId,
              quantity: reqQty,
              bookData: formattedBookData,
            });
          }
        }

        saveGuestCartToStorage(guestItems);
        await loadGuestCart();
        return true;
      } catch (err: any) {
        toastError('Failed to add item to guest cart');
        return false;
      }
    }

    // Authenticated user
    try {
      await api.post('/cart/items', { bookId, quantity });
      await fetchCart();
      return true;
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (bookId: string, quantity: number): Promise<boolean> => {
    if (!user) {
      const guestItems = getGuestCartFromStorage();
      const itemIndex = guestItems.findIndex((i) => i.bookId === bookId);
      if (itemIndex === -1) return false;

      const currentItem = guestItems[itemIndex];
      const isEbook = currentItem.bookData?.type === 'ebook';

      if (isEbook) {
        currentItem.quantity = 1;
      } else {
        const newQty = Math.max(1, quantity);
        const maxStock = currentItem.bookData?.stock ?? 99;
        if (newQty > maxStock) {
          toastError(`Cannot increase quantity. Only ${maxStock} in stock.`);
          return false;
        }
        currentItem.quantity = newQty;
      }

      saveGuestCartToStorage(guestItems);
      await loadGuestCart();
      return true;
    }

    try {
      await api.patch(`/cart/items/${bookId}`, { quantity });
      await fetchCart();
      return true;
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update quantity');
      return false;
    }
  };

  const removeFromCart = async (bookId: string): Promise<boolean> => {
    if (!user) {
      let guestItems = getGuestCartFromStorage();
      guestItems = guestItems.filter((i) => i.bookId !== bookId);
      saveGuestCartToStorage(guestItems);
      await loadGuestCart();
      return true;
    }

    try {
      await api.delete(`/cart/items/${bookId}`);
      await fetchCart();
      return true;
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to remove item');
      return false;
    }
  };

  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
      return;
    }

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
