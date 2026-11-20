import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, BookOpen } from 'lucide-react';
import api from '../../services/api';
import { Book, Category } from '../../types';
import { handleBookImageError } from '../../utils/imageFallbacks';

export const AdminBooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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
    api.get(`/admin/books?search=${search}`).then((res) => {
      if (res.data.success) {
        setBooks(res.data.data.books);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.data.success) setCategories(res.data.data.categories);
    });
    fetchBooks();
  }, [search]);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      title: '',
      author: '',
      description: '',
      categoryId: categories[0]?._id || '',
      publisher: 'Independent',
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
      publisher: b.publisher,
      isbn: b.isbn,
      language: b.language,
      pages: b.pages,
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
    try {
      if (editId) {
        await api.patch(`/admin/books/${editId}`, form);
      } else {
        await api.post('/admin/books', form);
      }
      setShowModal(false);
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving book');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this book permanently?')) return;
    try {
      await api.delete(`/admin/books/${id}`);
      fetchBooks();
    } catch (err: any) {
      alert('Failed to delete book');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy">Books Management</h1>
          <p className="text-xs text-gray-500">Catalog of physical paperbacks and instant digital eBooks</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-golden" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-gray-200 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search book title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-gray-500 font-semibold">{books.length} Books in Catalog</span>
      </div>

      {/* Books Table */}
      <div className="bg-surface rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-navy font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Book Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock / Digital</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <img src={b.coverImage} alt={b.title} className="w-10 h-14 object-cover rounded bg-gray-100 flex-shrink-0" onError={handleBookImageError} />
                    <div>
                      <p className="font-bold text-navy line-clamp-1">{b.title}</p>
                      <p className="text-gray-500">by {b.author}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.type === 'ebook' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-navy'
                      }`}
                    >
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-navy">₹{b.pricing.price}</td>
                  <td className="py-3 px-4">
                    {b.type === 'physical' ? (
                      <span className={`font-semibold ${b.physical?.stock! <= 5 ? 'text-red-600' : 'text-navy'}`}>
                        {b.physical?.stock} in stock
                      </span>
                    ) : (
                      <span className="text-green-700 font-semibold">Instant Download</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1 text-gray-500 hover:text-navy"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-bold text-navy text-lg">{editId ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Product Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="physical">Physical Book</option>
                    <option value="ebook">Digital eBook</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock (Physical)</label>
                  <input
                    type="number"
                    disabled={form.type === 'ebook'}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  required
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded text-navy"
                  />
                  <span>Mark as Featured</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                    className="rounded text-navy"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-navy text-white rounded-lg font-bold hover:bg-navy-light"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
