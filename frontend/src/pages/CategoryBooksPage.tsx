import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';
import { BookCardSkeleton, EmptyState } from '../components/common';

export const CategoryBooksPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState<Category | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      {/* Category Editorial Banner */}
      {category && (
        <div className="bg-gradient-to-r from-navy via-navy-light to-navy rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-elevated border border-navy-light flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 z-10 max-w-2xl">
            <Link
              to="/books"
              className="inline-flex items-center space-x-1.5 text-xs text-golden font-bold hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Collections</span>
            </Link>
            <span className="inline-block px-3 py-1 rounded-full bg-golden/20 border border-golden/30 text-golden text-[11px] font-black uppercase tracking-wider">
              Curated Genre
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-white tracking-tight">
              {category.name}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {category.description || 'Explore our hand-picked curated literature in this genre, available in paperbacks and instant digital downloads.'}
            </p>
          </div>

          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-navy-dark/60 border border-navy-light/60 flex items-center justify-center text-golden flex-shrink-0 shadow-inner">
            <BookOpen className="w-12 h-12" />
          </div>
        </div>
      )}

      {/* Filter and Sorting Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-borderMuted gap-4">
        <div>
          <p className="text-xs text-textSecondary font-bold">
            Showing <span className="font-black text-navy">{books.length}</span> titles in {category?.name || 'Category'}
          </p>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-textSecondary">Format:</span>
            <select
              value={selectedType}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="border border-borderMuted rounded-full px-3 py-1.5 text-xs font-bold bg-surface text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 cursor-pointer"
            >
              <option value="">All Formats</option>
              <option value="physical">Physical Paperback</option>
              <option value="ebook">Digital eBook</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-textSecondary">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="border border-borderMuted rounded-full px-3 py-1.5 text-xs font-bold bg-surface text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 cursor-pointer"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="latest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No books in this category"
            description="We haven't added books matching this specific filter in this genre yet. Check back soon or explore other categories."
            actionText="Browse All Books"
            onAction={() => setSearchParams({})}
          />
        )}
      </div>
    </div>
  );
};
