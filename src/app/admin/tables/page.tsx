'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuthFetcher } from '@/hooks/useRealtime';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/Skeleton';

interface Table {
  id: string;
  number: number;
  label: string | null;
  status: string;
  capacity: number;
}

export default function AdminTablesPage() {
  const authFetcher = useAuthFetcher();
  const { data, isLoading } = useSWR('/api/tables', authFetcher);
  const [showForm, setShowForm] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [qrTableId, setQrTableId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  const tables: Table[] = data || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this table?')) return;
    const token = localStorage.getItem('auth-token');
    await fetch(`/api/tables/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    mutate('/api/tables');
  };

  const showQR = async (tableId: string) => {
    const token = localStorage.getItem('auth-token');
    const res = await fetch(`/api/tables/${tableId}/qr`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (d.success) {
      setQrSvg(d.data.qrCodeDataUrl);
      setQrTableId(tableId);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
        <Button onClick={() => { setEditTable(null); setShowForm(true); }}>+ Add Table</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-gray-900">Table {table.number}</span>
                <StatusBadge status={table.status} variant="table" />
              </div>
              {table.label && (
                <span className="text-sm text-gray-500 mb-1">{table.label}</span>
              )}
              <span className="text-sm text-gray-400 mb-3">Capacity: {table.capacity}</span>
              <div className="flex gap-1 mt-auto">
                <button
                  onClick={() => showQR(table.id)}
                  className="flex-1 text-xs px-2 py-1.5 min-h-[36px] bg-blue-50 text-blue-600 rounded-lg font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                >
                  QR Code
                </button>
                <button
                  onClick={() => { setEditTable(table); setShowForm(true); }}
                  className="flex-1 text-xs px-2 py-1.5 min-h-[36px] bg-gray-100 text-gray-600 rounded-lg font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  aria-label={`Delete table ${table.number}`}
                  className="text-xs px-2 py-1.5 min-h-[36px] bg-red-50 text-red-600 rounded-lg font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrTableId && qrSvg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full">
            <h2 id="qr-modal-title" className="text-lg font-semibold text-gray-900 mb-4">
              Table {tables.find(t => t.id === qrTableId)?.number} QR Code
            </h2>
            <img
              src={qrSvg}
              alt={`QR code for table ${tables.find(t => t.id === qrTableId)?.number}`}
              width={256}
              height={256}
              className="inline-block bg-white p-4 rounded-lg w-64 h-64"
            />
            <p className="text-xs text-gray-400 mt-3 mb-4">Scan to start ordering</p>
            <Button variant="secondary" onClick={() => { setQrTableId(null); setQrSvg(null); }}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TableFormModal
          table={editTable}
          onClose={() => { setShowForm(false); setEditTable(null); }}
        />
      )}
    </div>
  );
}

function TableFormModal({ table, onClose }: { table: Table | null; onClose: () => void }) {
  const [number, setNumber] = useState(table?.number || 0);
  const [label, setLabel] = useState(table?.label || '');
  const [capacity, setCapacity] = useState(table?.capacity || 4);
  const [status, setStatus] = useState(table?.status || 'AVAILABLE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('auth-token');
    const url = table ? `/api/tables/${table.id}` : '/api/tables';
    const method = table ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        number: Number(number),
        label: label || undefined,
        capacity: Number(capacity),
        ...(table ? { status } : {}),
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error?.message || 'Failed');
      setLoading(false);
      return;
    }

    mutate('/api/tables');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="table-form-title">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 id="table-form-title" className="text-lg font-semibold text-gray-900">{table ? 'Edit Table' : 'Add Table'}</h2>

        <div>
          <label htmlFor="tbl-number" className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
          <input
            id="tbl-number"
            name="number"
            type="number"
            min="1"
            value={number}
            onChange={e => setNumber(Number(e.target.value))}
            placeholder="1"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="tbl-label" className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            id="tbl-label"
            name="label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Window, Patio\u2026"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="tbl-capacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <input
            id="tbl-capacity"
            name="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={e => setCapacity(Number(e.target.value))}
            placeholder="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>
        {table && (
          <div>
            <label htmlFor="tbl-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="tbl-status"
              name="status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="RESERVED">Reserved</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {table ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
