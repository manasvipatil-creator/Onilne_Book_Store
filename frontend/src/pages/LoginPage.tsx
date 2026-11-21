import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input } from '../components/common';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        success(`Welcome back, ${res.data.data.user.name}!`);
        if (res.data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
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
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary">
              Access your digital eBook library, physical orders, and saved addresses.
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
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded text-navy focus:ring-navy" />
                <span className="font-medium">Remember me</span>
              </label>
              <span className="text-golden hover:text-golden-dark font-bold hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-4"
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-borderMuted text-center">
            <p className="text-xs text-textSecondary">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-navy hover:text-golden transition-colors underline">
                Register free
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Split-screen Showcase (5 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-navy via-navy to-navy-light p-10 text-white flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-golden/20 border border-golden/30 text-golden text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reader Privileges</span>
            </div>

            <h2 className="font-serif text-3xl font-bold leading-snug">
              "A reader lives a thousand lives before he dies."
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Enjoy continuous access to your personalized library, synchronized across all your reading devices.
            </p>

            <ul className="space-y-3 text-xs text-slate-200 pt-4">
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-golden flex-shrink-0" />
                <span>Instant PDF & EPUB eBook downloads</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-golden flex-shrink-0" />
                <span>Real-time courier delivery tracking</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-golden flex-shrink-0" />
                <span>Fast one-click checkout with Razorpay</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 border-t border-navy-light/40 text-[11px] text-slate-400 relative z-10">
            100% Encrypted & Secure Authentication
          </div>
        </div>
      </div>
    </div>
  );
};
