import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { stats, lowStockBooks, recentOrders, recentCustomers } = data || {
    stats: {},
    lowStockBooks: [],
    recentOrders: [],
    recentCustomers: [],
  };

  const statCards = [
    {
      label: 'Total Books',
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalSales || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      label: 'Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      label: 'Low Stock Alert',
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
            Real-time bookstore analytics, orders dispatch & inventory metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/books"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy text-white hover:bg-navy-light transition-colors shadow-soft"
          >
            Manage Catalog
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface border border-borderMuted text-navy hover:bg-navy/5 transition-colors"
          >
            View Shipments
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c, i) => (
          <div
            key={i}
            className={`bg-surface p-4 rounded-2xl border ${c.border} shadow-soft hover:shadow-elevated transition-shadow space-y-2`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
                <c.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                {c.label}
              </p>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-navy mt-0.5 truncate">
                {c.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockBooks?.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h3 className="font-serif font-bold text-sm sm:text-base">
                Low Inventory Alert: Action Recommended
              </h3>
            </div>
            <Link
              to="/admin/books"
              className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Restock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockBooks.map((b: any) => (
              <div
                key={b._id}
                className="bg-surface p-3.5 rounded-xl border border-amber-200/60 shadow-xs flex justify-between items-center text-xs"
              >
                <span className="font-semibold text-navy truncate pr-2">{b.title}</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-md whitespace-nowrap">
                  {b.physical?.stock || 0} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity: Orders & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-surface rounded-2xl border border-borderMuted p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
            <div>
              <h3 className="font-serif font-bold text-navy text-base">Recent Orders</h3>
              <p className="text-[11px] text-textSecondary">Latest sales needing processing & fulfillment</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-navy hover:text-golden flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-borderMuted/60">
            {recentOrders?.map((ord: any) => (
              <div
                key={ord._id}
                className="flex items-center justify-between text-xs py-3 first:pt-1 last:pb-1"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-mono font-bold text-navy">{ord.orderNumber}</p>
                  <p className="text-textSecondary truncate">
                    Customer: {ord.userId?.name || 'Guest User'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-navy">₹{ord.pricing.finalTotal}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.payment.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {ord.payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-surface rounded-2xl border border-borderMuted p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
            <div>
              <h3 className="font-serif font-bold text-navy text-base">New Customers</h3>
              <p className="text-[11px] text-textSecondary">Recently registered readers</p>
            </div>
            <Link
              to="/admin/customers"
              className="text-xs font-semibold text-navy hover:text-golden flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-borderMuted/60">
            {recentCustomers?.map((cust: any) => (
              <div
                key={cust._id}
                className="flex items-center justify-between text-xs py-3 first:pt-1 last:pb-1"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-bold text-navy truncate">{cust.name}</p>
                  <p className="text-textSecondary truncate">{cust.email}</p>
                </div>
                <span className="text-[11px] text-textSecondary font-medium flex-shrink-0">
                  {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
