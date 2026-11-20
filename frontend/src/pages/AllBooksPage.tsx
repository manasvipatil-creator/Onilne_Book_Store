import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';

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

  useEffect(() => {
    // Load categories for filter list
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

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="font-bold text-navy text-lg flex items-center space-x-2">
          <Filter className="w-5 h-5 text-golden" />
          <span>Filters</span>
        </h3>
        {(selectedCategory || selectedType || minPrice || maxPrice || search) && (
          <button
            onClick={clearFilters}
            className="text-xs text-golden font-semibold hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Product Type Filter */}
      <div>
        <h4 className="font-semibold text-navy text-sm mb-3">Product Format</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="type"
              checked={selectedType === ''}
              onChange={() => updateFilter('type', '')}
              className="text-navy focus:ring-navy"
            />
            <span>All Formats</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="type"
              checked={selectedType === 'physical'}
              onChange={() => updateFilter('type', 'physical')}
              className="text-navy focus:ring-navy"
            />
            <span>Physical Paperback</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="type"
              checked={selectedType === 'ebook'}
              onChange={() => updateFilter('type', 'ebook')}
              className="text-navy focus:ring-navy"
            />
            <span>Digital eBook</span>
          </label>
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="font-semibold text-navy text-sm mb-3">Categories</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ''}
              onChange={() => updateFilter('category', '')}
              className="text-navy focus:ring-navy"
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => updateFilter('category', cat.slug)}
                className="text-navy focus:ring-navy"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-semibold text-navy text-sm mb-3">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Mobile Filter Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">
            {selectedCategory ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Category'} Books` : 'All Books'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {books.length} {books.length === 1 ? 'book' : 'books'} found {search && `for "${search}"`}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sorting */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-surface text-navy focus:ring-2 focus:ring-navy focus:outline-none"
            >
              <option value="">Latest</option>
              <option value="popularity">Popularity / Bestseller</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-navy font-medium"
          >
            <SlidersHorizontal className="w-4 h-4 text-golden" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block md:col-span-1 bg-surface p-6 rounded-xl border border-gray-200 h-fit">
          <FilterSidebar />
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end md:hidden">
            <div className="w-80 bg-surface h-full p-6 overflow-y-auto">
              <div className="flex justify-end mb-4">
                <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                  <X className="w-6 h-6 text-navy" />
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Book Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse bg-gray-200 aspect-[3/4] rounded-xl"></div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-xl border border-gray-200 p-8">
              <p className="text-gray-500 text-lg font-medium">No books match your selected filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-light"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
