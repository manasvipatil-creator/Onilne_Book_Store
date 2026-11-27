import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User as UserIcon,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
  Package,
  Download,
  MapPin,
  Sparkles,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { Category } from '../types';
import { getCategoryIcon } from './CategoryCard';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();
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

  useEffect(() => {
    if (totalItems > prevItemsRef.current) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(timer);
    }
    prevItemsRef.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* BOOKORA Signature Dark Navy Header */}
      <div
        className={`bg-navy text-white transition-all duration-300 border-b border-navy-light/40 ${
          scrolled ? 'shadow-xl py-2 sm:py-2.5' : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            {/* 1. Left: BOOKORA Brand Logo */}
            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group flex-shrink-0">
              <div className="relative flex items-center justify-center">
                {/* Official BOOKORA Emblem Logo */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface/10 border border-golden/30 flex items-center justify-center p-1 backdrop-blur-sm shadow-soft transition-transform duration-300 group-hover:scale-105">
                  <img
                    src="/bookora-logo.png"
                    alt="BOOKORA Logo"
                    className="w-full h-full object-contain filter drop-shadow"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl sm:text-2xl tracking-wider text-white leading-none">
                  BOOK<span className="text-golden">ORA</span>
                </span>
                <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase mt-0.5 hidden xs:inline">
                  Books • Ideas • A Better You
                </span>
              </div>
            </Link>

            {/* 2. Middle: Navigation Links matching reference (Home, Categories ⌵, Best Sellers, About, Contact) */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
              <Link
                to="/"
                className={`transition-colors py-1 hover:text-golden relative ${
                  location.pathname === '/' ? 'text-white font-bold' : ''
                }`}
              >
                <span>Home</span>
                {location.pathname === '/' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-golden rounded-full"></span>
                )}
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="flex items-center space-x-1.5 py-1 text-slate-200 hover:text-golden transition-colors focus:outline-none"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      categoriesDropdownOpen ? 'rotate-180 text-golden' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {categoriesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-3 w-64 bg-surface rounded-2xl shadow-elevated border border-borderMuted p-2.5 z-50 text-textPrimary"
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
                        <div className="h-px bg-borderMuted my-1.5" />
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

              <Link
                to="/books?sort=bestseller"
                className="hover:text-golden transition-colors py-1"
              >
                Best Sellers
              </Link>
              <Link
                to="/books"
                className="hover:text-golden transition-colors py-1"
              >
                All Books
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-golden/20 text-golden hover:bg-golden hover:text-navy font-bold text-xs transition-colors"
                >
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* 3. Right: Pill Search Bar & Profile/Cart Action Buttons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Rounded Pill Search Bar as seen in reference */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex relative items-center w-52 lg:w-64"
              >
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-9 py-1.5 sm:py-2 bg-white text-navy placeholder:text-slate-400 text-xs sm:text-sm rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-golden/60 transition-all shadow-xs"
                />
                <button
                  type="submit"
                  className="absolute right-3 text-slate-400 hover:text-golden transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* User Profile / Login Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                {user ? (
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none"
                    aria-label="Account Menu"
                  >
                    <UserIcon className="w-5 h-5 text-slate-200" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="Login"
                  >
                    <UserIcon className="w-5 h-5 text-slate-200" />
                  </Link>
                )}

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileDropdownOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-surface rounded-2xl shadow-elevated border border-borderMuted p-2 z-50 text-textPrimary"
                    >
                      <div className="p-3 border-b border-borderMuted bg-background/50 rounded-xl mb-1">
                        <p className="text-xs font-bold text-navy truncate">{user.name}</p>
                        <p className="text-[11px] text-textSecondary truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-golden/20 text-golden-dark uppercase">
                          {user.role}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to="/account/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-golden" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span>My Wishlist</span>
                          </div>
                          {totalWishlist > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600">
                              {totalWishlist}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/account/ebooks"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                        >
                          <Download className="w-4 h-4 text-golden" />
                          <span>My eBook Library</span>
                        </Link>
                        <Link
                          to="/account/addresses"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-textPrimary hover:bg-navy/5 hover:text-navy rounded-xl transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-golden" />
                          <span>Addresses</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-navy hover:bg-navy/10 rounded-xl transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-golden" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                        <div className="h-px bg-borderMuted my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist Heart Icon with Counter */}
              <Link
                to="/wishlist"
                className="relative p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label="Wishlist"
                title="My Wishlist"
              >
                <Heart className={`w-5 h-5 ${totalWishlist > 0 ? 'text-rose-400 fill-rose-400' : 'text-slate-200'}`} />
                {totalWishlist > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
                    {totalWishlist > 9 ? '9+' : totalWishlist}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Pill with Gold Count Badge */}
              <Link
                to="/cart"
                className={`relative p-2 sm:p-2.5 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center ${
                  cartAnimate ? 'scale-110' : ''
                }`}
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-slate-200" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-golden text-navy font-black text-[11px] flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-navy-dark text-white border-b border-navy-light/40 overflow-hidden shadow-2xl"
          >
            <div className="p-4 space-y-4">
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white text-navy placeholder:text-slate-400 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-golden"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-golden"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-col space-y-2 text-sm font-semibold">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-golden transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/books"
                  className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-golden transition-colors"
                >
                  All Books
                </Link>
                <Link
                  to="/books?sort=bestseller"
                  className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-golden transition-colors"
                >
                  Best Sellers
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-xl bg-golden/20 text-golden font-bold"
                  >
                    Admin Console
                  </Link>
                )}
                {user ? (
                  <>
                    <Link
                      to="/account/orders"
                      className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-golden transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/account/ebooks"
                      className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-golden transition-colors"
                    >
                      My eBooks
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 text-left text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                    >
                      Sign Out ({user.name})
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-xl bg-golden text-navy font-bold text-center"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
