import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    displayOrder: 1,
    image: '',
    isActive: true,
  });

  const fetchCats = () => {
    setLoading(true);
    api.get('/admin/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.data.categories);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      name: '',
      description: '',
      displayOrder: categories.length + 1,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditId(c._id);
    setForm({
      name: c.name,
      description: c.description,
      displayOrder: c.displayOrder,
      image: c.image,
      isActive: c.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/admin/categories/${editId}`, form);
      } else {
        await api.post('/admin/categories', form);
      }
      setShowModal(false);
      fetchCats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category? Ensure no books are currently assigned to it.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-navy">Category Management</h1>
          <p className="text-xs text-gray-500">Organize literature genres and collections</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-golden" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-navy font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono font-bold text-gray-500">{c.displayOrder}</td>
                <td className="py-3 px-4 font-bold text-navy">{c.name}</td>
                <td className="py-3 px-4 font-mono text-gray-400">{c.slug}</td>
                <td className="py-3 px-4 text-gray-600 line-clamp-1">{c.description || '-'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button onClick={() => handleOpenEdit(c)} className="p-1 text-gray-500 hover:text-navy">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="p-1 text-gray-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-navy text-lg">{editId ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy text-white font-bold rounded-lg hover:bg-navy-light"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
