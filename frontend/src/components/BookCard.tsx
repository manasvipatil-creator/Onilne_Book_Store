import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Book } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { BookCover } from './common/BookCover';
import { Badge } from './common/Badge';

interface BookCardProps {
  book: Book;
  featured?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Discount percentage calculation
  const discountPercent =
    book.pricing.originalPrice > book.pricing.price
      ? Math.round(
          ((book.pricing.originalPrice - book.pricing.price) /
            book.pricing.originalPrice) *
            100
        )
      : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    const ok = await addToCart(book._id, 1);
    if (ok) {
      toast.success(`"${book.title}" added to your cart!`);
    } else {
      toast.error('Failed to add book to cart');
    }

    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const isOutOfStock = book.type === 'physical' && (book.physical?.stock || 0) <= 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-surface rounded-2xl border border-borderMuted hover:border-navy/20 p-3.5 sm:p-4 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col h-full"
    >
      <Link to={`/books/${book.slug || book._id}`} className="flex flex-col flex-grow">
        {/* Book Cover Container with fixed 3/4 aspect ratio */}
        <div className="relative mb-3.5 overflow-hidden rounded-xl bg-slate-100">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <BookCover
              src={book.coverImage}
              alt={book.title}
              aspectRatio="aspect-[3/4]"
              loading="lazy"
            />
          </div>

          {/* Badges container */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
            {book.type === 'ebook' ? (
              <Badge variant="ebook" size="sm">
                Instant eBook
              </Badge>
            ) : (
              <Badge variant="paperback" size="sm">
                Paperback
              </Badge>
            )}

            {book.isBestSeller && (
              <Badge variant="bestseller" size="sm">
                Bestseller
              </Badge>
            )}
          </div>

          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 z-10 pointer-events-none">
              <Badge variant="discount" size="sm">
                {discountPercent}% OFF
              </Badge>
            </div>
          )}
        </div>

        {/* Content Area - Fixed Clamps for Equal Heights */}
        <div className="flex flex-col flex-grow">
          {/* Category Tag */}
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">
            {typeof book.categoryId === 'object' && book.categoryId !== null
              ? (book.categoryId as any).name
              : 'Literature'}
          </span>

          {/* Title - exactly 2 lines clamped */}
          <h3 className="font-serif font-bold text-navy text-sm sm:text-base leading-snug line-clamp-2 mb-1 group-hover:text-golden transition-colors min-h-[2.5rem]">
            {book.title}
          </h3>

          {/* Author - exactly 1 line clamped */}
          <p className="text-xs text-textSecondary line-clamp-1 mb-3">
            by {book.author}
          </p>

          {/* Price display */}
          <div className="flex items-baseline space-x-2 mt-auto pb-3">
            <span className="text-base sm:text-lg font-bold text-navy">
              ₹{book.pricing.price}
            </span>
            {book.pricing.originalPrice > book.pricing.price && (
              <span className="text-xs text-textSecondary line-through font-normal">
                ₹{book.pricing.originalPrice}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Pinned cleanly at the bottom */}
      <div className="mt-auto pt-2 border-t border-borderMuted/60">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95 ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : isAdding
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'bg-navy text-white hover:bg-navy-light shadow-soft hover:shadow-md'
          }`}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : isAdding ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 text-golden" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
