import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Books Management', path: '/admin/books', icon: BookOpen },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders & Shipments', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons & Promos', path: '/admin/coupons', icon: Ticket },
    { label: 'Homepage Settings', path: '/admin/homepage', icon: Sliders },
  ];

  const currentNav = navItems.find((n) =>
    n.end ? location.pathname === n.path : location.pathname.startsWith(n.path)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-navy text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-golden/20 border border-golden/30 flex items-center justify-center text-golden font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm tracking-tight text-white">Admin Console</h2>
            <p className="text-[10px] text-gray-400">Online Book Store</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#102A43] to-navy text-white flex-shrink-0 flex flex-col justify-between p-5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-golden/20 border border-golden/40 flex items-center justify-center text-golden font-bold shadow-soft group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                  Admin Console
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-golden text-navy font-bold font-sans">
                    PRO
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">Online Book Store Management</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Admin Pill */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-golden/20 text-golden font-bold flex items-center justify-center text-xs">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <div className="flex items-center gap-1 text-[10px] text-golden font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Management
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-golden text-navy font-bold shadow-soft'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-golden hover:bg-white/5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Customer Store</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/60 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-surface border-b border-borderMuted">
          <div className="flex items-center space-x-2 text-xs text-textSecondary">
            <span>Admin Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-navy">{currentNav?.label || 'Dashboard'}</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
            >
              <span>View Live Store</span>
              <ExternalLink className="w-3 h-3 text-golden" />
            </Link>
            <div className="h-4 w-px bg-borderMuted" />
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-textSecondary">System Operational</span>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
