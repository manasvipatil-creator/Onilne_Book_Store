import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  MapPin,
  Plus,
  CreditCard,
  Ticket,
  AlertCircle,
  ArrowRight,
  Book,
  Download,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Address } from '../types';
import { Button, Card, Badge, Modal, Input } from '../components/common';
import { handleBookImageError } from '../utils/imageFallbacks';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, fetchCart } = useCart();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Address modal form state
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '',
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: true,
  });

  const hasPhysical = items.some((i) => i.book.type === 'physical');
  const hasDigital = items.some((i) => i.book.type === 'ebook');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Fetch user addresses
    api.get('/addresses').then((res) => {
      if (res.data.success) {
        const addrs: Address[] = res.data.data.addresses;
        setAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      }
    });

    // Dynamically load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, [user, items]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setAppliedCoupon('WELCOME10');
      success('10% Welcome discount applied!');
    } else if (couponCode.toUpperCase() === 'READMORE') {
      if (subtotal < 699) {
        setCouponError('Minimum order amount for READMORE is ₹699');
        toastError('Minimum order amount for READMORE is ₹699');
        return;
      }
      setDiscountAmount(100);
      setAppliedCoupon('READMORE');
      success('Flat ₹100 READMORE discount applied!');
    } else {
      setCouponError('Invalid coupon code');
      toastError('Invalid coupon code');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddr);
      if (res.data.success) {
        const created = res.data.data.address;
        setAddresses([created, ...addresses]);
        setSelectedAddressId(created._id);
        setShowAddAddress(false);
        success('Delivery address saved successfully!');
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePayNow = async () => {
    setError('');

    if (hasPhysical && !selectedAddressId) {
      setError('Please select or add a delivery address for physical items.');
      toastError('Please select a delivery address');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Initialize Checkout on Backend
      const checkoutRes = await api.post('/checkout', {
        addressId: hasPhysical ? selectedAddressId : undefined,
        couponCode: appliedCoupon || undefined,
      });

      if (!checkoutRes.data.success) {
        throw new Error(checkoutRes.data.message);
      }

      const { orderId, orderNumber, razorpayOrderId, amount, keyId, isSimulated } = checkoutRes.data.data;

      // Initialize Razorpay Standard Checkout modal with real test credentials
      if (window.Razorpay && keyId && !keyId.includes('placeholder')) {
        const options = {
          key: keyId,
          amount: amount,
          currency: 'INR',
          name: 'Online Book Store',
          description: `Order ${orderNumber}`,
          order_id: razorpayOrderId,
          handler: async (response: any) => {
            try {
              const verifyRes = await api.post('/payments/verify', {
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                await fetchCart();
                navigate(`/order-success/${orderId}`);
              }
            } catch (verErr: any) {
              const errMsg = verErr.response?.data?.message || 'Payment verification failed.';
              setError(errMsg);
              toastError(errMsg);
            }
          },
          modal: {
            ondismiss: () => {
              setError('Payment was cancelled by the user. You can retry when ready.');
              toastError('Payment cancelled.');
              setLoading(false);
            },
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.mobile,
          },
          theme: {
            color: '#243B53',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          const failMsg = resp.error?.description || 'Payment failed. Please retry.';
          setError(failMsg);
          toastError(failMsg);
          setLoading(false);
        });
        rzp.open();
      } else {
        throw new Error('Razorpay SDK failed to load or API Key is missing.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Checkout failed');
      toastError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const shipping = hasPhysical && subtotal < 500 ? 50 : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableSubtotal * 0.05);
  const finalTotal = taxableSubtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-borderMuted">
        <span className="text-xs font-black uppercase tracking-widest text-golden flex items-center space-x-1.5 mb-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Secured Checkout</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-navy tracking-tight">
          Complete Your Order
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          Review delivery destination, order items, and verify payment.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Step-by-Step Sections (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Delivery Address (For Physical Books) */}
          {hasPhysical ? (
            <Card className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-navy text-golden font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-navy flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-golden" />
                    <span>Delivery Address</span>
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setShowAddAddress(true)}
                >
                  Add Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-textSecondary">No delivery address saved yet.</p>
                  <Button variant="primary" size="sm" onClick={() => setShowAddAddress(true)}>
                    Add Delivery Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedAddressId === addr._id
                          ? 'border-navy bg-navy-subtle ring-2 ring-navy/10'
                          : 'border-borderMuted bg-surface hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy">{addr.fullName}</span>
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr._id}
                            onChange={() => setSelectedAddressId(addr._id)}
                            className="text-navy focus:ring-navy"
                          />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.house}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-[11px] text-textSecondary font-bold">📞 {addr.mobile}</p>
                      </div>
                      {addr.isDefault && (
                        <div className="mt-2">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            Default
                          </span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 bg-sky-50/60 border border-sky-200 flex items-center space-x-3.5">
              <Download className="w-6 h-6 text-sky-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-sky-900">Instant Digital Delivery</h4>
                <p className="text-xs text-sky-800">
                  Your cart contains digital eBooks only. No physical shipping is required. Files will be unlocked immediately in your dashboard.
                </p>
              </div>
            </Card>
          )}

          {/* Step 2: Order Items Review */}
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-borderMuted">
              <span className="w-7 h-7 rounded-full bg-navy text-golden font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-navy">
                Items in Order ({items.length})
              </h3>
            </div>

            <div className="divide-y divide-borderMuted">
              {items.map((item) => (
                <div key={item.book.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-12 h-16 object-cover rounded-lg border border-borderMuted bg-slate-50 flex-shrink-0"
                      onError={handleBookImageError}
                    />
                    <div>
                      <h4 className="font-bold text-navy text-xs sm:text-sm line-clamp-1">{item.book.title}</h4>
                      <p className="text-[11px] text-textSecondary">
                        Qty: {item.quantity} • {item.book.type === 'ebook' ? 'eBook' : 'Paperback'}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-navy">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Step 3: Payment Method */}
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-borderMuted">
              <span className="w-7 h-7 rounded-full bg-navy text-golden font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-navy">
                Payment Method
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-navy-subtle/80 border border-navy/20 flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-navy" />
              <div>
                <p className="text-xs font-bold text-navy">Razorpay Secure Payment Gateway</p>
                <p className="text-[11px] text-textSecondary">
                  Supports UPI, Google Pay, PhonePe, Debit/Credit Cards & NetBanking.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Sticky Order Total Summary (4 cols on lg) */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <Card className="p-6 sm:p-7 space-y-6">
            <h3 className="font-serif text-xl font-bold text-navy pb-3 border-b border-borderMuted">
              Payment Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-textSecondary">
                <span>Subtotal:</span>
                <span className="font-bold text-navy">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount ({appliedCoupon}):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-textSecondary">
                <span>Shipping:</span>
                <span className="font-bold text-navy">
                  {shipping === 0 ? <span className="text-emerald-600 font-black">FREE</span> : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between text-textSecondary">
                <span>GST Tax (5%):</span>
                <span className="font-bold text-navy">₹{tax}</span>
              </div>

              <div className="pt-4 border-t border-borderMuted flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-navy">Total Amount:</span>
                <span className="font-black text-2xl text-navy">₹{finalTotal}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-borderMuted">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
                Have a Promo Code?
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="COUPON"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-borderMuted rounded-xl text-xs bg-slate-50 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Apply
                </Button>
              </div>
            </form>

            {/* Pay Now Button */}
            <Button
              variant="gold"
              size="lg"
              className="w-full font-black shadow-md flex items-center justify-center space-x-2"
              isLoading={loading}
              onClick={handlePayNow}
            >
              <span>Pay ₹{finalTotal} via Razorpay</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-textSecondary">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Delivery Address Modal */}
      <Modal
        isOpen={showAddAddress}
        onClose={() => setShowAddAddress(false)}
        title="Add Delivery Address"
        description="Enter full street address for physical book delivery"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
          <Input
            label="Full Recipient Name"
            required
            value={newAddr.fullName}
            onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
            placeholder="e.g. Vikram Joshi"
          />

          <Input
            label="Mobile Number"
            type="tel"
            required
            value={newAddr.mobile}
            onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
            placeholder="10-digit mobile"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Flat / House / Building"
              required
              value={newAddr.house}
              onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })}
              placeholder="Flat 402, Sunshine Apts"
            />
            <Input
              label="Street / Area"
              required
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              placeholder="FC Road, Deccan"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              required
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              placeholder="Pune"
            />
            <Input
              label="State"
              required
              value={newAddr.state}
              onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
              placeholder="Maharashtra"
            />
            <Input
              label="Pincode"
              required
              value={newAddr.pincode}
              onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              placeholder="411004"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-borderMuted">
            <Button variant="ghost" type="button" onClick={() => setShowAddAddress(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
