import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Ticket } from 'lucide-react';
import api from '../../services/api';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 299,
    expiryDate: '2028-12-31',
    usageLimit: 100,
    isActive: true,
  });

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/admin/coupons').then((res) => {
      if (res.data.success) {
        setCoupons(res.data.data.coupons);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', form);
      setShowModal(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete coupon code?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      fetchCoupons();
    } catch (err: any) {
      alert('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-navy">Coupon Management</h1>
          <p className="text-xs text-gray-500">Configure promotional discounts and checkout coupons</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-golden" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-navy font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Min Order</th>
              <th className="py-3 px-4">Expires On</th>
              <th className="py-3 px-4">Times Used</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono font-bold text-navy text-sm">{c.code}</td>
                <td className="py-3 px-4 font-semibold text-green-700">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                </td>
                <td className="py-3 px-4 font-medium text-gray-600">₹{c.minimumOrder}</td>
                <td className="py-3 px-4 text-gray-500">
                  {new Date(c.expiryDate).toLocaleDateString('en-IN')}
                </td>
                <td className="py-3 px-4 font-medium text-navy">
                  {c.timesUsed} / {c.usageLimit}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(c._id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-navy text-lg">Create New Promo Coupon</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={form.minimumOrder}
                    onChange={(e) => setForm({ ...form, minimumOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy text-white font-bold rounded-lg hover:bg-navy-light"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
