import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  ShoppingBag,
  Users,
  Ticket,
  Sliders,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Books Management', path: '/admin/books', icon: BookOpen },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders & Shipments', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons & Promos', path: '/admin/coupons', icon: Ticket },
    { label: 'Homepage Settings', path: '/admin/homepage', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-navy text-white flex-shrink-0 flex flex-col justify-between p-4 md:min-h-screen">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-navy-light">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-navy-light flex items-center justify-center text-golden font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-tight">Admin Console</h3>
                <p className="text-[10px] text-gray-400">Online Book Store</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-golden text-navy font-bold shadow-sm'
                      : 'text-gray-300 hover:bg-navy-light hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="pt-6 border-t border-navy-light space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-golden transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Customer Store</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
