import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white pt-16 pb-8 border-t border-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-light flex items-center justify-center text-golden">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Online Book Store</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Your premier destination for high-quality literature, academic resources, bestselling fiction, and immediate digital eBook downloads.
            </p>
            <div className="flex space-x-3 text-golden">
              <span className="text-xs bg-navy-light px-2.5 py-1 rounded">100% Secure Checkout</span>
              <span className="text-xs bg-navy-light px-2.5 py-1 rounded">Instant eBooks</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-golden font-semibold text-base mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/books" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/books?type=physical" className="hover:text-white transition-colors">
                  Physical Paperbacks
                </Link>
              </li>
              <li>
                <Link to="/books?type=ebook" className="hover:text-white transition-colors">
                  Digital eBooks
                </Link>
              </li>
              <li>
                <Link to="/books?bestseller=true" className="hover:text-white transition-colors">
                  Bestsellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-golden font-semibold text-base mb-4 uppercase tracking-wider">Account & Help</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/account/ebooks" className="hover:text-white transition-colors">
                  My Digital Downloads
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  View Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/account/addresses" className="hover:text-white transition-colors">
                  Delivery Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-golden font-semibold text-base mb-4 uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-golden flex-shrink-0" />
                <span>Central Book Arcade, Tech Park Road, Bengaluru</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-golden flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-golden flex-shrink-0" />
                <span>support@onlinebookstore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-navy-light text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} Online Book Store. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Built with <Heart className="w-3.5 h-3.5 text-golden mx-1 fill-golden" /> for readers & collectors.
          </p>
        </div>
      </div>
    </footer>
  );
};
