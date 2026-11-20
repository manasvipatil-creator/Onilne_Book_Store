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
} from 'lucide-react';
import api from '../services/api';
import { Book } from '../types';
import { useCart } from '../context/CartContext';
import { BookCard } from '../components/BookCard';
import { handleBookImageError } from '../utils/imageFallbacks';

export const BookDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-navy mb-4">Book not found</h2>
        <Link to="/books" className="px-6 py-2.5 bg-navy text-white rounded-lg font-semibold">
          Browse All Books
        </Link>
      </div>
    );
  }

  const discountPercent =
    book.pricing.originalPrice > book.pricing.price
      ? Math.round(((book.pricing.originalPrice - book.pricing.price) / book.pricing.originalPrice) * 100)
      : 0;

  const handleAddToCart = async () => {
    await addToCart(book._id, quantity);
  };

  const handleBuyNow = async () => {
    const success = await addToCart(book._id, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Product Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Cover Image Container */}
        <div className="relative aspect-[3/4] max-w-md mx-auto md:max-w-none w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={handleBookImageError}
          />
          {discountPercent > 0 && (
            <span className="absolute top-4 right-4 bg-golden text-navy font-bold text-sm px-3 py-1 rounded-md shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Info & Purchase Area */}
        <div className="space-y-6">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-navy mb-2">
              {book.type === 'ebook' ? (
                <>
                  <Download className="w-3 h-3 mr-1 text-blue-600" /> Instant Digital eBook
                </>
              ) : (
                <>
                  <BookIcon className="w-3 h-3 mr-1 text-golden" /> Physical Book Edition
                </>
              )}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">{book.title}</h1>
            <p className="text-base text-gray-600 mt-1">
              By <span className="font-semibold text-navy">{book.author}</span>
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-baseline space-x-4">
            <span className="text-3xl font-extrabold text-navy">₹{book.pricing.price}</span>
            {book.pricing.originalPrice > book.pricing.price && (
              <span className="text-lg text-gray-400 line-through">₹{book.pricing.originalPrice}</span>
            )}
            <span className="text-xs text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded border border-green-200">
              Inclusive of all taxes
            </span>
          </div>

          {/* Availability / Stock */}
          <div className="text-sm">
            {book.type === 'physical' ? (
              (book.physical?.stock ?? 0) > 0 ? (
                <p className="text-green-700 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> In Stock ({book.physical?.stock} copies available)
                </p>
              ) : (
                <p className="text-red-600 font-semibold">Out of Stock</p>
              )
            ) : (
              <p className="text-blue-700 font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" /> Instant Digital Download Available (PDF/EPUB)
              </p>
            )}
          </div>

          {/* Purchase Actions */}
          <div className="space-y-4 pt-2">
            {book.type === 'physical' && (
              <div className="flex items-center space-x-4">
                <label className="text-xs font-bold text-gray-700 uppercase">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-navy font-bold hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 font-semibold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.physical?.stock || 10, quantity + 1))}
                    className="px-3 py-1 text-navy font-bold hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={book.type === 'physical' && (book.physical?.stock ?? 0) <= 0}
                className="flex items-center justify-center space-x-2 py-3.5 px-6 rounded-lg bg-navy text-white font-bold hover:bg-navy-light disabled:opacity-50 transition-colors shadow-sm"
              >
                <ShoppingCart className="w-5 h-5 text-golden" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={book.type === 'physical' && (book.physical?.stock ?? 0) <= 0}
                className="py-3.5 px-6 rounded-lg bg-golden text-navy font-bold hover:bg-golden-light disabled:opacity-50 transition-colors shadow-sm"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 text-xs">
            <div className="flex items-center space-x-2 text-gray-600">
              <Globe className="w-4 h-4 text-golden" />
              <span>Language: <strong>{book.language}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Layers className="w-4 h-4 text-golden" />
              <span>Pages: <strong>{book.pages}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4 text-golden" />
              <span>Publisher: <strong>{book.publisher}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Tag className="w-4 h-4 text-golden" />
              <span>ISBN: <strong>{book.isbn || 'N/A'}</strong></span>
            </div>
          </div>

          {/* Fulfillment Guarantee Note */}
          <div className="p-4 rounded-xl bg-navy bg-opacity-5 border border-navy border-opacity-10 space-y-2 text-xs text-navy">
            {book.type === 'physical' ? (
              <div className="flex items-start space-x-2">
                <Truck className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Standard Delivery:</strong> Dispatched in 24 hours. Delivery within 3-5 business days across India.
                </span>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <Download className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Immediate Access:</strong> Access link added to your customer dashboard instantly after checkout verification.
                </span>
              </div>
            )}
            <div className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
              <span>
                <strong>Authenticity Guarantee:</strong> 100% genuine copies sourced directly from authorized publishing houses.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-surface rounded-2xl p-8 border border-gray-200">
        <h2 className="text-xl font-bold text-navy mb-4">Book Description</h2>
        <div className="prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base">
          {book.description}
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-navy mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook._id} book={relBook as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
