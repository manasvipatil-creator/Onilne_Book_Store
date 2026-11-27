import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle2, Sparkles, Layout } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminHomepagePage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchConfig = () => {
    setLoading(true);
    api
      .get('/admin/homepage')
      .then((res) => {
        if (res.data.success) {
          setConfig(res.data.data.config);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/admin/homepage', config);
      if (res.data.success) {
        toast.success('Homepage banner configuration updated live!');
      }
    } catch (err: any) {
      toast.error('Failed to update homepage settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
          Homepage Configuration
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
          Customize promotional texts, banners & storefront hero copy
        </p>
      </div>

      {/* Live Storefront Preview Card */}
      <div className="bg-surface rounded-2xl border border-borderMuted p-4 sm:p-6 shadow-soft space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-borderMuted">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-golden" />
            <h3 className="font-serif font-bold text-navy text-sm sm:text-base">Storefront Hero Preview</h3>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Realtime Preview
          </span>
        </div>

        {/* Mini Preview Box */}
        <div className="relative rounded-2xl overflow-hidden min-h-[180px] sm:min-h-[220px] bg-[#0A1929] flex items-center p-6 text-white shadow-inner">
          <div className="absolute inset-0 z-0">
            <img
              src={config?.hero?.imageUrl || '/bookora-hero.jpg'}
              alt="Preview"
              className="w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071727] via-[#071727]/90 to-transparent z-10" />
          </div>

          <div className="relative z-20 max-w-sm space-y-2 text-left">
            <div className="text-golden text-[10px] font-bold tracking-widest uppercase">
              Read • Learn • Grow —
            </div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight leading-snug">
              {config?.hero?.heading || 'Your Favorite Books, Anytime!'}
            </h2>
            <p className="text-slate-300 text-xs line-clamp-2">
              {config?.hero?.description || 'Discover a world of knowledge and imagination with BOOKORA.'}
            </p>
            <div className="pt-1">
              <span className="inline-block px-4 py-1.5 rounded-full bg-golden text-navy font-black text-[11px] uppercase tracking-wider shadow">
                {config?.hero?.buttonText || 'Explore Books'} →
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-borderMuted shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borderMuted">
            <Layout className="w-4 h-4 text-golden" />
            <h3 className="font-serif font-bold text-navy text-base">Hero Banner Section</h3>
          </div>

          <Input
            label="Hero Heading"
            required
            value={config?.hero?.heading || ''}
            onChange={(e) =>
              setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })
            }
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-textPrimary">Hero Description</label>
            <textarea
              rows={2}
              required
              value={config?.hero?.description || ''}
              onChange={(e) =>
                setConfig({ ...config, hero: { ...config.hero, description: e.target.value } })
              }
              className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Button Text"
              required
              value={config?.hero?.buttonText || ''}
              onChange={(e) =>
                setConfig({ ...config, hero: { ...config.hero, buttonText: e.target.value } })
              }
            />

            <Input
              label="Hero Background Image URL"
              value={config?.hero?.imageUrl || ''}
              placeholder="/bookora-hero.jpg or image URL"
              onChange={(e) =>
                setConfig({ ...config, hero: { ...config.hero, imageUrl: e.target.value } })
              }
            />
          </div>
        </div>

        {/* Promotional Banner Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-borderMuted shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borderMuted">
            <Sparkles className="w-4 h-4 text-golden" />
            <h3 className="font-serif font-bold text-navy text-base">Promotional Strip Banner</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Promo Banner Title"
              value={config?.promoBanner?.title || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  promoBanner: { ...config.promoBanner, title: e.target.value },
                })
              }
            />

            <Input
              label="Promo Coupon Highlight"
              value={config?.promoBanner?.discountText || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  promoBanner: { ...config.promoBanner, discountText: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            Save Homepage Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
