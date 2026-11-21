import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Phone, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input } from '../components/common';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        success('Account created successfully! Welcome to BookStore.');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-surface rounded-3xl border border-borderMuted shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-8 sm:p-12 space-y-6">
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2 text-navy mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-navy text-golden flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif font-black text-xl text-navy">BookStore</span>
            </Link>
            <h1 className="font-serif text-3xl font-black text-navy tracking-tight">
              Create Reader Account
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary">
              Join thousands of readers and start exploring books today.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs font-bold text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Patil"
              leftIcon={<User className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Mobile Number"
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type password"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-4"
            >
              Complete Registration
            </Button>
          </form>

          <div className="pt-4 border-t border-borderMuted text-center">
            <p className="text-xs text-textSecondary">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-navy hover:text-golden transition-colors underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Split-screen Showcase (5 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-navy via-navy to-navy-light p-10 text-white flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-golden/20 border border-golden/30 text-golden text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Membership Benefits</span>
            </div>

            <h2 className="font-serif text-3xl font-bold leading-snug">
              Unlock a world of inspiring knowledge.
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Create your reader profile in under a minute to track shipments, curate wishlists, and instantly download eBooks anytime.
            </p>

            <ul className="space-y-3 text-xs text-slate-200 pt-4">
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-golden flex-shrink-0" />
                <span>Immediate access to your digital eBook library</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-golden flex-shrink-0" />
                <span>Save multiple delivery addresses for fast checkout</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-golden flex-shrink-0" />
                <span>Curated recommendations tailored for you</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 border-t border-navy-light/40 text-[11px] text-slate-400 relative z-10">
            100% Encrypted & Privacy Protected
          </div>
        </div>
      </div>
    </div>
  );
};
