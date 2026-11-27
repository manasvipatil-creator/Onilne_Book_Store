import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Download,
  Book as BookIcon,
  Truck,
  ShieldCheck,
  Calendar,
  Layers,
  Globe,
  Tag,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  FileText,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { Book } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookCard } from '../components/BookCard';
import { Button, Badge, Card, Skeleton, BookCover } from '../components/common';
import { handleBookImageError } from '../utils/imageFallbacks';
import { CheckoutAuthModal } from '../components/CheckoutAuthModal';

export const BookDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping'>('description');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const isInCart = book ? items.some((item) => (item.book.id || (item.book as any)._id) === book._id) : false;

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/books/${slug}`);
        if (res.data.success) {
          setBook(res.data.data.book);
          setRelatedBooks(res.data.data.relatedBooks || []);
        }
      } catch (err) {
        console.error('Failed to fetch book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton variant="text" className="w-1/4 h-5" />
            <Skeleton variant="text" className="w-4/5 h-8" />
            <Skeleton variant="text" className="w-1/3 h-5" />
            <Skeleton className="w-full h-20 rounded-2xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-black text-navy mb-4">Book Not Found</h2>
        <p className="text-textSecondary text-sm mb-6">
          The requested title is no longer available in our active catalog.
        </p>
        <Link to="/books">
          <Button variant="primary">Browse All Collections</Button>
        </Link>
      </div>
    );
  }

  const discountPercent =
    book.pricing.originalPrice > book.pricing.price
      ? Math.round(((book.pricing.originalPrice - book.pricing.price) / book.pricing.originalPrice) * 100)
      : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const ok = await addToCart(book._id, quantity);
      if (ok) {
        setJustAdded(true);
        success(`"${book.title}" added to your shopping cart!`);
        setTimeout(() => setJustAdded(false), 2500);
      }
    } catch {
      error('Failed to add book to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!book) return;
    setIsAdding(true);
    try {
      const ok = await addToCart(book._id, quantity, book);
      if (ok) {
        if (!user) {
          setShowAuthModal(true);
        } else {
          navigate('/checkout');
        }
      }
    } catch {
      error('Failed to proceed with checkout');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-bold text-textSecondary">
        <Link to="/" className="hover:text-navy transition-colors">Home</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-navy transition-colors">Books</Link>
        <span>/</span>
        <span className="text-navy truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Large Book Cover (5 cols) */}
        <div className="lg:col-span-5 relative">
          <div className="w-full rounded-3xl overflow-hidden shadow-elevated border border-borderMuted bg-slate-50 p-4 flex items-center justify-center">
            <BookCover
              src={book.coverImage}
              alt={book.title}
              aspectRatio="aspect-[2/3]"
              loading="eager"
            />
          </div>

          {/* Top badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <Badge
              variant={book.type === 'ebook' ? 'ebook' : 'paperback'}
              size="md"
              icon={book.type === 'ebook' ? <Download className="w-3 h-3" /> : <BookIcon className="w-3 h-3" />}
            >
              {book.type === 'ebook' ? 'Instant Digital eBook' : 'Physical Paperback'}
            </Badge>

            {book.isBestSeller && (
              <Badge variant="bestseller" size="md">
                BESTSELLER
              </Badge>
            )}
          </div>

          {discountPercent > 0 && (
            <span className="absolute top-6 right-6 bg-golden text-navy font-black text-xs px-3 py-1 rounded-full shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Right Column: Book Details & Purchase Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-golden mb-1.5">
              {typeof book.categoryId === 'object' ? book.categoryId.name : 'Curated Literature'}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-navy leading-tight tracking-tight">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base text-textSecondary mt-2">
              Written by <span className="font-bold text-navy">{book.author}</span>
            </p>
          </div>

          {/* Pricing Strip */}
          <div className="p-5 rounded-2xl bg-surface border border-borderMuted shadow-xs flex flex-wrap items-baseline gap-4">
            <span className="text-3xl sm:text-4xl font-black text-navy">
              ₹{book.pricing.price}
            </span>
            {book.pricing.originalPrice > book.pricing.price && (
              <span className="text-lg text-slate-400 line-through">
                ₹{book.pricing.originalPrice}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Inclusive of all taxes
            </span>
          </div>

          {/* Stock / Availability Status */}
          <div className="text-xs font-bold">
            {book.type === 'physical' ? (
              (book.physical?.stock ?? 0) > 0 ? (
                <p className="text-emerald-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> In Stock ({book.physical?.stock} copies ready to ship)
                </p>
              ) : (
                <p className="text-rose-600">Currently Out of Stock</p>
              )
            ) : (
              <p className="text-sky-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" /> Instant Digital Access (PDF & EPUB files immediately unlocked)
              </p>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            {book.type === 'physical' && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-black uppercase tracking-wider text-navy">Quantity:</span>
                <div className="flex items-center border border-borderMuted rounded-xl bg-surface shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-navy font-bold hover:bg-slate-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-black text-sm text-navy">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.physical?.stock || 10, quantity + 1))}
                    className="px-3.5 py-1.5 text-navy font-bold hover:bg-slate-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                icon={justAdded || isInCart ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShoppingCart className="w-4 h-4 text-golden" />}
                isLoading={isAdding}
                disabled={book.type === 'physical' && (book.physical?.stock ?? 0) <= 0}
                onClick={handleAddToCart}
                className={`w-full font-bold transition-all ${justAdded || isInCart ? 'border-emerald-500/50 text-emerald-300' : ''}`}
              >
                {justAdded || isInCart ? 'Added to Cart' : 'Add to Cart'}
              </Button>

              <Button
                variant="gold"
                size="lg"
                disabled={book.type === 'physical' && (book.physical?.stock ?? 0) <= 0}
                onClick={handleBuyNow}
                className="w-full font-black"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Quick Specifications Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-borderMuted text-xs">
            <div className="p-3 bg-slate-50/70 rounded-xl space-y-1">
              <span className="text-textSecondary flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-golden" />
                <span>Language</span>
              </span>
              <p className="font-bold text-navy">{book.language || 'English'}</p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl space-y-1">
              <span className="text-textSecondary flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-golden" />
                <span>Pages</span>
              </span>
              <p className="font-bold text-navy">{book.pages || 'N/A'}</p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl space-y-1">
              <span className="text-textSecondary flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-golden" />
                <span>Publisher</span>
              </span>
              <p className="font-bold text-navy truncate">{book.publisher || 'Independent'}</p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl space-y-1">
              <span className="text-textSecondary flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-golden" />
                <span>ISBN</span>
              </span>
              <p className="font-bold text-navy truncate">{book.isbn || 'N/A'}</p>
            </div>
          </div>

          {/* Fulfillment Guarantee Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-borderMuted space-y-2 text-xs text-textPrimary">
            {book.type === 'physical' ? (
              <div className="flex items-start space-x-2.5">
                <Truck className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Pan-India Delivery:</strong> Dispatched in 24 hours. Delivered in 2-4 business days with live courier tracking.
                </span>
              </div>
            ) : (
              <div className="flex items-start space-x-2.5">
                <Download className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Instant Digital Download:</strong> Download link immediately unlocked in your account dashboard upon payment confirmation.
                </span>
              </div>
            )}
            <div className="flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
              <span>
                <strong>100% Genuine Guarantee:</strong> Sourced directly from publishers. Razorpay-secured payments.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section for Description / Details / Shipping */}
      <div className="bg-surface rounded-3xl border border-borderMuted p-6 sm:p-10 shadow-xs">
        <div className="flex items-center space-x-6 border-b border-borderMuted pb-4 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`font-serif text-lg font-bold pb-2 transition-colors relative ${activeTab === 'description' ? 'text-navy border-b-2 border-golden' : 'text-slate-400 hover:text-navy'
              }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`font-serif text-lg font-bold pb-2 transition-colors relative ${activeTab === 'details' ? 'text-navy border-b-2 border-golden' : 'text-slate-400 hover:text-navy'
              }`}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`font-serif text-lg font-bold pb-2 transition-colors relative ${activeTab === 'shipping' ? 'text-navy border-b-2 border-golden' : 'text-slate-400 hover:text-navy'
              }`}
          >
            Shipping & Returns
          </button>
        </div>

        <div>
          {activeTab === 'description' && (
            <div className="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base font-serif">
              <p className="whitespace-pre-line">{book.description}</p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-borderMuted">
                <span className="text-textSecondary">Full Title:</span>
                <span className="font-bold text-navy">{book.title}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-borderMuted">
                <span className="text-textSecondary">Author:</span>
                <span className="font-bold text-navy">{book.author}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-borderMuted">
                <span className="text-textSecondary">Publisher:</span>
                <span className="font-bold text-navy">{book.publisher || 'Independent'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-borderMuted">
                <span className="text-textSecondary">ISBN-13:</span>
                <span className="font-bold text-navy">{book.isbn || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-borderMuted">
                <span className="text-textSecondary">Language:</span>
                <span className="font-bold text-navy">{book.language || 'English'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-borderMuted">
                <span className="text-textSecondary">Edition Format:</span>
                <span className="font-bold text-navy capitalize">{book.type}</span>
              </div>
              {book.type === 'ebook' && book.digital && (
                <>
                  <div className="flex justify-between py-2 border-b border-borderMuted">
                    <span className="text-textSecondary">File Format:</span>
                    <span className="font-bold text-navy uppercase">{book.digital.fileFormat}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-borderMuted">
                    <span className="text-textSecondary">File Size:</span>
                    <span className="font-bold text-navy">{(book.digital.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>Delivery Timelines:</strong> Physical books are packed in bubble-wrap reinforcement and dispatched via BlueDart / Delhivery / IndiaPost Express within 24 hours. Transit time is 2-4 business days depending on location.
              </p>
              <p>
                <strong>Digital Downloads:</strong> Instant delivery. eBooks in PDF and EPUB format are available immediately upon payment confirmation in your customer dashboard under "My eBooks".
              </p>
              <p>
                <strong>Hassle-free Returns:</strong> 7-day replacement policy for damaged or defective physical books upon delivery.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-golden rounded-full"></div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-navy">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook._id} book={relBook as any} />
            ))}
          </div>
        </div>
      )}

      {/* Guest Checkout Auth Modal */}
      <CheckoutAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl="/checkout"
      />
    </div>
  );
};
