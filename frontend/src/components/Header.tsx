import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ShoppingCart,
  User as UserIcon,
  Search,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  LogIn,
  UserPlus,
  Package,
  Download,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { Category } from '../types';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.data.categories);
      }
    });
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoriesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-surface shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-navy font-bold text-2xl tracking-tight group">
            <div className="w-10 h-10 rounded-xl bg-navy group-hover:bg-navy-light flex items-center justify-center text-golden transition-colors shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none">Online Book Store</span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Read • Learn • Grow</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </form>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-textPrimary hover:text-golden font-medium text-sm transition-colors">
              Home
            </Link>
            <Link to="/books" className="text-textPrimary hover:text-golden font-medium text-sm transition-colors">
              All Books
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesDropdownRef}>
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center space-x-1 text-textPrimary hover:text-golden font-medium text-sm transition-colors py-2"
                aria-expanded={categoriesDropdownOpen}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180 text-golden' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-60 bg-surface rounded-2xl shadow-xl border border-gray-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Browse by Genre</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {categories.map((c) => (
                      <Link
                        key={c._id}
                        to={`/category/${c.slug}`}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-navy hover:bg-gray-50 hover:text-golden transition-colors"
                      >
                        <span>{c.name}</span>
                        <span className="text-gray-300">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Professional Shopping Cart Icon with Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 text-navy hover:text-golden transition-all rounded-xl hover:bg-gray-100 flex items-center justify-center group"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-navy group-hover:text-golden group-hover:scale-105 transition-all" strokeWidth={2.2} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-golden text-navy font-black text-[11px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md border-2 border-surface animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Admin Panel Quick Link (Only when logged in as Admin) */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-colors shadow-sm"
                title="Go to Admin Panel"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-golden" />
                <span>Admin</span>
              </Link>
            )}

            {/* Customer Profile Icon with Dropdown Menu */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full border transition-all ${
                  profileDropdownOpen
                    ? 'border-navy bg-gray-50 ring-2 ring-navy/10'
                    : 'border-gray-200 hover:border-navy hover:bg-gray-50'
                }`}
                aria-label="Customer Profile Menu"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-7 h-7 rounded-full bg-navy text-golden flex items-center justify-center font-bold text-xs shadow-sm">
                  {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4 text-golden" />}
                </div>
                <span className="text-xs font-semibold text-navy max-w-[100px] truncate hidden lg:inline">
                  {user ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-navy' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {user ? (
                    // Customer Logged In Menu
                    <>
                      {/* Customer Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 rounded-t-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-navy text-golden font-bold text-sm flex items-center justify-center shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-navy truncate">{user.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-golden/20 text-navy border border-golden/30">
                              {user.role === 'admin' ? 'Administrator' : 'Customer'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Logged In Navigation Links */}
                      <div className="py-2 space-y-0.5">
                        <Link
                          to="/account/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gray-50 hover:text-golden transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-navy" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/account/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gray-50 hover:text-golden transition-colors"
                        >
                          <Package className="w-4 h-4 text-navy" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/account/ebooks"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gray-50 hover:text-golden transition-colors"
                        >
                          <Download className="w-4 h-4 text-navy" />
                          <span>My eBooks</span>
                        </Link>

                        <Link
                          to="/account/addresses"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gray-50 hover:text-golden transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-navy" />
                          <span>My Addresses</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-golden hover:bg-navy hover:text-white transition-colors border-t border-gray-100"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout Action */}
                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Customer Logged Out Menu
                    <>
                      {/* Guest Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 rounded-t-xl">
                        <p className="text-xs font-bold text-navy">Welcome, Reader</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Sign in to manage orders, addresses & eBooks
                        </p>
                      </div>

                      {/* Logged Out Actions */}
                      <div className="py-2 space-y-1">
                        <Link
                          to="/login"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs font-bold text-white bg-navy hover:bg-navy-light mx-3 rounded-lg transition-colors justify-center shadow-sm"
                        >
                          <LogIn className="w-4 h-4 text-golden" />
                          <span>Sign In</span>
                        </Link>

                        <Link
                          to="/register"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-navy hover:bg-gray-50 hover:text-golden transition-colors mx-3 rounded-lg justify-center border border-gray-200 mt-1"
                        >
                          <UserPlus className="w-4 h-4 text-gray-600" />
                          <span>Register</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Actions: Cart & Hamburger */}
          <div className="flex items-center md:hidden space-x-2">
            <Link to="/cart" className="relative p-2 text-navy" title="Shopping Cart">
              <ShoppingCart className="w-5 h-5 text-navy" strokeWidth={2.2} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-golden text-navy font-bold text-xs min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-navy focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-150">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </form>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-navy font-semibold text-sm hover:bg-gray-50"
              >
                Home
              </Link>
              <Link
                to="/books"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-navy font-semibold text-sm hover:bg-gray-50"
              >
                All Books
              </Link>

              {/* Customer Account Section in Mobile */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Customer Account
                </p>

                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
                      <p className="text-xs font-bold text-navy truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/account/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg text-navy text-xs font-semibold hover:bg-gray-50"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/account/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg text-navy text-xs font-semibold hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/account/ebooks"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg text-navy text-xs font-semibold hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>My eBooks</span>
                    </Link>

                    <Link
                      to="/account/addresses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg text-navy text-xs font-semibold hover:bg-gray-50"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>My Addresses</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 py-2 px-3 rounded-lg text-golden font-bold text-xs hover:bg-navy-light"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 py-2 px-3 rounded-lg text-red-600 text-xs font-semibold hover:bg-red-50 text-left mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center bg-navy text-white font-bold rounded-lg text-xs shadow-sm flex items-center justify-center space-x-1"
                    >
                      <LogIn className="w-3.5 h-3.5 text-golden" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center border border-gray-300 text-navy font-bold rounded-lg text-xs hover:bg-gray-50 flex items-center justify-center space-x-1"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-gray-600" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
