import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, Home, Building2 } from 'lucide-react';
import api from '../../services/api';
import { Address } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const CustomerAddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  const fetchAddresses = () => {
    setLoading(true);
    api
      .get('/addresses')
      .then((res) => {
        if (res.data.success) {
          setAddresses(res.data.data.addresses);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      fullName: '',
      mobile: '',
      house: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditId(addr._id);
    setForm({
      fullName: addr.fullName,
      mobile: addr.mobile,
      house: addr.house,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/addresses/${editId}`, form);
        toast.success('Address updated successfully');
      } else {
        await api.post('/addresses', form);
        toast.success('New delivery address added');
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.info('Address removed');
      fetchAddresses();
    } catch (err: any) {
      toast.error('Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy">
            Saved Delivery Addresses
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Manage your physical delivery locations for books & orders
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 self-start sm:self-auto"
          onClick={handleOpenAdd}
        >
          <Plus className="w-4 h-4 text-golden" />
          <span>Add New Address</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`bg-surface rounded-2xl border p-5 sm:p-6 shadow-soft flex flex-col justify-between space-y-4 relative transition-all ${
              addr.isDefault
                ? 'border-navy/30 ring-1 ring-navy/10'
                : 'border-borderMuted'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-navy text-base">
                  {addr.fullName}
                </span>
                {addr.isDefault && (
                  <Badge variant="success" size="sm">
                    Default Address
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                {addr.house}, {addr.street}
              </p>
              <p className="text-xs sm:text-sm text-textSecondary font-medium">
                {addr.city}, {addr.state} – <strong className="text-navy">{addr.pincode}</strong>
              </p>
              <p className="text-xs text-textSecondary font-semibold mt-3">
                Phone: <span className="text-navy font-mono">{addr.mobile}</span>
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-borderMuted">
              <button
                onClick={() => handleOpenEdit(addr)}
                className="text-xs text-navy hover:text-golden font-semibold flex items-center space-x-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Delivery Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Input
              label="Mobile Number"
              placeholder="10-digit number"
              type="tel"
              required
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />
          </div>

          <Input
            label="House / Flat / Building No."
            placeholder="Flat 402, Sunshine Apartments"
            required
            value={form.house}
            onChange={(e) => setForm({ ...form, house: e.target.value })}
          />

          <Input
            label="Street / Landmark / Area"
            placeholder="Near MG Road Central Library"
            required
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City"
              placeholder="City"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State"
              placeholder="State"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <Input
              label="PIN Code"
              placeholder="PIN"
              required
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
          </div>

          <label className="flex items-center space-x-2.5 text-xs text-textSecondary cursor-pointer pt-2 select-none">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded text-navy focus:ring-navy w-4 h-4 cursor-pointer"
            />
            <span className="font-medium text-navy">Make this my default shipping address</span>
          </label>

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
              {editId ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
