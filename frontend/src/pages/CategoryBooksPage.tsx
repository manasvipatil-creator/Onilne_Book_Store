import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowLeft, BookOpen } from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';

export const CategoryBooksPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState<Category | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const selectedType = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const fetchCategoryAndBooks = async () => {
      setLoading(true);
      try {
        const [catRes, booksRes] = await Promise.all([
          api.get(`/categories/${slug}`),
          api.get(`/books?category=${slug}&type=${selectedType}&sort=${sort}&minPrice=${minPrice}&maxPrice=${maxPrice}`),
        ]);

        if (catRes.data.success) {
          setCategory(catRes.data.data.category);
        }
        if (booksRes.data.success) {
          setBooks(booksRes.data.data.books);
        }
      } catch (err) {
        console.error('Failed to load category books:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryAndBooks();
    }
  }, [slug, searchParams, selectedType, sort, minPrice, maxPrice]);

  const updateFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Banner Card */}
      {category && (
        <div className="bg-navy rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-navy-light flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 z-10 max-w-xl">
            <Link
              to="/books"
              className="inline-flex items-center space-x-1.5 text-xs text-golden font-bold hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Books</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{category.name}</h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {category.description || 'Explore our hand-picked curated literature in this genre.'}
            </p>
          </div>

          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-navy-light border border-gray-700 flex items-center justify-center text-golden flex-shrink-0 shadow-inner">
            <BookOpen className="w-12 h-12" />
          </div>
        </div>
      )}

      {/* Filter and Sorting Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
        <div>
          <p className="text-xs text-gray-500 font-semibold">
            Showing <span className="font-bold text-navy">{books.length}</span> titles in {category?.name || 'Category'}
          </p>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500">Format:</span>
            <select
              value={selectedType}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-surface text-navy focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="">All Formats</option>
              <option value="physical">Physical Book</option>
              <option value="ebook">Digital eBook</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-surface text-navy focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="">Latest</option>
              <option value="popularity">Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse bg-gray-200 aspect-[3/4] rounded-xl"></div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-navy text-lg">No books found in this category</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your format or price filters to see more books in this collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};
