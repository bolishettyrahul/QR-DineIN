'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    name: '',
    taxRate: 5,
    currency: 'INR',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load current settings from localStorage (or API in future)
    const stored = localStorage.getItem('restaurant-settings');
    if (stored) {
      try {
        setForm(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save to localStorage (would be API call with restaurant table)
    localStorage.setItem('restaurant-settings', JSON.stringify(form));

    // Simulate API call
    await new Promise(r => setTimeout(r, 500));

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Settings</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label htmlFor="setting-name" className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
          <input
            id="setting-name"
            name="name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="My Restaurant\u2026"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="setting-tax" className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
          <input
            id="setting-tax"
            name="taxRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.taxRate}
            onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
          <p className="text-xs text-gray-400 mt-1">Applied to all orders (GST)</p>
        </div>

        <div>
          <label htmlFor="setting-currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            id="setting-currency"
            name="currency"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Database</span>
              <span className="text-gray-700 font-mono text-xs">PostgreSQL (Supabase)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Realtime</span>
              <span className="text-gray-700 font-mono text-xs">Supabase Channels</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auth</span>
              <span className="text-gray-700 font-mono text-xs">JWT (jose)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading}>
            Save Settings
          </Button>
          {saved && (
            <span role="status" aria-live="polite" className="text-sm text-green-600 font-medium">Saved successfully!</span>
          )}
        </div>
      </form>

      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seed Admin Account</h2>
        <p className="text-sm text-gray-500 mb-4">
          To create your initial admin account, run the following command:
        </p>
        <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">
{`npx prisma db seed
# Or manually via Prisma Studio:
npx prisma studio`}
        </pre>
      </div>
    </div>
  );
}
