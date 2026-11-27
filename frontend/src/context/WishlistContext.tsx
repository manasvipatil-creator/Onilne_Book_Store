import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book } from '../types';

interface WishlistContextType {
  wishlist: Book[];
  isInWishlist: (bookId: string) => boolean;
  toggleWishlist: (book: Book) => boolean; // returns true if added, false if removed
  removeFromWishlist: (bookId: string) => void;
  clearWishlist: () => void;
  totalWishlist: number;
}

const WISHLIST_STORAGE_KEY = 'bookora_wishlist_items';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  const isInWishlist = (bookId: string) => {
    return wishlist.some((b) => b._id === bookId);
  };

  const toggleWishlist = (book: Book): boolean => {
    const exists = isInWishlist(book._id);
    if (exists) {
      setWishlist((prev) => prev.filter((b) => b._id !== book._id));
      return false;
    } else {
      setWishlist((prev) => [book, ...prev]);
      return true;
    }
  };

  const removeFromWishlist = (bookId: string) => {
    setWishlist((prev) => prev.filter((b) => b._id !== bookId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        totalWishlist: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
