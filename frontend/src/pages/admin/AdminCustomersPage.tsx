import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, ShieldCheck, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCustomers = () => {
    setLoading(true);
    api
      .get('/admin/customers')
      .then((res) => {
        if (res.data.success) {
          setCustomers(res.data.data.customers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleActive = async (id: string, name: string) => {
    try {
      await api.patch(`/admin/customers/${id}/toggle-active`, {});
      toast.success(`Account state for "${name}" updated`);
      fetchCustomers();
    } catch (err: any) {
      toast.error('Failed to toggle customer active state');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
          Registered Readers
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
          Manage customer accounts, roles & access permissions
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-borderMuted shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-borderMuted text-navy font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Reader Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted/60">
              {customers.map((cust) => (
                <tr key={cust._id} className="hover:bg-navy/[0.015] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy font-serif font-bold flex items-center justify-center text-xs">
                        {cust.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-bold text-navy text-sm">{cust.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-textSecondary">{cust.email}</td>
                  <td className="py-3.5 px-4 font-mono text-textSecondary">{cust.mobile || '—'}</td>

                  <td className="py-3.5 px-4 text-textSecondary">
                    {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={cust.isActive ? 'success' : 'neutral'} size="sm">
                      {cust.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant={cust.isActive ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleActive(cust._id, cust.name)}
                      className={cust.isActive ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : ''}
                    >
                      {cust.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
