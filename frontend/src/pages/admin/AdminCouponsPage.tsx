import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Ticket, Percent, IndianRupee, Calendar } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{ id: string; code: string } | null>(null);
  const toast = useToast();

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
    api
      .get('/admin/coupons')
      .then((res) => {
        if (res.data.success) {
          setCoupons(res.data.data.coupons);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/coupons', form);
      toast.success(`Coupon code ${form.code} created!`);
      setShowModal(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, code: string) => {
    setCouponToDelete({ id, code });
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await api.delete(`/admin/coupons/${couponToDelete.id}`);
      toast.info(`Coupon ${couponToDelete.code} removed`);
      fetchCoupons();
    } catch (err: any) {
      toast.error('Failed to delete coupon');
    } finally {
      setCouponToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
            Promotional Coupons
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
            Configure checkout discount codes & percentage savings
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-navy text-white hover:bg-navy-light shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] self-start sm:self-auto group"
        >
          <span className="w-5 h-5 rounded-lg bg-golden/20 flex items-center justify-center text-golden group-hover:bg-golden group-hover:text-navy transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </span>
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-borderMuted shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-borderMuted text-navy font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min Order</th>
                <th className="py-3.5 px-4">Expires On</th>
                <th className="py-3.5 px-4">Usage Stats</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted/60">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-navy/[0.015] transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-navy text-sm bg-navy/5 px-2 py-1 rounded-md border border-navy/10">
                      {c.code}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : `₹${c.discountValue} FLAT`}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-textSecondary">
                    ₹{c.minimumOrder}
                  </td>

                  <td className="py-3.5 px-4 text-textSecondary">
                    {new Date(c.expiryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-navy">
                    {c.timesUsed} / {c.usageLimit}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={c.isActive ? 'success' : 'neutral'} size="sm">
                      {c.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(c._id, c.code)}
                      className="p-1.5 text-textSecondary hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Promo Coupon"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Coupon Code"
            required
            placeholder="e.g. FESTIVE20"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-textPrimary">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <Input
              label="Discount Value"
              type="number"
              required
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum Order (₹)"
              type="number"
              value={form.minimumOrder}
              onChange={(e) => setForm({ ...form, minimumOrder: Number(e.target.value) })}
            />
            <Input
              label="Usage Limit"
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Expiry Date"
            type="date"
            required
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-borderMuted">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
            >
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon?"
        message={`Are you sure you want to delete promo coupon "${couponToDelete?.code}"? Users will no longer be able to use it at checkout.`}
        confirmText="Delete Coupon"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
