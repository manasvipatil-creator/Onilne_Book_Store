import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Search, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';
import { BookCardSkeleton, Button, Card, EmptyState, Badge } from '../components/common';

export const AllBooksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter & query states
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedType = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedType ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (search ? 1 : 0);

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) setCategories(res.data.data.categories);
    });
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        const res = await api.get(`/books?${queryParams.toString()}`);
        if (res.data.success) {
          setBooks(res.data.data.books);
        }
      } catch (err) {
        console.error('Failed to fetch books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-borderMuted">
        <h3 className="font-serif font-bold text-navy text-lg flex items-center space-x-2">
          <Filter className="w-4 h-4 text-golden" />
          <span>Refine Titles</span>
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-golden hover:text-golden-dark font-bold hover:underline flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Format Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Format</h4>
        <div className="space-y-2">
          {[
            { id: '', label: 'All Formats' },
            { id: 'physical', label: 'Physical Paperback' },
            { id: 'ebook', label: 'Digital eBook' },
          ].map((item) => (
            <label
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${selectedType === item.id
                ? 'border-navy bg-navy-subtle text-navy'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <input
                  type="radio"
                  name="type"
                  checked={selectedType === item.id}
                  onChange={() => updateFilter('type', item.id)}
                  className="text-navy focus:ring-navy h-3.5 w-3.5"
                />
                <span>{item.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Genre / Category</h4>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <label
            className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${selectedCategory === ''
              ? 'bg-navy-subtle text-navy font-bold'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center space-x-2.5">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ''}
                onChange={() => updateFilter('category', '')}
                className="text-navy focus:ring-navy h-3.5 w-3.5"
              />
              <span>All Categories</span>
            </div>
          </label>
          {categories.map((c) => (
            <label
              key={c._id}
              className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${selectedCategory === c.slug
                ? 'bg-navy-subtle text-navy'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === c.slug}
                  onChange={() => updateFilter('category', c.slug)}
                  className="text-navy focus:ring-navy h-3.5 w-3.5"
                />
                <span className="truncate">{c.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-2 border-t border-borderMuted">
        <h4 className="text-xs font-bold uppercase tracking-wider text-navy">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-borderMuted">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-golden flex items-center space-x-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Library</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-navy tracking-tight">
            Explore All Books
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Browse our hand-picked selection of physical paperbacks and instant digital eBooks.
          </p>
        </div>

        {/* Live Metrics Pill */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-surface px-4 py-2 rounded-full border border-borderMuted shadow-xs">
          <span>Found</span>
          <span className="text-navy font-black">{books.length}</span>
          <span>titles</span>
        </div>
      </div>

      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden flex items-center space-x-2 px-4 py-2.5 rounded-full border border-borderMuted bg-surface text-navy font-bold text-xs shadow-xs w-full sm:w-auto justify-center"
        >
          <SlidersHorizontal className="w-4 h-4 text-golden" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-golden text-navy text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Search input in page */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search within books..."
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-full border border-borderMuted bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          {search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-textSecondary whitespace-nowrap">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-3.5 py-2 rounded-full border border-borderMuted bg-surface text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 cursor-pointer"
          >
            <option value="">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="latest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sticky Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-surface p-6 rounded-3xl border border-borderMuted shadow-sm sticky top-28">
          <FilterContent />
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xs bg-surface p-6 shadow-elevated flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-borderMuted mb-6">
                    <h3 className="font-serif font-bold text-lg text-navy">Filters</h3>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterContent />
                </div>
                <div className="pt-6 border-t border-borderMuted mt-6">
                  <Button variant="primary" className="w-full" onClick={() => setMobileFilterOpen(false)}>
                    Show {books.length} Results
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Book Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No books found"
              description="We couldn't find any books matching your current filter criteria. Try adjusting the format, price, or search keyword."
              actionText="Reset All Filters"
              onAction={clearFilters}
            />
          )}
        </main>
      </div>
    </div>
  );
};
