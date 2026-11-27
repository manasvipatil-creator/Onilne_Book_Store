import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
} from 'lucide-react';
import { siteConfig } from '../config/site';

// Clean SVG social icons matching BOOKORA rounded pill style
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-navy text-white pt-12 pb-8 border-t border-navy-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-column Main Footer matching BOOKORA visual layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-navy-light/30">
          {/* Col 1: Brand Info (Cols 4) */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="flex items-center space-x-2.5 group inline-block">
              <div className="w-10 h-10 rounded-xl bg-surface/10 border border-golden/30 flex items-center justify-center p-1 shadow-soft">
                <img
                  src="/bookora-logo.png"
                  alt="BOOKORA Logo"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-wider text-white leading-none">
                  BOOK<span className="text-golden">ORA</span>
                </span>
                <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase mt-0.5">
                  Books • Ideas • A Better You
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm pt-2">
              Empowering readers with thoughtful books, modern knowledge, and instant digital access. Read anytime, anywhere.
            </p>
          </div>

          {/* Col 2: Quick Links (Cols 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-golden uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/" className="hover:text-golden transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-golden transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link to="/books?sort=bestseller" className="hover:text-golden transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-golden transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories (Cols 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-golden uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/categories/fiction" className="hover:text-golden transition-colors">
                  Fiction
                </Link>
              </li>
              <li>
                <Link to="/categories/self-help" className="hover:text-golden transition-colors">
                  Self-Help
                </Link>
              </li>
              <li>
                <Link to="/categories/technology" className="hover:text-golden transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/categories/education" className="hover:text-golden transition-colors">
                  Education
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Connect With Us & Subscribe (Cols 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-golden uppercase tracking-wider mb-2">
                Connect With Us
              </h4>
              <div className="flex items-center space-x-2.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 mb-1.5">
                Subscribe to our Newsletter
              </h4>
              <p className="text-[11px] text-slate-400 mb-2">Get the latest books and offers!</p>

              {subscribed ? (
                <div className="flex items-center space-x-1.5 text-xs text-golden font-bold py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white text-navy placeholder:text-slate-400 rounded-l-xl text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 bg-golden hover:bg-golden-light text-navy rounded-r-xl flex items-center justify-center transition-colors"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2026 BOOKORA. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-golden cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-golden cursor-pointer transition-colors">Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
