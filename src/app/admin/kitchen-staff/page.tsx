'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuthFetcher } from '@/hooks/useRealtime';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { ConfirmModal } from '@/components/ConfirmModal';

interface KitchenStaff {
  id: string;
  name: string;
  pin: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminKitchenStaffPage() {
  const authFetcher = useAuthFetcher();
  const { data, isLoading } = useSWR('/api/admin/kitchen-staff', authFetcher);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const staff: KitchenStaff[] = data || [];

  const executeDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('auth-token');
    await fetch(`/api/admin/kitchen-staff/${deleteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    mutate('/api/admin/kitchen-staff');
    setDeleteId(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Staff</h1>
        <Button onClick={() => setShowForm(true)}>+ Add Staff</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          No kitchen staff yet. Add one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{s.name}</div>
                <div className="text-sm text-gray-500">
                  PIN: {s.pin} · Added {new Date(s.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
              {s.isActive && (
                <button
                  onClick={() => setDeleteId(s.id)}
                  className="text-xs px-3 py-1.5 min-h-[36px] bg-red-50 text-red-600 rounded-lg font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                >
                  Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && <StaffFormModal onClose={() => setShowForm(false)} />}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Deactivate Staff"
        message="Are you sure you want to deactivate this staff member? They will no longer be able to log in to the kitchen displays."
        confirmText="Deactivate"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function StaffFormModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('auth-token');
    const res = await fetch('/api/admin/kitchen-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, pin }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.error?.message || 'Failed');
      setLoading(false);
      return;
    }
    mutate('/api/admin/kitchen-staff');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="staff-form-title">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 id="staff-form-title" className="text-lg font-semibold text-gray-900">Add Kitchen Staff</h2>

        <div>
          <label htmlFor="staff-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            id="staff-name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Staff name\u2026"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="staff-pin" className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
          <input
            id="staff-pin"
            name="pin"
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="0000"
            required
            maxLength={4}
            pattern="\d{4}"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 font-mono tracking-widest text-center text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
          <p className="text-xs text-gray-400 mt-1">Used to log into the kitchen display</p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Create</Button>
        </div>
      </form>
    </div>
  );
}
