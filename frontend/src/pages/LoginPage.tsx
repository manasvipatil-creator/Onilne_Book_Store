import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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
        if (res.data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-golden mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-navy">Welcome Back</h2>
          <p className="text-xs text-gray-500">Sign in to manage orders, addresses & eBooks</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-1.5 text-gray-600">
              <input type="checkbox" className="rounded text-navy focus:ring-navy" />
              <span>Remember me</span>
            </label>
            <span className="text-golden font-semibold hover:underline cursor-pointer">
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy text-white font-bold rounded-lg hover:bg-navy-light transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-navy">Default Demo Credentials:</p>
          <p>Admin: <span className="font-mono text-navy font-bold">admin@bookstore.com</span> / <span className="font-mono">AdminPassword123!</span></p>
        </div>

        <p className="text-center text-xs text-gray-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-navy font-bold hover:text-golden">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};
