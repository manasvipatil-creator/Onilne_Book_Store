import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Headphones,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { Category } from '../types';
import { getCategoryIcon } from './CategoryCard';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);
  const prevItemsRef = useRef(totalItems);

  const navigate = useNavigate();
  const location = useLocation();

  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Animate cart on item count change
  useEffect(() => {
    if (totalItems > prevItemsRef.current) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(timer);
    }
    prevItemsRef.current = totalItems;
  }, [totalItems]);

  // Scroll listener for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories for dropdown
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        if (res.data?.success && res.data.data?.categories) {
          setCategories(res.data.data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoriesDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
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

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-navy-dark text-white text-[11px] sm:text-xs py-2 px-4 border-b border-navy-light/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-golden flex-shrink-0" />
            <span className="italic font-medium">“A reader lives a thousand lives before he dies.”</span>
            <span className="text-slate-400 hidden md:inline">— Make time to read every day</span>
          </div>
          <div className="hidden sm:flex items-center space-x-5 text-slate-300 font-medium">
            <Link to="/account" className="hover:text-golden transition-colors">
              Track Your Order
            </Link>
            <span className="text-slate-600">|</span>
            <span className="flex items-center space-x-1.5 hover:text-golden transition-colors cursor-pointer">
              <Headphones className="w-3.5 h-3.5 text-golden" />
              <span>24/7 Support</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Navbar with dynamic scroll shadow */}
      <div
        className={`bg-surface/95 backdrop-blur-md border-b border-borderMuted transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-navy group-hover:bg-navy-light flex items-center justify-center text-golden transition-all duration-300 shadow-sm group-hover:scale-105">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-2xl tracking-tight text-navy leading-none">
                  Book<span className="text-golden">Store</span>
                </span>
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mt-1">
                  Read • Learn • Grow
                </span>
              </div>
            </Link>

            {/* Desktop Global Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search by title, author, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-borderMuted rounded-2xl text-xs sm:text-sm text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all duration-200"
                />
                <Search className="w-4 h-4 text-textSecondary absolute left-3.5 top-3.5 pointer-events-none" />
              </form>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-textPrimary">
              <Link to="/" className="hover:text-golden transition-colors py-2">
                Home
              </Link>
              <Link to="/books" className="hover:text-golden transition-colors py-2">
                All Books
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="flex items-center space-x-1 hover:text-golden transition-colors py-2 focus:outline-none"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      categoriesDropdownOpen ? 'rotate-180 text-golden' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {categoriesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-surface rounded-2xl shadow-elevated border border-borderMuted p-2 z-50"
                    >
                      <div className="py-1">
                        <Link
                          to="/books"
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-navy hover:bg-navy/5 hover:text-golden rounded-xl transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-golden" />
                          <span>All Categories</span>
                        </Link>
                        <div className="h-px bg-borderMuted my-1" />
                        {categories.map((cat) => {
                          const IconComp = getCategoryIcon(cat.slug || cat.name);
                          return (
                            <Link
                              key={cat._id}
                              to={`/categories/${cat.slug || cat._id}`}
                              onClick={() => setCategoriesDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                            >
                              <IconComp className="w-3.5 h-3.5 text-golden" />
                              <span className="truncate">{cat.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin Panel Link ONLY when user role === "admin" */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-navy/10 text-navy hover:bg-navy hover:text-white font-bold text-xs transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-golden" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Right Action Icons: Cart & Customer Profile */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Shopping Cart Icon with animated badge */}
              <Link
                to="/cart"
                className="relative p-2.5 text-navy hover:text-golden bg-navy/5 hover:bg-navy/10 rounded-2xl transition-colors"
                aria-label="View Shopping Cart"
              >
                <motion.div
                  animate={cartAnimate ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.div>

                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-golden text-navy font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-soft border-2 border-surface"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Link>

              {/* Customer Profile Icon with Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-2 rounded-2xl bg-navy/5 hover:bg-navy/10 text-navy transition-colors focus:outline-none"
                  aria-label="Account Menu"
                >
                  <div className="w-7 h-7 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-xs">
                    {user ? (
                      user.name ? (
                        user.name[0].toUpperCase()
                      ) : (
                        'U'
                      )
                    ) : (
                      <UserIcon className="w-4 h-4 text-golden" />
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-textSecondary transition-transform duration-200 hidden sm:block ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl shadow-elevated border border-borderMuted p-2 z-50"
                    >
                      {user ? (
                        <div>
                          <div className="px-3 py-2 border-b border-borderMuted">
                            <p className="text-xs font-bold text-navy truncate">{user.name}</p>
                            <p className="text-[10px] text-textSecondary truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              to="/account"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                            >
                              <Package className="w-3.5 h-3.5 text-golden" />
                              <span>My Orders & Tracking</span>
                            </Link>
                            <Link
                              to="/account/ebooks"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-golden" />
                              <span>My eBooks & Downloads</span>
                            </Link>
                            <Link
                              to="/account/addresses"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5 text-golden" />
                              <span>Delivery Addresses</span>
                            </Link>
                            <Link
                              to="/account/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                            >
                              <UserIcon className="w-3.5 h-3.5 text-golden" />
                              <span>Profile Details</span>
                            </Link>
                            {isAdmin && (
                              <Link
                                to="/admin"
                                onClick={() => setProfileDropdownOpen(false)}
                                className="flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-golden hover:bg-navy/5 rounded-xl transition-colors"
                              >
                                <LayoutDashboard className="w-3.5 h-3.5 text-golden" />
                                <span>Admin Console</span>
                              </Link>
                            )}
                          </div>
                          <div className="pt-1 border-t border-borderMuted">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-1">
                          <Link
                            to="/login"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                          >
                            <LogIn className="w-3.5 h-3.5 text-golden" />
                            <span>Sign In</span>
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-golden" />
                            <span>Register Account</span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-2xl bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation with Framer Motion slide-in */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-navy-dark/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-surface shadow-2xl z-50 flex flex-col p-6 overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-borderMuted">
                <span className="font-serif font-black text-xl text-navy">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-xl text-textSecondary hover:text-navy"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-borderMuted rounded-xl text-xs text-textPrimary placeholder:text-textSecondary focus:outline-none"
                />
                <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
              </form>

              {/* Links */}
              <div className="flex flex-col space-y-3 mt-6 text-sm font-semibold text-textPrimary">
                <Link to="/" className="hover:text-golden py-1">
                  Home
                </Link>
                <Link to="/books" className="hover:text-golden py-1">
                  All Books
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-golden font-bold py-1 flex items-center space-x-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="h-px bg-borderMuted my-2" />
                <span className="text-xs uppercase font-bold text-textSecondary tracking-wider">
                  Top Genres
                </span>
                <div className="space-y-2 pl-2">
                  {categories.slice(0, 6).map((c) => (
                    <Link
                      key={c._id}
                      to={`/categories/${c.slug || c._id}`}
                      className="block text-xs text-textSecondary hover:text-navy"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
