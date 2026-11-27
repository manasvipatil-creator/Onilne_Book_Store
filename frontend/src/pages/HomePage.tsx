import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';
import { CategoryCard } from '../components/CategoryCard';
import { BookCardSkeleton } from '../components/common';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [bestSellers, setBestSellers] = useState<Book[]>([]);
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [homeConfig, setHomeConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Best Sellers carousel ref for smooth scrolling
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [catsRes, featRes, bestRes, newRes, configRes] = await Promise.all([
        api.get('/categories'),
        api.get('/books/featured'),
        api.get('/books/best-sellers'),
        api.get('/books/new-arrivals'),
        api.get('/books/homepage-config').catch(() => ({ data: null })),
      ]);

      if (catsRes.data?.success) setCategories(catsRes.data.data.categories || []);
      if (featRes.data?.success) setFeaturedBooks(featRes.data.data.books || []);
      if (bestRes.data?.success) setBestSellers(bestRes.data.data.books || []);
      if (newRes.data?.success) setNewArrivals(newRes.data.data.books || []);
      if (configRes?.data?.success) setHomeConfig(configRes.data.data.config);
    } catch (err) {
      console.error('Error loading homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <div className="bg-background min-h-screen space-y-12 sm:space-y-16 pb-20">
      {/* 1. BOOKORA Signature Panoramic Hero Banner (Exact match to reference image) */}
      <section className="relative w-full overflow-hidden bg-[#0A1929] text-white min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] flex items-center">
        {/* Full-width Background Image: Open book, steam, bookshelf and branded mug */}
        <div className="absolute inset-0 z-0">
          <img
            src={homeConfig?.hero?.imageUrl || '/bookora-hero.jpg'}
            alt="BOOKORA Library - Open glowing book and coffee mug"
            className="w-full h-full object-cover object-right sm:object-center"
          />
          {/* Deep Navy Gradient on Left to ensure crystal-clear text readability across all devices */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071727] via-[#071727]/90 md:via-[#071727]/75 to-transparent z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-14 sm:py-20 lg:py-24">
          <div className="max-w-xl space-y-4 sm:space-y-6 text-left">
            {/* Tagline */}
            <div className="flex items-center space-x-2 text-golden text-xs sm:text-sm font-bold tracking-widest uppercase">
              <span>Read • Learn • Grow</span>
              <span className="w-8 h-0.5 bg-golden inline-block rounded-full"></span>
            </div>

            {/* Headline matching BOOKORA reference exactly */}
            <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
              {homeConfig?.hero?.heading ? (
                homeConfig.hero.heading.includes('Anytime') ? (
                  <>
                    {homeConfig.hero.heading.split('Anytime')[0]}
                    <span className="text-golden">Anytime!</span>
                  </>
                ) : (
                  homeConfig.hero.heading
                )
              ) : (
                <>
                  Your Favorite <br />
                  Books, <span className="text-golden">Anytime!</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-md">
              {homeConfig?.hero?.description || 'Discover a world of knowledge and imagination with BOOKORA.'}
            </p>

            {/* CTA Button matching reference */}
            <div className="pt-2 flex items-center space-x-3">
              <Link
                to={homeConfig?.hero?.buttonLink || '/books'}
                className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 rounded-full bg-golden hover:bg-golden-light text-navy font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-elevated hover:scale-105 active:scale-95"
              >
                <span>{homeConfig?.hero?.buttonText || 'Explore Books'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Overlapping Trust Feature Strip (Free Shipping, Secure Payments, 24/7 Support, Easy Returns) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 md:-mt-14 relative z-20">
        <div className="bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border border-amber-100 shadow-elevated p-4 sm:p-5 md:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-amber-200/50">
          {/* Feature 1 */}
          <div className="flex items-center space-x-3.5 sm:px-3 md:px-4 py-2 sm:py-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-navy">Free Shipping</h4>
              <p className="text-[11px] text-textSecondary">On orders above ₹499</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center space-x-3.5 sm:px-3 md:px-4 py-2 sm:py-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-navy">Secure Payments</h4>
              <p className="text-[11px] text-textSecondary">100% Secure</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center space-x-3.5 sm:px-3 md:px-4 py-2 sm:py-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-navy">24/7 Support</h4>
              <p className="text-[11px] text-textSecondary">Always Here</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-center space-x-3.5 sm:px-3 md:px-4 py-2 sm:py-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-navy">Easy Returns</h4>
              <p className="text-[11px] text-textSecondary">Hassle-Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Browse Categories Section (Centered Title with View All on Right matching reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6 sm:pt-8">
        <div className="relative flex items-center justify-center pb-2">
          {/* Centered Headline with elegant horizontal accent line */}
          <div className="flex items-center space-x-3 text-center">
            <div className="w-6 sm:w-12 h-0.5 bg-golden/40 hidden sm:block" />
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy">
              Browse Categories
            </h2>
            <div className="w-6 sm:w-12 h-0.5 bg-golden/40 hidden sm:block" />
          </div>

          {/* View All link pinned to the right */}
          <Link
            to="/books"
            className="absolute right-0 text-xs sm:text-sm font-bold text-navy hover:text-golden flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 text-golden" />
          </Link>
        </div>

        {/* Categories Grid (8 columns on lg matching the 8 category cards in reference) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-surface animate-pulse" />
              ))
            : categories.slice(0, 8).map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
        </div>
      </section>

      {/* 4. Best Sellers Section (Centered Title, Navigation arrows, View All) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6 sm:pt-10">
        <div className="relative flex items-center justify-center pb-2">
          <div className="flex items-center space-x-3 text-center">
            <div className="w-6 sm:w-12 h-0.5 bg-golden/40 hidden sm:block" />
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy">
              Best Sellers
            </h2>
            <div className="w-6 sm:w-12 h-0.5 bg-golden/40 hidden sm:block" />
          </div>

          <Link
            to="/books?sort=bestseller"
            className="absolute right-0 text-xs sm:text-sm font-bold text-navy hover:text-golden flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 text-golden" />
          </Link>
        </div>

        {/* Carousel Container with Absolute Left and Right Arrow Buttons */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollCarousel('left')}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-borderMuted bg-surface/95 backdrop-blur-md text-navy hover:bg-golden hover:text-white transition-all flex items-center justify-center shadow-md active:scale-90"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Scrollable Book Cards Container */}
          <div
            ref={carouselRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="min-w-[200px] sm:min-w-[230px] flex-shrink-0">
                  <BookCardSkeleton />
                </div>
              ))
            ) : bestSellers.length > 0 ? (
              bestSellers.map((book) => (
                <div key={book._id} className="min-w-[200px] sm:min-w-[230px] max-w-[230px] flex-shrink-0">
                  <BookCard book={book} />
                </div>
              ))
            ) : (
              featuredBooks.slice(0, 5).map((book) => (
                <div key={book._id} className="min-w-[200px] sm:min-w-[230px] max-w-[230px] flex-shrink-0">
                  <BookCard book={book} />
                </div>
              ))
            )}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollCarousel('right')}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-borderMuted bg-surface/95 backdrop-blur-md text-navy hover:bg-golden hover:text-white transition-all flex items-center justify-center shadow-md active:scale-90"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

      {/* 5. Featured / All Books Collection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-borderMuted pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-6 bg-golden rounded-full" />
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy">
              Explore Our Collection
            </h2>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-bold text-navy hover:text-golden flex items-center space-x-1 transition-colors"
          >
            <span>View All Books</span>
            <ArrowRight className="w-4 h-4 text-golden" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {loading
            ? [...Array(10)].map((_, i) => <BookCardSkeleton key={i} />)
            : newArrivals.concat(featuredBooks).slice(0, 10).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
        </div>
      </section>
    </div>
  );
};
