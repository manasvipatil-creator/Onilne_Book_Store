import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Download,
  MapPin,
  LogOut,
  ChevronRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccountLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'My Orders & Tracking', path: '/account', icon: ShoppingBag, end: true, badge: null },
    { label: 'My Digital eBooks', path: '/account/ebooks', icon: Download, badge: 'Instant' },
    { label: 'Delivery Addresses', path: '/account/addresses', icon: MapPin, badge: null },
    { label: 'Personal Profile', path: '/account/profile', icon: User, badge: null },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-textSecondary mb-6">
          <Link to="/" className="hover:text-navy transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-navy font-semibold">My Account</span>
        </nav>

        {/* User Welcome Banner */}
        <div className="bg-surface rounded-2xl border border-borderMuted p-6 sm:p-8 mb-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-navy to-navy-light text-white flex items-center justify-center text-xl sm:text-2xl font-serif font-bold shadow-md">
              {getInitials(user?.name)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
                  {user?.name || 'Customer'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-golden/10 text-golden border border-golden/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Reader
                </span>
              </div>
              <p className="text-sm text-textSecondary mt-1">
                {user?.email} • {user?.mobile || 'No phone set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/books"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-golden" />
              <span>Browse Books</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Nav & Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="bg-surface rounded-2xl border border-borderMuted p-3 sm:p-4 shadow-soft lg:sticky lg:top-28">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-textSecondary">
              Account Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-navy text-white shadow-soft font-bold'
                        : 'text-textSecondary hover:bg-navy/5 hover:text-navy'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-golden/20 text-golden">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-borderMuted">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Content Outlet */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
