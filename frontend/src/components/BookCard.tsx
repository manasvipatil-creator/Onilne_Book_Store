import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Download, Book } from 'lucide-react';
import { Book as BookType } from '../types';
import { useCart } from '../context/CartContext';
import { handleBookImageError } from '../utils/imageFallbacks';

interface BookCardProps {
  book: BookType;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart } = useCart();
  const discountPercent =
    book.pricing.originalPrice > book.pricing.price
      ? Math.round(((book.pricing.originalPrice - book.pricing.price) / book.pricing.originalPrice) * 100)
      : 0;

  return (
    <div className="group bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={handleBookImageError}
          />

          {/* Product Type Badge */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-md shadow-sm ${book.type === 'ebook'
                ? 'bg-blue-600 text-white flex items-center gap-1'
                : 'bg-navy text-white flex items-center gap-1'
                }`}
            >
              {book.type === 'ebook' ? (
                <>
                  <Download className="w-3 h-3" /> eBook
                </>
              ) : (
                <>
                  <Book className="w-3 h-3" /> Paperback
                </>
              )}
            </span>
            {book.isBestSeller && (
              <span className="bg-golden text-navy text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 right-2.5 bg-golden text-navy font-bold text-xs px-2 py-0.5 rounded shadow-sm">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-1">
            {typeof book.categoryId === 'object' ? book.categoryId.name : 'Literature'}
          </p>
          <Link to={`/books/${book.slug}`}>
            <h3 className="font-bold text-navy text-base line-clamp-2 hover:text-golden transition-colors mb-1" title={book.title}>
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-600 line-clamp-1 mb-3">by {book.author}</p>

          {/* Price display */}
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-navy">₹{book.pricing.price}</span>
            {book.pricing.originalPrice > book.pricing.price && (
              <span className="text-xs text-gray-400 line-through">₹{book.pricing.originalPrice}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Full-Width Add to Cart matching reference */}
      <div className="p-3 pt-0">
        <button
          onClick={() => addToCart(book._id, 1)}
          className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-lg transition-all shadow-sm active:scale-98 group/btn"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-golden group-hover/btn:scale-110 transition-transform" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
