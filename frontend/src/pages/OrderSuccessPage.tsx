import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Download, Package, FileText } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';

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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading order receipt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy">Thank You for Your Order!</h1>
        <p className="text-gray-500 text-sm">
          Payment received and verified successfully. We have dispatched confirmation details to your account.
        </p>
      </div>

      {order && (
        <div className="bg-surface rounded-2xl border border-gray-200 p-6 sm:p-8 text-left space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-gray-200 gap-2">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Order Number</p>
              <p className="font-bold text-navy font-mono text-base">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Payment Status</p>
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                {order.payment.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Paid Amount</p>
              <p className="font-bold text-navy text-base">₹{order.pricing.finalTotal}</p>
            </div>
          </div>

          {/* Fulfillment actions banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {order.hasDigitalItems && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm flex items-center">
                    <Download className="w-4 h-4 mr-1.5 text-blue-600" />
                    Digital eBooks Ready
                  </h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Your digital files are unlocked and available for instant download in your library.
                  </p>
                </div>
                <Link
                  to="/account/ebooks"
                  className="mt-3 inline-flex items-center space-x-1 text-xs font-bold text-blue-700 hover:underline"
                >
                  <span>Go to My eBooks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {order.hasPhysicalItems && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-amber-900 text-sm flex items-center">
                    <Package className="w-4 h-4 mr-1.5 text-amber-600" />
                    Physical Dispatch
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Fulfillment team is preparing your books. Status: <strong>{order.physicalStatus}</strong>
                  </p>
                </div>
                <Link
                  to="/account/orders"
                  className="mt-3 inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:underline"
                >
                  <span>Track Delivery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-4 justify-center">
            <Link
              to="/account/orders"
              className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light"
            >
              View Order History
            </Link>
            <Link
              to="/books"
              className="px-6 py-2.5 border border-gray-300 text-navy text-xs font-bold rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
