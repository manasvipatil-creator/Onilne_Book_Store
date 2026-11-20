import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    api.get('/admin/customers').then((res) => {
      if (res.data.success) {
        setCustomers(res.data.data.customers);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleActive = async (id: string) => {
    try {
      await api.patch(`/admin/customers/${id}/toggle-active`, {});
      fetchCustomers();
    } catch (err: any) {
      alert('Failed to toggle customer active state');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy">Customer Accounts</h1>
        <p className="text-xs text-gray-500">Manage registered readers and account security</p>
      </div>

      <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-navy font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Mobile</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((cust) => (
              <tr key={cust._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-navy">{cust.name}</td>
                <td className="py-3 px-4 text-gray-600">{cust.email}</td>
                <td className="py-3 px-4 text-gray-600">{cust.mobile}</td>
                <td className="py-3 px-4 text-gray-400">
                  {new Date(cust.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cust.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cust.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleActive(cust._id)}
                    className={`px-3 py-1 rounded text-[11px] font-semibold ${
                      cust.isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {cust.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
