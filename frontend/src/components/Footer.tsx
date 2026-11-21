import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  Share2,
} from 'lucide-react';
import { siteConfig } from '../config/site';

// Clean SVG social brand icons that don't depend on missing icon packages
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.704 0-1.282.179-1.688.521-.403.339-.607.9-.607 1.666v1.793h4.372l-.703 3.667h-3.669v7.98h-4.786z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white pt-16 pb-12 border-t border-navy-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-column Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-navy-light/30">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group inline-block">
              <div className="w-10 h-10 rounded-2xl bg-navy-light flex items-center justify-center text-golden transition-transform duration-300 group-hover:scale-105 shadow-inner">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-tight text-white leading-none">
                  Book<span className="text-golden">Store</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {siteConfig.tagline}
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              {siteConfig.socials.twitter && (
                <a
                  href={siteConfig.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-navy-light hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              )}
              {siteConfig.socials.facebook && (
                <a
                  href={siteConfig.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-navy-light hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {siteConfig.socials.instagram && (
                <a
                  href={siteConfig.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-navy-light hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {siteConfig.socials.linkedin && (
                <a
                  href={siteConfig.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-navy-light hover:bg-golden hover:text-navy text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Customer Services (Strictly unchanged 4 links preserved) */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Customer Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/account" className="hover:text-golden transition-colors">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/account/ebooks" className="hover:text-golden transition-colors">
                  My Digital Downloads
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-golden transition-colors">
                  View Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/account/addresses" className="hover:text-golden transition-colors">
                  Delivery Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Collections */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/books?featured=true" className="hover:text-golden transition-colors">
                  Featured Literary Classics
                </Link>
              </li>
              <li>
                <Link to="/books?bestseller=true" className="hover:text-golden transition-colors">
                  National Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/books?type=ebook" className="hover:text-golden transition-colors">
                  Digital eBooks (Instant Delivery)
                </Link>
              </li>
              <li>
                <Link to="/books?type=physical" className="hover:text-golden transition-colors">
                  Physical Paperbacks
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information from config */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-golden flex-shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-golden flex-shrink-0" />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-golden flex-shrink-0" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-golden transition-colors">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-golden flex-shrink-0" />
                <span>{siteConfig.contact.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for passionate readers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
