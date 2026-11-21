import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle2, Search, Edit2, Package, Clock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  // Status update form modal
  const [physicalStatus, setPhysicalStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    api
      .get('/admin/orders')
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenStatusModal = (ord: any) => {
    setSelectedOrder(ord);
    setPhysicalStatus(ord.physicalStatus || 'Processing');
    setCourierName(ord.trackingInfo?.courierName || '');
    setTrackingNumber(ord.trackingInfo?.trackingNumber || '');
    setPaymentStatus(ord.payment?.status || 'Pending');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);

    try {
      await api.patch(`/admin/orders/${selectedOrder._id}/status`, {
        physicalStatus,
        courierName,
        trackingNumber,
        paymentStatus,
      });
      toast.success(`Order ${selectedOrder.orderNumber} status updated!`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
          Orders & Fulfillment
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
          Track shipments, courier tracking numbers & customer fulfillment access
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-borderMuted shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-borderMuted text-navy font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items / Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted/60">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-navy/[0.015] transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-bold text-navy text-sm">{ord.orderNumber}</p>
                    <p className="text-textSecondary text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-navy">{ord.userId?.name || 'Customer'}</p>
                    <p className="text-textSecondary text-[11px] font-mono">
                      {ord.userId?.mobile || 'No phone'}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-navy text-sm">
                      ₹{ord.pricing.finalTotal.toLocaleString('en-IN')}
                    </p>
                    <p className="text-textSecondary text-[11px]">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={ord.payment.status === 'Paid' ? 'success' : 'warning'} size="sm">
                      {ord.payment.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 space-y-1">
                    {ord.hasPhysicalItems && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-golden" />
                        <span className="font-semibold text-navy">
                          {ord.physicalStatus || 'Processing'}
                        </span>
                        {ord.trackingInfo?.trackingNumber && (
                          <span className="text-[10px] text-textSecondary font-mono">
                            ({ord.trackingInfo.courierName})
                          </span>
                        )}
                      </div>
                    )}
                    {ord.hasDigitalItems && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="font-semibold">eBook Access Granted</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenStatusModal(ord)}
                    >
                      Update Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order: ${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-textPrimary">Physical Delivery Status</label>
            <select
              value={physicalStatus}
              onChange={(e) => setPhysicalStatus(e.target.value)}
              className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              <option value="Processing">Processing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Courier Partner"
              placeholder="e.g. Delhivery, Blue Dart"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
            />
            <Input
              label="Tracking Number"
              placeholder="e.g. TRK9812739"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-textPrimary">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-borderMuted">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updating}
            >
              Apply Status Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
