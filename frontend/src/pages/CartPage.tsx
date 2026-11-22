import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Book, Download, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Card, Badge, EmptyState, Input, ConfirmDialog } from '../components/common';
import { handleBookImageError } from '../utils/imageFallbacks';
import { CheckoutAuthModal } from '../components/CheckoutAuthModal';

export const CartPage: React.FC = () => {
  const { items, subtotal, totalItems, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title="Your shopping cart is empty"
          description="Explore thousands of bestselling titles, profound literature, and instant digital eBooks."
          actionText="Explore All Books"
          onAction={() => navigate('/books')}
        />
      </div>
    );
  }

  const hasPhysical = items.some((i) => i.book.type === 'physical');
  const freeShippingThreshold = 499;
  const shipping = hasPhysical && subtotal < freeShippingThreshold ? 50 : 0;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const tax = Math.round((subtotal - couponDiscount) * 0.05);
  const finalTotal = Math.max(0, subtotal - couponDiscount) + shipping + tax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.1);
      setCouponDiscount(disc);
      setAppliedCoupon('WELCOME10');
      success('10% Welcome discount applied successfully!');
    } else if (couponCode.toUpperCase() === 'READMORE') {
      if (subtotal < 699) {
        error('READMORE requires minimum order of ₹699');
        return;
      }
      setCouponDiscount(100);
      setAppliedCoupon('READMORE');
      success('Flat ₹100 READMORE discount applied!');
    } else {
      error('Invalid promotional coupon code');
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/checkout');
  };

  const handleConfirmRemoveItem = async () => {
    if (!itemToDelete) return;
    await removeFromCart(itemToDelete.id);
    success(`"${itemToDelete.title}" removed from cart`);
    setItemToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-borderMuted flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-golden flex items-center space-x-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Preparation</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-navy tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Review <span className="font-bold text-navy">{totalItems} items</span> in your reading basket
          </p>
        </div>

        {hasPhysical && amountNeededForFreeShipping > 0 && (
          <div className="text-xs font-bold text-amber-800 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
            Add <strong>₹{amountNeededForFreeShipping}</strong> more for <strong>FREE Delivery</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Cart Items List (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.book.id}
              className="bg-surface rounded-2xl border border-borderMuted p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <Link to={`/books/${item.book.slug || item.book.id}`} className="flex-shrink-0">
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    onError={handleBookImageError}
                    className="w-16 h-22 object-cover rounded-xl shadow-xs border border-borderMuted"
                  />
                </Link>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.book.type === 'ebook' ? 'ebook' : 'paperback'} size="sm">
                      {item.book.type === 'ebook' ? 'eBook' : 'Paperback'}
                    </Badge>
                  </div>
                  <Link
                    to={`/books/${item.book.slug || item.book.id}`}
                    className="font-serif font-bold text-base text-navy hover:text-golden truncate block"
                  >
                    {item.book.title}
                  </Link>
                  <p className="text-xs text-textSecondary">by {item.book.author}</p>
                  <div className="flex items-baseline space-x-2 pt-1">
                    <span className="font-bold text-navy text-sm">₹{item.book.price}</span>
                    {item.book.originalPrice > item.book.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.book.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-borderMuted">
                {item.book.type === 'physical' ? (
                  <div className="flex items-center border border-borderMuted rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-navy font-bold hover:bg-slate-200 rounded-l-xl transition-colors disabled:opacity-40"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-navy">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                      className="px-3 py-1 text-navy font-bold hover:bg-slate-200 rounded-r-xl transition-colors"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    Qty: 1 (Single License)
                  </span>
                )}

                <div className="text-right">
                  <p className="text-base sm:text-lg font-black text-navy">₹{item.subtotal}</p>
                </div>

                <button
                  onClick={() => setItemToDelete({ id: item.book.id, title: item.book.title })}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                  title="Remove book from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/books"
              className="text-xs font-bold text-navy hover:text-golden inline-flex items-center space-x-1.5 transition-colors"
            >
              <span>← Continue Exploring More Books</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Sticky Order Summary Card (4 cols on lg) */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <Card className="p-6 sm:p-7 space-y-6">
            <h3 className="font-serif text-xl font-bold text-navy pb-3 border-b border-borderMuted">
              Order Summary
            </h3>

            {/* Price lines */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-textSecondary">
                <span>Items Subtotal:</span>
                <span className="font-bold text-navy">₹{subtotal}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon}):</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-textSecondary">
                <span>Standard Shipping:</span>
                <span className="font-bold text-navy">
                  {shipping === 0 ? <span className="text-emerald-600 font-black">FREE</span> : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between text-textSecondary">
                <span>Estimated Taxes (5%):</span>
                <span className="font-bold text-navy">₹{tax}</span>
              </div>

              <div className="pt-4 border-t border-borderMuted flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-navy">Total Payable:</span>
                <span className="font-black text-2xl text-navy">₹{finalTotal}</span>
              </div>
            </div>

            {/* Coupon Input Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-borderMuted">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
                Promo Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-borderMuted rounded-xl text-xs bg-slate-50 focus:bg-white uppercase focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Promo active: {appliedCoupon}</span>
                </p>
              )}
            </form>

            {/* Checkout Action Button */}
            <Button
              variant="gold"
              size="lg"
              className="w-full font-black shadow-md flex items-center justify-center space-x-2"
              onClick={handleProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-[11px] text-center text-textSecondary">
              🔒 100% Encrypted & Protected by Razorpay
            </p>
          </Card>
        </div>
      </div>

      {/* Guest Authentication Modal */}
      <CheckoutAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectUrl="/checkout"
      />

      {/* Custom Reusable Confirm Dialog for item removal */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmRemoveItem}
        title="Remove Book from Cart?"
        message={`Are you sure you want to remove "${itemToDelete?.title}" from your reading cart?`}
        confirmText="Remove Item"
        cancelText="Keep in Cart"
        variant="danger"
      />
    </div>
  );
};
