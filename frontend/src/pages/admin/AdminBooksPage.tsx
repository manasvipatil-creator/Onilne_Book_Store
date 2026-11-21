import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, BookOpen, ExternalLink, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { Book, Category } from '../../types';
import { handleBookImageError } from '../../utils/imageFallbacks';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const AdminBooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'physical' | 'ebook'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [form, setForm] = useState<any>({
    title: '',
    author: '',
    description: '',
    categoryId: '',
    publisher: '',
    isbn: '',
    language: 'English',
    pages: 200,
    type: 'physical',
    price: 299,
    originalPrice: 499,
    stock: 20,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    isFeatured: false,
    isBestSeller: false,
    status: 'published',
  });

  const fetchBooks = () => {
    setLoading(true);
    api
      .get(`/admin/books?search=${search}`)
      .then((res) => {
        if (res.data.success) {
          setBooks(res.data.data.books);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) setCategories(res.data.data.categories);
    });
    fetchBooks();
  }, [search]);

  const filteredBooks = books.filter((b) => {
    if (typeFilter === 'all') return true;
    return b.type === typeFilter;
  });

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      title: '',
      author: '',
      description: '',
      categoryId: categories[0]?._id || '',
      publisher: 'Independent Publishing',
      isbn: '',
      language: 'English',
      pages: 250,
      type: 'physical',
      price: 349,
      originalPrice: 499,
      stock: 25,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      isFeatured: false,
      isBestSeller: false,
      status: 'published',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: Book) => {
    setEditId(b._id);
    setForm({
      title: b.title,
      author: b.author,
      description: b.description,
      categoryId: typeof b.categoryId === 'object' ? b.categoryId._id : b.categoryId,
      publisher: b.publisher || 'Independent',
      isbn: b.isbn || '',
      language: b.language || 'English',
      pages: b.pages || 200,
      type: b.type,
      price: b.pricing.price,
      originalPrice: b.pricing.originalPrice,
      stock: b.physical?.stock || 0,
      coverImage: b.coverImage,
      isFeatured: b.isFeatured,
      isBestSeller: b.isBestSeller,
      status: b.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/admin/books/${editId}`, form);
        toast.success(`Book "${form.title}" updated`);
      } else {
        await api.post('/admin/books', form);
        toast.success(`New book "${form.title}" added to catalog`);
      }
      setShowModal(false);
      fetchBooks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving book');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently from inventory?`)) return;
    try {
      await api.delete(`/admin/books/${id}`);
      toast.info(`"${title}" deleted from catalog`);
      fetchBooks();
    } catch (err: any) {
      toast.error('Failed to delete book');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">
            Books Management
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
            Complete inventory catalog for physical paperbacks and instant digital eBooks
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-golden" />
          <span>Add New Book</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-borderMuted shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
          />
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-2.5" />
        </div>

        {/* Format tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {(['all', 'physical', 'ebook'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                typeFilter === t
                  ? 'bg-navy text-white shadow-soft font-bold'
                  : 'bg-navy/5 text-textSecondary hover:bg-navy/10 hover:text-navy'
              }`}
            >
              {t === 'all' ? `All (${books.length})` : t}
            </button>
          ))}
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-surface rounded-2xl border border-borderMuted shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-borderMuted text-navy font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Book Details</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Stock / Access</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted/60">
              {filteredBooks.map((b) => (
                <tr key={b._id} className="hover:bg-navy/[0.015] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-10 h-14 object-cover rounded-md shadow-xs bg-gray-100 flex-shrink-0"
                        onError={handleBookImageError}
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-serif font-bold text-navy text-sm truncate">
                          {b.title}
                        </p>
                        <p className="text-textSecondary text-[11px] truncate">
                          by {b.author}
                        </p>
                        {(b.isFeatured || b.isBestSeller) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            {b.isBestSeller && (
                              <Badge variant="bestseller" size="sm">
                                Bestseller
                              </Badge>
                            )}
                            {b.isFeatured && (
                              <Badge variant="gold" size="sm">
                                Featured
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={b.type === 'ebook' ? 'ebook' : 'paperback'} size="sm">
                      {b.type === 'ebook' ? 'Digital eBook' : 'Paperback'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-navy text-sm">
                      ₹{b.pricing.price}
                    </div>
                    {b.pricing.originalPrice > b.pricing.price && (
                      <span className="text-[11px] text-textSecondary line-through">
                        ₹{b.pricing.originalPrice}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {b.type === 'physical' ? (
                      <span
                        className={`inline-flex items-center font-semibold ${
                          (b.physical?.stock || 0) <= 5
                            ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded'
                            : 'text-navy'
                        }`}
                      >
                        {b.physical?.stock || 0} in stock
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                        Instant Delivery
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={b.status === 'published' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {b.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-textSecondary hover:text-navy hover:bg-navy/5 transition-colors"
                        title="Edit Book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id, b.title)}
                        className="p-1.5 rounded-lg text-textSecondary hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Book Details' : 'Add New Book to Inventory'}
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Book Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              label="Author Name"
              required
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-textPrimary">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
              placeholder="Book summary, themes, author notes..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-textPrimary">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-textPrimary">Product Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-borderMuted rounded-xl text-xs sm:text-sm bg-background/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                <option value="physical">Physical Book</option>
                <option value="ebook">Digital eBook</option>
              </select>
            </div>

            <Input
              label="Inventory Stock"
              type="number"
              disabled={form.type === 'ebook'}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              helperText={form.type === 'ebook' ? 'Unlimited for digital' : undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="Original MRP Price (₹)"
              type="number"
              required
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Cover Image URL"
            type="text"
            required
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            leftIcon={<ImageIcon className="w-4 h-4 text-textSecondary" />}
          />

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded text-navy focus:ring-navy w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-navy">Mark as Featured Title</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                className="rounded text-navy focus:ring-navy w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-navy">Mark as Best Seller</span>
            </label>
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
              {editId ? 'Update Book' : 'Publish Book'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
