'use client';

import useSWR from 'swr';
import { useAuthFetcher } from '@/hooks/useRealtime';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/Skeleton';

export default function AdminDashboard() {
  const authFetcher = useAuthFetcher();
  const { data: metrics, error, isLoading } = useSWR('/api/admin/metrics', authFetcher, {
    refreshInterval: 30000,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-red-700 font-medium">Failed to load dashboard data</p>
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Money Collected Today"
          value={isLoading ? null : formatCurrency(metrics?.todayRevenue || 0)}
          icon="₹"
          color="bg-green-50 text-green-700"
        />
        <MetricCard
          title="Total Orders Today"
          value={isLoading ? null : String(metrics?.todayOrders || 0)}
          icon="#"
          color="bg-blue-50 text-blue-700"
        />
        <MetricCard
          title="Active Orders"
          value={isLoading ? null : String(metrics?.activeOrders || 0)}
          icon="●"
          color="bg-orange-50 text-orange-700"
        />
        <MetricCard
          title="Pending Payments"
          value={isLoading ? null : String(metrics?.pendingPayments || 0)}
          icon="⏳"
          color="bg-yellow-50 text-yellow-700"
        />
      </div>

      {/* Tables Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Table Status</h2>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 tabular-nums">{(metrics?.totalTables || 0) - (metrics?.occupiedTables || 0)}</div>
                <div className="text-sm text-gray-500">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 tabular-nums">{metrics?.occupiedTables || 0}</div>
                <div className="text-sm text-gray-500">Occupied</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400 tabular-nums">{metrics?.totalTables || 0}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h2>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : metrics?.paymentBreakdown?.length > 0 ? (
            <div className="space-y-3">
              {metrics.paymentBreakdown.map((pb: { method: string; total: number; count: number }) => (
                <div key={pb.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">{pb.method === 'UPI' ? '\u21C4' : pb.method === 'CASH' ? '\u20B9' : '\u2302'}</span>
                    <span className="text-sm font-medium text-gray-700">{pb.method.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-400 tabular-nums">({pb.count} orders)</span>
                  </div>
                  <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(pb.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No payments today yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | null;
  icon: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span aria-hidden="true" className="text-xl">{icon}</span>
        <span className="text-sm font-medium opacity-80">{title}</span>
      </div>
      {value === null ? (
        <Skeleton className="h-8 w-24 bg-white/30" />
      ) : (
        <div className="text-2xl font-bold tabular-nums">{value}</div>
      )}
    </div>
  );
}
