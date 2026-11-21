import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Download, Package, FileText, Sparkles, Check } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { Button, Card, Badge, Skeleton } from '../components/common';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`).then((res) => {
        if (res.data.success) {
          setOrder(res.data.data.order);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <Skeleton className="w-20 h-20 rounded-full mx-auto" />
        <Skeleton variant="text" className="w-1/2 h-8 mx-auto" />
        <Skeleton variant="text" className="w-1/3 h-4 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      {/* Success Animated Badge */}
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75 duration-300">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Payment Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-navy tracking-tight">
          Thank You for Your Order!
        </h1>
        <p className="text-textSecondary text-xs sm:text-sm max-w-md mx-auto">
          Your payment has been verified successfully via Razorpay. We have initiated the processing of your books.
        </p>
      </div>

      {order && (
        <Card className="p-6 sm:p-8 text-left space-y-6">
          <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-borderMuted gap-4">
            <div>
              <p className="text-[11px] text-textSecondary uppercase font-bold tracking-wider">Order Number</p>
              <p className="font-mono font-black text-navy text-base sm:text-lg">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-[11px] text-textSecondary uppercase font-bold tracking-wider">Payment Status</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {order.payment.status}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-textSecondary uppercase font-bold tracking-wider">Paid Amount</p>
              <p className="font-black text-navy text-base sm:text-lg">₹{order.pricing.finalTotal}</p>
            </div>
          </div>

          {/* Delivery & Digital Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {order.hasDigitalItems && (
              <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-sky-900 text-sm flex items-center">
                    <Download className="w-4 h-4 mr-1.5 text-sky-600" />
                    Digital eBooks Ready
                  </h4>
                  <p className="text-xs text-sky-800 leading-relaxed">
                    Your digital files are unlocked and available for immediate download in your account dashboard.
                  </p>
                </div>
                <Link
                  to="/account/ebooks"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 underline"
                >
                  <span>Go to My eBooks Library</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {order.hasPhysicalItems && (
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center">
                    <Package className="w-4 h-4 mr-1.5 text-amber-600" />
                    Physical Courier Dispatch
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Our warehouse team is preparing your package. Current status: <strong>{order.physicalStatus}</strong>
                  </p>
                </div>
                <Link
                  to="/account/orders"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 underline"
                >
                  <span>Track Courier Delivery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-borderMuted flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/books" className="text-xs font-bold text-navy hover:text-golden">
              ← Continue Shopping More Books
            </Link>
            <Link to="/account/orders">
              <Button variant="primary" size="sm">
                View Order Details
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
