'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuthFetcher } from '@/hooks/useRealtime';
import { formatCurrency, ORDER_STATUS_DISPLAY } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/Skeleton';

export default function AdminOrdersPage() {
  const authFetcher = useAuthFetcher();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) query.set('status', status);

  const { data, isLoading } = useSWR(`/api/orders?${query}`, authFetcher, {
    refreshInterval: 10000,
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setStatus(''); setPage(1); }}
          className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
            !status ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All
        </button>
        {Object.entries(ORDER_STATUS_DISPLAY).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setStatus(key); setPage(1); }}
            className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              status === key ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Order #</th>
                  <th className="px-4 py-3 text-left">Table</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order: Record<string, unknown>) => (
                  <tr key={order.id as string} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {(order.id as string).slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Table {(order.table as Record<string, unknown>)?.number
                        ? ((order.table as Record<string, unknown>).number as number)
                        : '?'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(order.items as Array<Record<string, unknown>>)?.length || 0} items
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(order.totalAmount as number)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={order.status as string} variant="order" />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt as string).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 min-h-[44px] rounded-lg text-sm bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500 tabular-nums">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-3 py-1.5 min-h-[44px] rounded-lg text-sm bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
