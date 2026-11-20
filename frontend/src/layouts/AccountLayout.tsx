import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Download,
  MapPin,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccountLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'My Orders & Tracking', path: '/account', icon: ShoppingBag, end: true },
    { label: 'My eBooks & Downloads', path: '/account/ebooks', icon: Download },
    { label: 'Saved Addresses', path: '/account/addresses', icon: MapPin },
    { label: 'Profile Details', path: '/account/profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-navy">Customer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, <span className="font-semibold text-navy">{user?.name}</span> ({user?.email})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Account Sidebar Navigation */}
        <aside className="bg-surface rounded-2xl border border-gray-200 p-4 space-y-1 shadow-sm md:sticky md:top-28">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                }`
              }
            >
              <item.icon className="w-4 h-4 text-golden" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Outlet */}
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
