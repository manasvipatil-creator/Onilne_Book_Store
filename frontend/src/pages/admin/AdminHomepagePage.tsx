import React, { useEffect, useState } from 'react';
import { Sliders, CheckCircle2, Sparkles, Layout } from 'lucide-react';
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

  useEffect(() => {
    api
      .get('/admin/homepage')
      .then((res) => {
        if (res.data.success) {
          setConfig(res.data.data.config);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
          Homepage Configuration
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
          Customize promotional texts, banners & storefront hero copy
        </p>
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
            value={config.hero.heading}
            onChange={(e) =>
              setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })
            }
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-textPrimary">Hero Description</label>
            <textarea
              rows={2}
              required
              value={config.hero.description}
              onChange={(e) =>
                setConfig({ ...config, hero: { ...config.hero, description: e.target.value } })
              }
              className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>

          <Input
            label="Primary Button Text"
            required
            value={config.hero.buttonText}
            onChange={(e) =>
              setConfig({ ...config, hero: { ...config.hero, buttonText: e.target.value } })
            }
          />
        </div>

        {/* Promotional Banner Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-borderMuted shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borderMuted">
            <Sparkles className="w-4 h-4 text-golden" />
            <h3 className="font-serif font-bold text-navy text-base">Promotional Strip Banner</h3>
          </div>

          <Input
            label="Promo Banner Title"
            value={config.promoBanner?.title || ''}
            onChange={(e) =>
              setConfig({
                ...config,
                promoBanner: { ...config.promoBanner, title: e.target.value },
              })
            }
          />

          <Input
            label="Promo Coupon Highlight"
            value={config.promoBanner?.discountText || ''}
            onChange={(e) =>
              setConfig({
                ...config,
                promoBanner: { ...config.promoBanner, discountText: e.target.value },
              })
            }
          />
        </div>

        <div>
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
