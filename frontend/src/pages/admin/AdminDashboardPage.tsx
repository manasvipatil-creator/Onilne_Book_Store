import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => {
      if (res.data.success) {
        setData(res.data.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-gray-500 font-medium">Loading real-time store metrics...</div>;
  }

  const { stats, lowStockBooks, recentOrders, recentCustomers } = data;

  const statCards = [
    { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Sales', value: `₹${stats.totalSales}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Registered Customers', value: stats.totalCustomers, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Processing', value: stats.pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Low Stock Books', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy">Dashboard Overview</h1>
        <p className="text-xs text-gray-500 mt-1">Live database analytics & operational metrics</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className="bg-surface p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <h3 className="text-xl font-bold text-navy mt-0.5">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Warning Section */}
      {lowStockBooks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-bold text-sm">Low Stock Alert: Action Needed</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {lowStockBooks.map((b: any) => (
              <div key={b._id} className="bg-white p-3 rounded-lg border border-amber-200 text-xs flex justify-between items-center">
                <span className="font-semibold text-navy truncate pr-2">{b.title}</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                  Stock: {b.physical?.stock || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity: Orders & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-surface rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-navy text-base">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-navy hover:text-golden flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((ord: any) => (
              <div key={ord._id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-none">
                <div>
                  <p className="font-bold text-navy font-mono">{ord.orderNumber}</p>
                  <p className="text-gray-500">Customer: {ord.userId?.name || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-navy">₹{ord.pricing.finalTotal}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                    {ord.payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-surface rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-navy text-base">New Customers</h3>
            <Link to="/admin/customers" className="text-xs font-semibold text-navy hover:text-golden flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCustomers.map((cust: any) => (
              <div key={cust._id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-none">
                <div>
                  <p className="font-bold text-navy">{cust.name}</p>
                  <p className="text-gray-500">{cust.email}</p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(cust.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
