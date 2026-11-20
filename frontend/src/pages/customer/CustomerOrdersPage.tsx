import React, { useEffect, useState } from 'react';
import { Package, Truck, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';
import { handleBookImageError } from '../../utils/imageFallbacks';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => {
      if (res.data.success) {
        setOrders(res.data.data.orders);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-gray-200 p-12 text-center space-y-3">
        <Package className="w-12 h-12 text-gray-400 mx-auto" />
        <h3 className="font-bold text-navy text-lg">No orders placed yet</h3>
        <p className="text-xs text-gray-500">When you buy physical books or digital eBooks, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-navy">Order History ({orders.length})</h2>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div key={ord._id} className="bg-surface rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-4">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-bold text-navy font-mono text-sm">{ord.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date Placed</p>
                <p className="font-medium text-navy text-sm">
                  {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    ord.payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ord.payment.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-bold text-navy text-sm">₹{ord.pricing.finalTotal}</p>
              </div>
            </div>

            {/* Status overview badges */}
            <div className="flex flex-wrap gap-3">
              {ord.hasPhysicalItems && (
                <div className="flex items-center space-x-1.5 text-xs bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                  <Truck className="w-3.5 h-3.5 text-navy" />
                  <span className="text-gray-600">Physical Fulfillment:</span>
                  <span className="font-bold text-navy">{ord.physicalStatus || 'Processing'}</span>
                  {ord.trackingInfo?.trackingNumber && (
                    <span className="text-golden font-mono">
                      ({ord.trackingInfo.courierName}: {ord.trackingInfo.trackingNumber})
                    </span>
                  )}
                </div>
              )}

              {ord.hasDigitalItems && (
                <div className="flex items-center space-x-1.5 text-xs bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-blue-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>eBook Delivery:</span>
                  <span className="font-bold">{ord.digitalStatus}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3 pt-2">
              {ord.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={item.coverImage} alt={item.title} className="w-10 h-14 object-cover rounded bg-gray-100" onError={handleBookImageError} />
                    <div>
                      <p className="font-bold text-navy">{item.title}</p>
                      <p className="text-gray-500">
                        {item.type === 'ebook' ? 'Digital eBook' : `Paperback (Qty: ${item.quantity})`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-navy">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            {/* Delivery address if physical */}
            {ord.shippingAddress && (
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-semibold text-navy">Delivering to:</span> {ord.shippingAddress.fullName},{' '}
                {ord.shippingAddress.house}, {ord.shippingAddress.street}, {ord.shippingAddress.city},{' '}
                {ord.shippingAddress.pincode}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
