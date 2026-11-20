import React, { useState } from 'react';
import { User, Phone, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await api.patch('/auth/profile', { name, mobile });
      if (res.data.success) {
        updateUser(res.data.data.user);
        setSuccess(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-gray-200 p-8 shadow-sm max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Personal Profile</h2>
        <p className="text-xs text-gray-500 mt-0.5">Update your personal contact details</p>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-navy uppercase mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy uppercase mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <span className="text-[10px] text-gray-400">Email cannot be changed directly for security.</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy uppercase mb-1">Mobile Number</label>
          <div className="relative">
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
