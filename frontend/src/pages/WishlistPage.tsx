import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { BookCover } from '../components/common/BookCover';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleAddToCart = async (book: any) => {
    const ok = await addToCart(book._id, 1);
    if (ok) {
      toast.success(`"${book.title}" added to your cart!`);
    } else {
      toast.error('Failed to add book to cart');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-borderMuted">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-navy">
                My Wishlist
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-textSecondary">
              {wishlist.length === 0
                ? 'Your wishlist is currently empty'
                : `You have ${wishlist.length} saved ${wishlist.length === 1 ? 'book' : 'books'} ready for your reading list`}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-borderMuted p-12 text-center max-w-md mx-auto space-y-4 shadow-soft">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-400 mx-auto flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-lg text-navy">No books in your wishlist</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Explore our best-sellers and classic collections, and click the heart icon on any book to save it here for later.
            </p>
            <div className="pt-2">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-golden hover:bg-golden-light text-navy font-bold text-xs uppercase tracking-wider transition-all shadow-soft"
              >
                <span>Explore Books</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((book) => (
              <div
                key={book._id}
                className="bg-surface rounded-2xl border border-borderMuted hover:border-golden/40 p-4 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Book Image */}
                  <div className="relative mb-3 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-2">
                    <Link to={`/books/${book.slug || book._id}`} className="w-full">
                      <BookCover
                        src={book.coverImage}
                        alt={book.title}
                        aspectRatio="aspect-[3/4]"
                      />
                    </Link>
                    <button
                      onClick={() => {
                        removeFromWishlist(book._id);
                        toast.info(`Removed "${book.title}" from wishlist`);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-borderMuted text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-xs transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info */}
                  <Link to={`/books/${book.slug || book._id}`}>
                    <h3 className="font-serif font-bold text-navy text-sm sm:text-base line-clamp-1 hover:text-golden-dark transition-colors mb-0.5">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-textSecondary text-[11px] mb-2">by {book.author}</p>

                  <div className="flex items-baseline space-x-2 mb-3">
                    <span className="font-bold text-navy text-base">₹{book.pricing?.price}</span>
                    {book.pricing?.originalPrice > book.pricing?.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{book.pricing?.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleAddToCart(book)}
                  className="w-full py-2 px-3 rounded-xl bg-golden hover:bg-golden-light text-navy font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
