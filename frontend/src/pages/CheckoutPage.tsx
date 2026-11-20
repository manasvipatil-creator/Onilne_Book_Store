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
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Address } from '../types';
import { handleBookImageError } from '../utils/imageFallbacks';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, fetchCart } = useCart();
  const { user } = useAuth();
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

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setAppliedCoupon('WELCOME10');
    } else if (couponCode.toUpperCase() === 'READMORE') {
      if (subtotal < 699) {
        setCouponError('Minimum order amount for READMORE is ₹699');
        return;
      }
      setDiscountAmount(100);
      setAppliedCoupon('READMORE');
    } else {
      setCouponError('Invalid coupon code');
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
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePayNow = async () => {
    setError('');

    if (hasPhysical && !selectedAddressId) {
      setError('Please select or add a delivery address for physical items.');
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

      // Check if standard Razorpay checkout modal is active
      if (window.Razorpay && !isSimulated && keyId && !keyId.includes('placeholder')) {
        const options = {
          key: keyId,
          amount: amount,
          currency: 'INR',
          name: 'Online Book Store',
          description: `Order ${orderNumber}`,
          order_id: razorpayOrderId,
          handler: async (response: any) => {
            try {
              // Server-side payment verification
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
              alert(verErr.response?.data?.message || 'Payment verification failed.');
            }
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
        rzp.open();
      } else {
        // High-fidelity development test mode verification
        const simPaymentId = `pay_sim_${Date.now()}`;
        const simSignature = `sim_sig_${razorpayOrderId}`;

        const verifyRes = await api.post('/payments/verify', {
          orderId,
          razorpayOrderId,
          razorpayPaymentId: simPaymentId,
          razorpaySignature: simSignature,
        });

        if (verifyRes.data.success) {
          await fetchCart();
          navigate(`/order-success/${orderId}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Checkout failed');
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
      <div>
        <h1 className="text-3xl font-extrabold text-navy">Complete Your Order</h1>
        <p className="text-sm text-gray-500 mt-1">Review items, delivery details, and payment</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Delivery Address (Physical Books Only) */}
          {hasPhysical ? (
            <div className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-bold text-navy text-base flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-golden" />
                  <span>Delivery Address (Required for Physical Books)</span>
                </h3>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="text-xs font-bold text-navy hover:text-golden flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No address found on your account.</p>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg"
                  >
                    Add Delivery Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedAddressId === addr._id
                          ? 'border-navy bg-navy bg-opacity-5 ring-2 ring-navy'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <input
                            type="radio"
                            name="addressSelect"
                            checked={selectedAddressId === addr._id}
                            onChange={() => setSelectedAddressId(addr._id)}
                            className="text-navy focus:ring-navy"
                          />
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-navy">{addr.fullName}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {addr.house}, {addr.street}
                        </p>
                        <p className="text-xs text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Mob: {addr.mobile}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-blue-900 space-y-1">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Download className="w-5 h-5 text-blue-600" />
                <span>Pure Digital Order</span>
              </h3>
              <p className="text-xs text-blue-800">
                Your cart contains digital eBooks only. No physical shipping address is required. Files will be unlocked immediately in your account.
              </p>
            </div>
          )}

          {/* New Address Modal Popup */}
          {showAddAddress && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-surface rounded-2xl p-6 max-w-lg w-full space-y-4">
                <h3 className="font-bold text-navy text-lg">Add New Delivery Address</h3>
                <form onSubmit={handleSaveAddress} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      required
                      value={newAddr.mobile}
                      onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="House / Flat / Building No."
                    required
                    value={newAddr.house}
                    onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Street / Area / Landmark"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="PIN Code"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-navy text-white rounded-lg text-xs font-semibold hover:bg-navy-light"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Section 2: Order Items Snapshot */}
          <div className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-navy text-base pb-3 border-b border-gray-200">
              Purchased Items ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.book.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
                  <div className="flex items-center space-x-3">
                    <img src={i.book.coverImage} alt={i.book.title} className="w-12 h-16 object-cover rounded bg-gray-100" onError={handleBookImageError} />
                    <div>
                      <h4 className="font-bold text-navy text-sm">{i.book.title}</h4>
                      <p className="text-xs text-gray-500">
                        {i.book.type === 'ebook' ? 'eBook (Instant Download)' : `Paperback x ${i.quantity}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-navy text-sm">₹{i.subtotal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Payment Summary */}
        <div className="bg-surface p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="font-bold text-navy text-lg pb-3 border-b border-gray-200">Payment Breakdown</h3>

          {/* Coupon Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase">Apply Promo Coupon</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Try READMORE or WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-golden text-navy text-xs font-bold rounded-lg hover:bg-golden-light"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-xs text-green-700 font-semibold flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Coupon {appliedCoupon} applied (-₹{discountAmount})
              </p>
            )}
          </div>

          {/* Breakdown numbers */}
          <div className="space-y-3 text-sm pt-3 border-t border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Items Total</span>
              <span className="font-medium text-navy">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Coupon Discount</span>
                <span className="font-semibold">-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee</span>
              <span className="font-medium text-navy">
                {shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (5%)</span>
              <span className="font-medium text-navy">₹{tax}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-extrabold text-navy">
              <span>Payable Amount</span>
              <span className="text-2xl text-navy">₹{finalTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePayNow}
            disabled={loading}
            className="w-full py-4 bg-navy text-white font-bold rounded-lg hover:bg-navy-light transition-all text-sm flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4 text-golden" />
            <span>{loading ? 'Processing Payment...' : `Pay ₹${finalTotal} with Razorpay`}</span>
          </button>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>256-Bit SSL Secured Razorpay Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
