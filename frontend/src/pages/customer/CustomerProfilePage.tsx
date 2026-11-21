import React, { useState } from 'react';
import { User, Phone, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.patch('/auth/profile', { name, mobile });
      if (res.data.success) {
        updateUser(res.data.data.user);
        toast.success('Profile details updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-borderMuted p-6 sm:p-8 shadow-soft max-w-2xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-borderMuted">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy">
            Personal Profile
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Manage your personal reader credentials and contact details
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
          <User className="w-5 h-5 text-golden" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4 text-textSecondary" />}
        />

        <div className="space-y-1.5">
          <Input
            label="Email Address (Verified)"
            type="email"
            disabled
            value={user?.email || ''}
            leftIcon={<Mail className="w-4 h-4 text-textSecondary" />}
            helperText="Your email address is permanently tied to your purchase receipts and digital eBook downloads."
          />
        </div>

        <Input
          label="Mobile Number"
          type="tel"
          required
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          leftIcon={<Phone className="w-4 h-4 text-textSecondary" />}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full sm:w-auto"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
