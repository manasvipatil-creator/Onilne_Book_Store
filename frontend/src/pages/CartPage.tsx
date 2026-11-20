import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Book, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { handleBookImageError } from '../utils/imageFallbacks';

export const CartPage: React.FC = () => {
  const { items, subtotal, totalItems, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-navy text-golden rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Please sign in to view your cart</h2>
        <p className="text-gray-500 text-sm mb-6">Your selected books and eBook downloads will be saved to your account.</p>
        <Link to="/login" className="px-6 py-2.5 bg-navy text-white rounded-lg font-semibold text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Your shopping cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Explore our curated collection of paperbacks and instant eBooks.</p>
        <Link
          to="/books"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-golden text-navy rounded-lg font-bold text-sm hover:bg-golden-light"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const shipping = subtotal < 500 && items.some((i) => i.book.type === 'physical') ? 50 : 0;
  const tax = Math.round(subtotal * 0.05);
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-navy">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mt-1">Review {totalItems} items in your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.book.id}
              className="bg-surface p-4 sm:p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.book.coverImage}
                  alt={item.book.title}
                  className="w-16 h-20 object-cover rounded shadow-sm bg-gray-100 flex-shrink-0"
                  onError={handleBookImageError}
                />
                <div>
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                    {item.book.type === 'ebook' ? (
                      <span className="text-blue-600 flex items-center">
                        <Download className="w-3 h-3 mr-1" /> Digital eBook
                      </span>
                    ) : (
                      <span className="text-navy flex items-center">
                        <Book className="w-3 h-3 mr-1 text-golden" /> Physical Book
                      </span>
                    )}
                  </span>
                  <Link to={`/books/${item.book.slug}`}>
                    <h4 className="font-bold text-navy text-sm sm:text-base hover:text-golden line-clamp-1">
                      {item.book.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-gray-500 mb-1">by {item.book.author}</p>
                  <p className="text-sm font-bold text-navy">₹{item.book.price}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                {item.book.type === 'physical' ? (
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-navy font-bold hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-semibold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-navy font-bold hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 font-medium italic">Qty: 1 (eBook)</span>
                )}

                <div className="text-right">
                  <p className="text-base font-bold text-navy">₹{item.subtotal}</p>
                </div>

                <button
                  onClick={() => removeFromCart(item.book.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/books"
              className="text-xs font-semibold text-navy hover:text-golden flex items-center space-x-1"
            >
              <span>← Continue Browsing More Books</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Checkout Card */}
        <div className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="font-bold text-navy text-lg pb-3 border-b border-gray-200">Order Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-medium text-navy">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-medium text-navy">
                {shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (GST 5%)</span>
              <span className="font-medium text-navy">₹{tax}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-extrabold text-navy">
              <span>Final Total</span>
              <span className="text-xl">₹{finalTotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-navy text-white font-bold rounded-lg hover:bg-navy-light transition-all text-sm flex items-center justify-center space-x-2 shadow-md"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 text-golden" />
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Encrypted payment processed safely with Razorpay gateway.
          </p>
        </div>
      </div>
    </div>
  );
};
