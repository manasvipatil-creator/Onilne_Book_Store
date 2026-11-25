import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { Category } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    description: '',
    displayOrder: 1,
    image: '',
    isActive: true,
  });

  const fetchCats = () => {
    setLoading(true);
    api
      .get('/admin/categories')
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data.categories);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      description: c.description || '',
      displayOrder: c.displayOrder,
      image: c.image || '',
      isActive: c.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/admin/categories/${editId}`, form);
        toast.success(`Category "${form.name}" updated`);
      } else {
        await api.post('/admin/categories', form);
        toast.success(`New category "${form.name}" created`);
      }
      setShowModal(false);
      fetchCats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/admin/categories/${categoryToDelete.id}`);
      toast.info(`Category "${categoryToDelete.name}" deleted`);
      fetchCats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
            Organize literary genres, topics & curated storefront collections
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-navy text-white hover:bg-navy-light shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] self-start sm:self-auto group"
        >
          <span className="w-5 h-5 rounded-lg bg-golden/20 flex items-center justify-center text-golden group-hover:bg-golden group-hover:text-navy transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </span>
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-borderMuted shadow-soft overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/75 border-b border-borderMuted text-navy font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Category Name</th>
              <th className="py-3.5 px-4">Slug</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderMuted/60">
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-navy/[0.015] transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-textSecondary">
                  #{c.displayOrder}
                </td>
                <td className="py-3.5 px-4 font-serif font-bold text-navy text-sm">
                  {c.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-textSecondary text-[11px]">
                  {c.slug}
                </td>
                <td className="py-3.5 px-4 text-textSecondary max-w-xs truncate">
                  {c.description || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={c.isActive ? 'success' : 'neutral'} size="sm">
                    {c.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right space-x-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-textSecondary hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id, c.name)}
                    className="p-1.5 text-textSecondary hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Genre Category' : 'Create Genre Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            required
            placeholder="e.g. Science & Technology"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-textPrimary">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description for category banner..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Display Order"
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-textPrimary">Status</label>
              <select
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                <option value="true">Active (Visible)</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-borderMuted">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
            >
              {editId ? 'Update Category' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message={`Delete category "${categoryToDelete?.name}"? Please ensure no books are currently assigned to this category before deleting.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
