import React, { useEffect, useState } from 'react';
import { Sliders, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const AdminHomepagePage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/admin/homepage').then((res) => {
      if (res.data.success) {
        setConfig(res.data.data.config);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    try {
      const res = await api.patch('/admin/homepage', config);
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      alert('Failed to update homepage settings');
    }
  };

  if (loading) return <div className="text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-navy">Homepage Customization</h1>
        <p className="text-xs text-gray-500">Manage hero promotional texts and top banners</p>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Homepage configuration updated live!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-navy text-sm border-b pb-2">Hero Banner Section</h3>
        <div>
          <label className="block font-bold text-gray-700 mb-1">Heading</label>
          <input
            type="text"
            required
            value={config.hero.heading}
            onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-bold text-gray-700 mb-1">Description</label>
          <textarea
            rows={2}
            required
            value={config.hero.description}
            onChange={(e) => setConfig({ ...config, hero: { ...config.hero, description: e.target.value } })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-bold text-gray-700 mb-1">Button Text</label>
          <input
            type="text"
            required
            value={config.hero.buttonText}
            onChange={(e) => setConfig({ ...config, hero: { ...config.hero, buttonText: e.target.value } })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <h3 className="font-bold text-navy text-sm border-b pb-2 pt-4">Offer Banner</h3>
        <div>
          <label className="block font-bold text-gray-700 mb-1">Banner Title</label>
          <input
            type="text"
            value={config.promoBanner?.title || ''}
            onChange={(e) => setConfig({ ...config, promoBanner: { ...config.promoBanner, title: e.target.value } })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-bold text-gray-700 mb-1">Discount Coupon Highlight</label>
          <input
            type="text"
            value={config.promoBanner?.discountText || ''}
            onChange={(e) => setConfig({ ...config, promoBanner: { ...config.promoBanner, discountText: e.target.value } })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-navy text-white font-bold rounded-lg hover:bg-navy-light shadow-sm"
          >
            Save Homepage Settings
          </button>
        </div>
      </form>
    </div>
  );
};
