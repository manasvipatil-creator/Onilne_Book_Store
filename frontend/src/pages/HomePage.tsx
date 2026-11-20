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
  Star,
  Mail,
  Zap,
  Award,
  Headphones,
  Gift,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { BookCard } from '../components/BookCard';
import { handleHeroImageError } from '../utils/imageFallbacks';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [bestSellers, setBestSellers] = useState<Book[]>([]);
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Professional Full-Width Panoramic Slides (Without Discount/Promos)
  const heroSlides = [
    {
      id: 1,
      badge: 'Premier Book Collection',
      titlePrefix: 'Discover Your Next',
      titleHighlight: 'Favorite Book',
      subtitle: 'Explore. Read. Be Inspired.',
      buttonText: 'Shop Now',
      buttonLink: '/books',
      imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=85&w=1600',
      alt: 'Favorite Books, Coffee and Lifestyle',
    },
    {
      id: 2,
      badge: 'Digital & Audio Library',
      titlePrefix: 'Read Anywhere, Anytime',
      titleHighlight: 'Instant eBooks',
      subtitle: 'Download PDF & EPUB in seconds directly to your phone or tablet.',
      buttonText: 'Browse eBooks',
      buttonLink: '/books?type=ebook',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=85&w=1600',
      alt: 'Instant eBooks and Digital Reading',
    },
  ];

  // Auto-scroll every 5 seconds, pauses when hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, featRes, bestRes, newRes] = await Promise.all([
          api.get('/categories'),
          api.get('/books/featured'),
          api.get('/books/best-sellers'),
          api.get('/books/new-arrivals'),
        ]);

        if (catsRes.data.success) setCategories(catsRes.data.data.categories);
        if (featRes.data.success) setFeaturedBooks(featRes.data.data.books);
        if (bestRes.data.success) setBestSellers(bestRes.data.data.books);
        if (newRes.data.success) setNewArrivals(newRes.data.data.books);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-12 pb-16 bg-background">
      {/* 1. Full-Width Panoramic Hero Carousel Banner (Reference Design) */}
      <section
        className="relative w-full bg-[#FAF7F2] border-b border-gray-200 overflow-hidden min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full-bleed background image with seamless fade mask */}
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 h-full">
            <img
              key={heroSlides[currentSlide].id}
              src={heroSlides[currentSlide].imageUrl}
              alt={heroSlides[currentSlide].alt}
              className="w-full h-full object-cover object-center lg:object-right transition-opacity duration-1000 ease-in-out"
              onError={handleHeroImageError}
            />
          </div>
          {/* Seamless gradient fade from left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 lg:via-[#FAF7F2]/60 to-transparent"></div>
          {/* Bottom subtle gradient for contrast */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#FAF7F2] to-transparent"></div>
        </div>

        {/* Hero Content (Floating over the left of the panoramic banner) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 w-full">
          <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-6">
            {/* 3 Golden Sparks / Ray Marks (Reference Design) */}
            <div className="flex items-center space-x-2 text-golden">
              <svg
                className="w-8 h-8 text-golden flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              >
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="4.5" y1="4.5" x2="8" y2="8" />
                <line x1="12" y1="2" x2="12" y2="6" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-golden">
                {heroSlides[currentSlide].badge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-navy leading-[1.15] tracking-tight">
              {heroSlides[currentSlide].titlePrefix} <br />
              <span className="text-navy font-extrabold">{heroSlides[currentSlide].titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* Action CTA Button */}
            <div className="pt-2">
              <Link
                to={heroSlides[currentSlide].buttonLink}
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-navy text-white font-bold hover:bg-navy-light hover:text-golden transition-all shadow-md group/btn"
              >
                <span>{heroSlides[currentSlide].buttonText}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Interactive Dots (Reference Design: ● ○ ○ centered at bottom) */}
        <div className="absolute bottom-5 inset-x-0 flex justify-center items-center space-x-2.5 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${currentSlide === idx
                ? 'w-7 h-2.5 bg-navy shadow-sm'
                : 'w-2.5 h-2.5 bg-gray-400/60 hover:bg-navy/60'
                }`}
            />
          ))}
        </div>

        {/* Previous & Next Slide Arrow Buttons */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-navy shadow-md items-center justify-center border border-gray-200 hover:text-golden transition-all z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-navy shadow-md items-center justify-center border border-gray-200 hover:text-golden transition-all z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* 2. Trust Badges Strip (Reference Design: Clean 4 Columns) */}
      <section className="bg-surface border-y border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 py-3 sm:py-4">
            <div className="flex items-center justify-center space-x-3 p-3">
              <Truck className="w-6 h-6 text-navy flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">Fast & Reliable</h4>
                <p className="text-[11px] text-gray-500">Delivery</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-3">
              <ShieldCheck className="w-6 h-6 text-navy flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">Secure Payments</h4>
                <p className="text-[11px] text-gray-500">100% Protected</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-3">
              <Headphones className="w-6 h-6 text-navy flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">24/7 Customer Support</h4>
                <p className="text-[11px] text-gray-500">Dedicated Help</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-3">
              <Gift className="w-6 h-6 text-navy flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-navy">Best Offers & Discounts</h4>
                <p className="text-[11px] text-gray-500">Guaranteed Deals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Best Sellers Section (Matching Reference Image: | Best Sellers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-navy rounded-full"></div>
            <h2 className="text-2xl font-bold text-navy">Best Sellers</h2>
          </div>
          <Link
            to="/books?bestseller=true"
            className="text-xs font-semibold text-gray-500 hover:text-navy flex items-center space-x-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 aspect-[3/4] rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Featured Titles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-golden rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-navy">Featured Titles</h2>
              <p className="text-xs text-gray-500 mt-0.5">Hand-picked selections curated by our editors</p>
            </div>
          </div>
          <Link
            to="/books?featured=true"
            className="text-xs font-semibold text-gray-500 hover:text-navy flex items-center space-x-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 aspect-[3/4] rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.slice(0, 4).map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Popular Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-navy rounded-full"></div>
            <h2 className="text-2xl font-bold text-navy">Popular Categories</h2>
          </div>
          <Link to="/books" className="text-xs font-semibold text-gray-500 hover:text-navy flex items-center space-x-1 group">
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/books?category=${cat.slug}`}
              className="group p-5 bg-surface rounded-2xl border border-gray-200/80 hover:border-golden hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-3 transform hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-golden transition-colors shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-navy text-xs sm:text-sm group-hover:text-golden transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Explore Books</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Discover & Learn Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy via-navy to-navy-light text-white p-8 sm:p-12 shadow-xl border border-navy-light flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#E6A23C_1px,transparent_1px)] [background-size:16px_16px] opacity-10 hidden md:block"></div>

          <div className="space-y-3 z-10">
            <span className="px-3.5 py-1 bg-golden text-navy text-xs font-black rounded-full uppercase tracking-wider shadow-sm">
              Discover & Learn
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Expand Your Mind with Curated Books
            </h3>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl">
              Explore thousands of verified titles across technology, self-help, fiction, and philosophy. Available in premium paperbacks and instant digital eBooks.
            </p>
          </div>

          <Link
            to="/books"
            className="whitespace-nowrap px-8 py-4 rounded-xl bg-golden text-navy font-bold hover:bg-golden-light transition-all shadow-lg transform hover:-translate-y-0.5 z-10"
          >
            Explore Library
          </Link>
        </div>
      </section>

      {/* 7. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-navy rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold text-navy">New Arrivals</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fresh publications just added to our shelves</p>
            </div>
          </div>
          <Link to="/books?sort=latest" className="text-xs font-semibold text-gray-500 hover:text-navy flex items-center space-x-1 group">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.slice(0, 4).map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      {/* 8. Reader Testimonials */}
      <section className="bg-gray-50 py-14 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-golden">Real Reader Feedback</span>
            <h2 className="text-3xl font-black text-navy mt-1">What Our Readers Are Saying</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              Over 15,000+ satisfied readers trust Online Book Store for their reading and learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex text-golden">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-golden" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "The instant eBook download experience is seamless. Ordered 'Clean Code' and had the PDF on my tablet within 30 seconds of paying via UPI. Excellent service!"
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-navy text-golden font-bold text-xs flex items-center justify-center">
                  AK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy">Ananya Kulkarni</h4>
                  <p className="text-[10px] text-gray-400">Software Engineer, Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex text-golden">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-golden" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "Packaging of physical books is top-tier. Received 'The Psychology of Money' in pristine condition with tracked courier delivery in just 2 days. 10/10 recommend."
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-navy text-golden font-bold text-xs flex items-center justify-center">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy">Rohan Sharma</h4>
                  <p className="text-[10px] text-gray-400">Financial Analyst, Pune</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex text-golden">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-golden" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "Love the clean design and coupon discounts. Customer dashboard makes it super easy to track physical shipments and access my eBook library in one place."
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-navy text-golden font-bold text-xs flex items-center justify-center">
                  PM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy">Pooja Mehta</h4>
                  <p className="text-[10px] text-gray-400">Literature Student, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Newsletter Subscription Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-golden flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Stay Inspired</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Join Our Reading Community
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Get weekly curated reading lists, exclusive coupon codes, author interviews, and new release updates delivered directly to your inbox.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {newsletterSubscribed ? (
              <div className="flex items-center space-x-2 text-green-700 font-bold bg-green-50 px-6 py-4 rounded-xl border border-green-200 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Thank you! Check your inbox for your 10% welcome discount.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy flex-1 bg-gray-50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light hover:text-golden transition-all shadow-md text-sm whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
