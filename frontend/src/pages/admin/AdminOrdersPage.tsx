import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, Search, Edit2 } from 'lucide-react';
import api from '../../services/api';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Status update form modal
  const [physicalStatus, setPhysicalStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders').then((res) => {
      if (res.data.success) {
        setOrders(res.data.data.orders);
      }
      setLoading(false);
    });
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

    try {
      await api.patch(`/admin/orders/${selectedOrder._id}/status`, {
        physicalStatus,
        courierName,
        trackingNumber,
        paymentStatus,
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy">Order Management</h1>
        <p className="text-xs text-gray-500">Track shipments, update couriers & fulfill digital eBook access</p>
      </div>

      <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-navy font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Order ID & Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Fulfillment Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((ord) => (
              <tr key={ord._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className="font-bold text-navy font-mono">{ord.orderNumber}</p>
                  <p className="text-gray-400 text-[11px]">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-bold text-navy">{ord.userId?.name || 'Customer'}</p>
                  <p className="text-gray-500 text-[11px]">{ord.userId?.mobile || '-'}</p>
                </td>
                <td className="py-3 px-4 font-semibold text-navy">
                  ₹{ord.pricing.finalTotal} ({ord.items.length} items)
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.payment.status}
                  </span>
                </td>
                <td className="py-3 px-4 space-y-1">
                  {ord.hasPhysicalItems && (
                    <div className="text-[11px]">
                      <span className="text-gray-500">Physical:</span>{' '}
                      <span className="font-bold text-navy">{ord.physicalStatus || 'Processing'}</span>
                      {ord.trackingInfo?.trackingNumber && (
                        <p className="text-[10px] text-golden font-mono">
                          {ord.trackingInfo.courierName}: {ord.trackingInfo.trackingNumber}
                        </p>
                      )}
                    </div>
                  )}
                  {ord.hasDigitalItems && (
                    <div className="text-[11px] text-blue-700">
                      <span>eBook: </span>
                      <span className="font-bold">{ord.digitalStatus}</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleOpenStatusModal(ord)}
                    className="px-3 py-1 bg-navy text-white text-[11px] font-semibold rounded hover:bg-navy-light"
                  >
                    Manage Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-navy text-base">
              Update Status: <span className="font-mono text-golden">{selectedOrder.orderNumber}</span>
            </h3>
            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Physical Delivery Status</label>
                <select
                  value={physicalStatus}
                  onChange={(e) => setPhysicalStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Courier Partner</label>
                  <input
                    type="text"
                    placeholder="e.g. Blue Dart, Delhivery"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    placeholder="e.g. TRK9817293"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy text-white font-bold rounded-lg hover:bg-navy-light"
                >
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
