import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  Download,
} from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';
import { handleBookImageError } from '../../utils/imageFallbacks';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-borderMuted p-8 sm:p-12 shadow-soft">
        <EmptyState
          icon={Package}
          title="No orders placed yet"
          description="Explore our literary collection and pick your favorite paperback or instant eBook to start your journey."
          actionLabel="Explore All Books"
          actionTo="/books"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy">
            Order History
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            {orders.length} order{orders.length > 1 ? 's' : ''} placed with real-time tracking and download links
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {orders.map((ord) => (
          <div
            key={ord._id}
            className="bg-surface rounded-2xl border border-borderMuted p-5 sm:p-6 shadow-soft hover:shadow-elevated transition-shadow duration-200 space-y-5"
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-borderMuted gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                  Order Number
                </span>
                <p className="font-mono font-bold text-navy text-sm sm:text-base">
                  {ord.orderNumber}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                  Date Placed
                </span>
                <p className="text-xs sm:text-sm font-medium text-navy">
                  {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                  Payment
                </span>
                <div>
                  <Badge variant={ord.payment.status === 'Paid' ? 'success' : 'warning'}>
                    {ord.payment.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                  Total Amount
                </span>
                <p className="text-base sm:text-lg font-bold text-navy">
                  ₹{ord.pricing.finalTotal.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Fulfillment Status Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {ord.hasPhysicalItems && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-navy/5 text-navy border border-navy/10">
                  <Truck className="w-3.5 h-3.5 text-golden" />
                  <span>Physical Shipment:</span>
                  <span className="font-bold">{ord.physicalStatus || 'Processing'}</span>
                  {ord.trackingInfo?.trackingNumber && (
                    <span className="font-mono text-golden ml-1 text-[11px]">
                      ({ord.trackingInfo.courierName}: {ord.trackingInfo.trackingNumber})
                    </span>
                  )}
                </div>
              )}

              {ord.hasDigitalItems && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>eBook Delivery:</span>
                  <span className="font-bold">{ord.digitalStatus || 'Active'}</span>
                  <Link
                    to="/account/ebooks"
                    className="underline text-emerald-700 hover:text-emerald-900 ml-1 font-bold inline-flex items-center gap-1"
                  >
                    <span>Open Library</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3 pt-1">
              {ord.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-borderMuted/60 hover:bg-background transition-colors gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-11 h-16 object-cover rounded-md shadow-sm bg-surface flex-shrink-0"
                      onError={handleBookImageError}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-navy text-xs sm:text-sm line-clamp-1">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={item.type === 'ebook' ? 'ebook' : 'paperback'}
                          size="sm"
                        >
                          {item.type === 'ebook' ? 'Digital eBook' : `Paperback × ${item.quantity}`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-navy text-xs sm:text-sm whitespace-nowrap">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery address footer */}
            {ord.shippingAddress && (
              <div className="pt-3 border-t border-borderMuted flex items-start gap-2 text-xs text-textSecondary">
                <MapPin className="w-4 h-4 text-golden flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-navy font-semibold">Delivered to:</strong>{' '}
                  {ord.shippingAddress.fullName}, {ord.shippingAddress.house},{' '}
                  {ord.shippingAddress.street}, {ord.shippingAddress.city},{' '}
                  {ord.shippingAddress.state} – {ord.shippingAddress.pincode}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
