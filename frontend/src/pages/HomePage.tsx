import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  DownloadCloud,
  CheckCircle,
  BookOpen,
  Mail,
  Headphones,
  Gift,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  Award,
  BookMarked,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';
import { CategoryCard } from '../components/CategoryCard';
import { BookCardSkeleton, Button } from '../components/common';
import { SectionHeader } from '../components/common/SectionHeader';
import { Reveal } from '../components/common/Reveal';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [bestSellers, setBestSellers] = useState<Book[]>([]);
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [wakeUpMessage, setWakeUpMessage] = useState<boolean>(false);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Curated High-Definition Hero Slides
  const heroSlides = [
    {
      id: 1,
      badge: 'Premier Book Collection',
      titlePrefix: 'Discover Your Next',
      titleHighlight: 'Favorite Book',
      subtitle:
        'Explore thousands of timeless classics, profound ideas, and modern bestsellers. Available in premium physical paperbacks and instant digital eBooks.',
      buttonText: 'Explore Collection',
      buttonLink: '/books',
      secondaryText: 'Instant eBooks',
      secondaryLink: '/books?type=ebook',
      imageUrl:
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=85&w=1400',
      alt: 'Favorite Books and Reading Collection',
      rating: '4.9/5 Rating from 10,000+ Readers',
      floatingCard: {
        title: 'Bestseller of the Week',
        subtitle: 'Atomic Habits & Psychology of Money',
        icon: Flame,
      },
    },
    {
      id: 2,
      badge: 'Instant Digital Access',
      titlePrefix: 'Read Anywhere, Anytime',
      titleHighlight: 'Instant eBooks',
      subtitle:
        'Download verified PDF and EPUB editions in seconds directly to your phone, tablet, or eReader. Zero delivery wait time, permanent private library access.',
      buttonText: 'Browse eBooks',
      buttonLink: '/books?type=ebook',
      secondaryText: 'All Books',
      secondaryLink: '/books',
      imageUrl:
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=85&w=1400',
      alt: 'Instant eBooks and Digital Reading',
      rating: 'Immediate Download & Lifetime Access',
      floatingCard: {
        title: 'Digital Edition (PDF/EPUB)',
        subtitle: 'Read across mobile, iPad & Kindle',
        icon: DownloadCloud,
      },
    },
    {
      id: 3,
      badge: 'Editor’s Curated Choice',
      titlePrefix: 'Expand Your Knowledge',
      titleHighlight: 'Literary Gems',
      subtitle:
        'Hand-picked selections spanning software architecture, personal finance, psychology, and world history for curious minds.',
      buttonText: 'View Editor Picks',
      buttonLink: '/books?featured=true',
      secondaryText: 'New Arrivals',
      secondaryLink: '/books?sort=latest',
      imageUrl:
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=85&w=1400',
      alt: 'Curated Bookshelf and Reading Space',
      rating: 'Hand-picked by Literary Editors',
      floatingCard: {
        title: 'Special Reading Festival',
        subtitle: 'Verified genuine publisher prints',
        icon: Award,
      },
    },
  ];

  // Auto-advance hero carousel every 5.5s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const loadHomeData = async () => {
    setLoading(true);
    setHasError(false);
    setWakeUpMessage(false);

    const wakeUpTimer = setTimeout(() => {
      setWakeUpMessage(true);
    }, 3000);

    try {
      const [catsRes, featRes, bestRes, newRes] = await Promise.all([
        api.get('/categories'),
        api.get('/books/featured'),
        api.get('/books/best-sellers'),
        api.get('/books/new-arrivals'),
      ]);

      if (catsRes.data?.success) setCategories(catsRes.data.data.categories || []);
      if (featRes.data?.success) setFeaturedBooks(featRes.data.data.books || []);
      if (bestRes.data?.success) setBestSellers(bestRes.data.data.books || []);
      if (newRes.data?.success) setNewArrivals(newRes.data.data.books || []);
    } catch (err) {
      console.error('Error loading homepage data:', err);
      setHasError(true);
    } finally {
      clearTimeout(wakeUpTimer);
      setLoading(false);
      setWakeUpMessage(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const currentHero = heroSlides[currentSlide];
  const FloatingIcon = currentHero.floatingCard.icon;

  return (
    <div className="space-y-16 sm:space-y-24 pb-24 bg-background overflow-hidden">
      {/* 1. Animated Hero Showcase Section */}
      <section
        className="relative w-full bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/60 to-background border-b border-borderMuted py-12 sm:py-16 lg:py-24"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle decorative background blur glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-golden/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-navy/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Text & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-6 max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hero-text-${currentHero.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-5"
                >
                  {/* Badge */}
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-golden/10 border border-golden/25 text-golden font-bold shadow-xs">
                    <Sparkles className="w-4 h-4 text-golden animate-pulse" />
                    <span className="text-[11px] uppercase tracking-wider">
                      {currentHero.badge}
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-navy leading-[1.12] tracking-tight">
                    {currentHero.titlePrefix} <br />
                    <span className="text-golden underline decoration-golden/30 underline-offset-8">
                      {currentHero.titleHighlight}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-textSecondary text-base sm:text-lg font-normal leading-relaxed">
                    {currentHero.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to={currentHero.buttonLink}
                  className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full bg-navy text-white text-sm font-bold hover:bg-navy-light transition-all shadow-soft hover:shadow-elevated active:scale-95 group"
                >
                  <span>{currentHero.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-golden transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to={currentHero.secondaryLink}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-surface border border-borderMuted text-navy text-sm font-bold hover:border-navy transition-all shadow-xs active:scale-95"
                >
                  <DownloadCloud className="w-4 h-4 text-golden" />
                  <span>{currentHero.secondaryText}</span>
                </Link>
              </div>

              {/* Trust Rating Strip & Carousel Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-borderMuted/80 gap-4">
                <div className="flex items-center space-x-2 text-xs text-textSecondary font-medium">
                  <div className="flex text-golden">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-golden" />
                    ))}
                  </div>
                  <span>{currentHero.rating}</span>
                </div>

                {/* Animated Carousel Dots and Arrow Buttons */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full ${
                          currentSlide === idx
                            ? 'w-7 h-2 bg-navy shadow-xs'
                            : 'w-2 h-2 bg-slate-300 hover:bg-navy/50'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlide(
                          (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
                        )
                      }
                      className="p-1.5 rounded-full hover:bg-navy/10 text-navy transition-colors"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
                      }
                      className="p-1.5 rounded-full hover:bg-navy/10 text-navy transition-colors"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Animated Floating Glassmorphism Pill (5 cols) */}
            <div className="lg:col-span-5 relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] max-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hero-img-${currentHero.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-elevated border border-borderMuted bg-slate-100"
                >
                  <img
                    src={currentHero.imageUrl}
                    alt={currentHero.alt}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* Floating Glassmorphism Feature Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute -bottom-5 sm:-bottom-6 left-4 right-4 sm:left-6 sm:right-6 bg-surface/95 backdrop-blur-md p-4 rounded-2xl shadow-elevated border border-borderMuted flex items-center space-x-3.5 z-20"
              >
                <div className="w-10 h-10 rounded-xl bg-golden/20 text-golden flex items-center justify-center flex-shrink-0">
                  <FloatingIcon className="w-5 h-5 text-golden" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif font-bold text-navy text-xs sm:text-sm truncate">
                    {currentHero.floatingCard.title}
                  </p>
                  <p className="text-[11px] text-textSecondary truncate">
                    {currentHero.floatingCard.subtitle}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Badges Strip (Home Page ONLY) */}
      <section className="bg-surface border-y border-borderMuted shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-borderMuted py-5">
            <div className="flex items-center justify-center space-x-3 p-3">
              <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-golden" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">Fast Delivery</h4>
                <p className="text-[11px] text-textSecondary">Reliable doorstep dispatch</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-3">
              <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-golden" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">Secure Payments</h4>
                <p className="text-[11px] text-textSecondary">100% Protected Razorpay</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-3">
              <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
                <Headphones className="w-5 h-5 text-golden" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">24/7 Support</h4>
                <p className="text-[11px] text-textSecondary">Dedicated reader care</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-3">
              <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-golden" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">Best Editions</h4>
                <p className="text-[11px] text-textSecondary">Guaranteed genuine copies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Backend Wake-up / Free Tier Message */}
      {wakeUpMessage && loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center space-x-3 shadow-xs">
            <Loader2 className="w-5 h-5 animate-spin text-golden flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              Waking up the server, loading books… Please hold on a moment.
            </p>
          </div>
        </div>
      )}

      {/* Error state with retry */}
      {hasError && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-4">
            <p className="text-sm font-bold text-amber-900">
              Backend is waking up or temporarily unavailable. Please retry.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={loadHomeData}
            >
              Retry Loading Books
            </Button>
          </div>
        </section>
      )}

      {/* 3. Category Quick Filter Chips */}
      {categories.length > 0 && (
        <Reveal>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
              <Link
                to="/books"
                className="px-4 py-2.5 rounded-2xl bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors whitespace-nowrap shadow-soft flex-shrink-0"
              >
                All Genres
              </Link>
              {categories.map((c) => (
                <CategoryCard key={c._id} category={c} variant="chip" />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* 4. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Best Sellers"
          subtitle="Top titles readers across India are currently enjoying"
          viewAllLink="/books?bestseller=true"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {bestSellers.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Featured Titles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Titles"
          subtitle="Hand-picked selections curated by our editors"
          viewAllLink="/books?featured=true"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {featuredBooks.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Popular Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Popular Categories"
          subtitle="Browse literary genres, educational guides, and modern knowledge"
          viewAllLink="/books"
          viewAllText="View All Genres"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat._id} category={cat} variant="card" />
          ))}
        </div>
      </section>

      {/* 7. Discover & Learn Showcase Banner */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-navy via-navy to-navy-light text-white p-8 sm:p-12 shadow-elevated border border-navy-light/40 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-golden/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

            <div className="space-y-3 z-10 max-w-xl">
              <span className="inline-block px-3.5 py-1 bg-golden/20 border border-golden/30 text-golden text-xs font-bold rounded-full uppercase tracking-wider">
                Curated Collections
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Expand Your Mind with Great Books
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Explore thousands of verified titles across technology, self-help, business, and philosophy. Available in premium paperbacks and instant digital eBooks.
              </p>
            </div>

            <Link
              to="/books"
              className="whitespace-nowrap px-8 py-3.5 rounded-full bg-golden text-navy font-bold hover:bg-golden-light transition-all shadow-soft active:scale-95 z-10"
            >
              Explore Library
            </Link>
          </div>
        </section>
      </Reveal>

      {/* 8. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="New Arrivals"
          subtitle="Fresh publications just added to our shelves"
          viewAllLink="/books?sort=latest"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {newArrivals.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 9. Newsletter Subscription Section */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface rounded-3xl p-8 sm:p-12 border border-borderMuted shadow-soft flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-golden flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Stay Inspired</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy">
                Join Our Reading Community
              </h3>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                Get weekly curated reading lists, author notes, and new releases delivered directly to your inbox.
              </p>
            </div>

            <div className="w-full md:w-auto">
              {newsletterSubscribed ? (
                <div className="flex items-center space-x-2 text-emerald-800 font-bold bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-200 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Thank you for joining our community!</span>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row gap-2 w-full max-w-md"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-borderMuted text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 bg-background flex-1"
                  />
                  <Button type="submit" variant="primary" size="md">
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
};
