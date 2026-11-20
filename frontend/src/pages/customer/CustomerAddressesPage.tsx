import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Address } from '../../types';

export const CustomerAddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);

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
    api.get('/addresses').then((res) => {
      if (res.data.success) {
        setAddresses(res.data.data.addresses);
      }
      setLoading(false);
    });
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
    try {
      if (editId) {
        await api.patch(`/addresses/${editId}`, form);
      } else {
        await api.post('/addresses', form);
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving address');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch (err: any) {
      alert('Failed to delete address');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading addresses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Delivery Addresses ({addresses.length})</h2>
          <p className="text-xs text-gray-500">Manage saved shipping locations for physical book orders</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-golden" />
          <span>Add Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className="bg-surface rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between space-y-4 relative"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-navy text-base">{addr.fullName}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Default
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {addr.house}, {addr.street}
              </p>
              <p className="text-xs text-gray-600">
                {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
              </p>
              <p className="text-xs text-gray-500 font-medium mt-2">Mobile: {addr.mobile}</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleOpenEdit(addr)}
                className="text-xs text-navy hover:text-golden font-semibold flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-navy text-lg">{editId ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="House / Flat / Building No."
                required
                value={form.house}
                onChange={(e) => setForm({ ...form, house: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="Street / Area / Landmark"
                required
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  required
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded text-navy focus:ring-navy"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
    </div>
  );
};
