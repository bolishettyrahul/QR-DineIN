'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuthFetcher } from '@/hooks/useRealtime';
import { Button } from '@/components/Button';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/Skeleton';

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string | null;
  categoryId: string;
  category: Category;
}

export default function AdminMenuPage() {
  const authFetcher = useAuthFetcher();
  const { data: menuData, isLoading: menuLoading } = useSWR('/api/menu', authFetcher);
  const { data: catData } = useSWR('/api/categories', authFetcher);

  const [showItemForm, setShowItemForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const categories: Category[] = catData || [];
  const allItems: MenuItem[] =
    menuData?.flatMap((cat: { items: MenuItem[] }) => cat.items) || [];

  const filteredItems = allItems.filter(item => {
    if (filter === 'available') return item.isAvailable;
    if (filter === 'unavailable') return !item.isAvailable;
    return true;
  });

  const toggleAvailability = async (item: MenuItem) => {
    const token = localStorage.getItem('auth-token');
    await fetch(`/api/menu/${item.id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    mutate('/api/menu');
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    const token = localStorage.getItem('auth-token');
    await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    mutate('/api/menu');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowCatForm(true)}>
            + Category
          </Button>
          <Button onClick={() => { setEditingItem(null); setShowItemForm(true); }}>
            + Menu Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'available', 'unavailable'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              filter === f
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">{filteredItems.length} items</span>
      </div>

      {/* Items */}
      {menuLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${!item.isAvailable ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  {!item.isAvailable && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Unavailable</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{item.category?.name}</div>
              </div>
              <div className="font-semibold text-gray-900">{formatCurrency(item.price)}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleAvailability(item)}
                  className={`px-2 py-1.5 min-h-[36px] text-xs rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 ${
                    item.isAvailable ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}
                >
                  {item.isAvailable ? 'Mark Out' : 'Mark In'}
                </button>
                <button
                  onClick={() => { setEditingItem(item); setShowItemForm(true); }}
                  className="px-2 py-1.5 min-h-[36px] text-xs bg-gray-100 text-gray-600 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  aria-label={`Delete ${item.name}`}
                  className="px-2 py-1.5 min-h-[36px] text-xs bg-red-50 text-red-600 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      {showCatForm && (
        <CategoryFormModal
          onClose={() => setShowCatForm(false)}
        />
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemFormModal
          categories={categories}
          item={editingItem}
          onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('auth-token');
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, sortOrder }),
    });
    mutate('/api/categories');
    mutate('/api/menu');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="cat-form-title">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 id="cat-form-title" className="text-lg font-semibold text-gray-900">New Category</h2>
        <div>
          <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            id="cat-name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Category name\u2026"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="cat-sort" className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            id="cat-sort"
            name="sortOrder"
            type="number"
            value={sortOrder}
            onChange={e => setSortOrder(Number(e.target.value))}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Save</Button>
        </div>
      </form>
    </div>
  );
}

function ItemFormModal({
  categories,
  item,
  onClose,
}: {
  categories: Category[];
  item: MenuItem | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    isVeg: item?.isVeg ?? true,
    categoryId: item?.categoryId || categories[0]?.id || '',
    imageUrl: item?.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('auth-token');
    const url = item ? `/api/menu/${item.id}` : '/api/menu';
    const method = item ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
      }),
    });
    mutate('/api/menu');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto overscroll-contain">
        <h2 id="item-form-title" className="text-lg font-semibold text-gray-900">
          {item ? 'Edit Item' : 'New Menu Item'}
        </h2>

        <div>
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            id="item-name"
            name="name"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Item name\u2026"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="item-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="item-desc"
            name="description"
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Description (optional)\u2026"
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="item-price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            id="item-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={e => update('price', e.target.value)}
            placeholder="0.00"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="item-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="item-category"
            name="categoryId"
            value={form.categoryId}
            onChange={e => update('categoryId', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="item-image" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            id="item-image"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={e => update('imageUrl', e.target.value)}
            placeholder="https://\u2026"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isVeg"
            checked={form.isVeg}
            onChange={e => update('isVeg', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer focus-visible:ring-2 focus-visible:ring-green-500"
          />
          <span className="text-gray-700">Vegetarian</span>
        </label>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {item ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
