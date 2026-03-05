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
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <header className="mb-8">
        <h1 className="text-[28px] font-black text-stone-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-[14px] font-medium text-stone-500 mt-1">Real-time performance metrics</p>
      </header>

      {error && (
        <div className="bg-red-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-red-700 font-medium">Failed to load dashboard data</p>
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Revenue Today"
          value={isLoading ? null : formatCurrency(metrics?.todayRevenue || 0)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Orders Today"
          value={isLoading ? null : String(metrics?.todayOrders || 0)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          color="text-[#ea580c] bg-orange-50"
        />
        <MetricCard
          title="Active Orders"
          value={isLoading ? null : String(metrics?.activeOrders || 0)}
          icon={<svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>}
          color="text-indigo-600 bg-indigo-50"
        />
        <MetricCard
          title="Pending Payments"
          value={isLoading ? null : String(metrics?.pendingPayments || 0)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Tables Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 border border-stone-100/80">
          <h2 className="text-[14px] font-bold uppercase tracking-widest text-stone-400 mb-6">Table Utilization</h2>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full rounded-lg bg-stone-100" />
              <Skeleton className="h-6 w-3/4 rounded-lg bg-stone-100" />
            </div>
          ) : (
            <div className="flex items-center justify-around mt-4">
              <div className="text-center">
                <div className="text-[36px] md:text-[42px] font-black text-emerald-500 tabular-nums leading-none">{(metrics?.totalTables || 0) - (metrics?.occupiedTables || 0)}</div>
                <div className="text-[13px] font-bold tracking-wide uppercase text-stone-400 mt-2">Available</div>
              </div>
              <div className="h-16 w-px bg-stone-100"></div>
              <div className="text-center">
                <div className="text-[36px] md:text-[42px] font-black text-[#ea580c] tabular-nums leading-none">{metrics?.occupiedTables || 0}</div>
                <div className="text-[13px] font-bold tracking-wide uppercase text-stone-400 mt-2">Occupied</div>
              </div>
              <div className="h-16 w-px bg-stone-100"></div>
              <div className="text-center">
                <div className="text-[36px] md:text-[42px] font-black text-stone-300 tabular-nums leading-none">{metrics?.totalTables || 0}</div>
                <div className="text-[13px] font-bold tracking-wide uppercase text-stone-400 mt-2">Total</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 border border-stone-100/80">
          <h2 className="text-[14px] font-bold uppercase tracking-widest text-stone-400 mb-6">Payment Breakdown</h2>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full rounded-lg bg-stone-100" />
              <Skeleton className="h-6 w-3/4 rounded-lg bg-stone-100" />
            </div>
          ) : metrics?.paymentBreakdown?.length > 0 ? (
            <div className="space-y-5">
              {metrics.paymentBreakdown.map((pb: { method: string; total: number; count: number }) => (
                <div key={pb.method} className="flex items-center justify-between pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-500 font-bold text-lg">
                      {pb.method === 'UPI' ? 'U' : pb.method === 'CASH' ? '₹' : 'C'}
                    </div>
                    <div>
                      <div className="font-bold text-[15px] text-stone-900">{pb.method.replace(/_/g, ' ')}</div>
                      <div className="text-[13px] font-medium text-stone-400">{pb.count} orders</div>
                    </div>
                  </div>
                  <span className="font-black text-[18px] text-stone-900 tabular-nums">{formatCurrency(pb.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-4xl grayscale opacity-30 mb-4" aria-hidden="true">🧾</span>
              <p className="text-stone-500 font-medium text-[15px]">No payments settled today.</p>
            </div>
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
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-100/80 transition-transform hover:-translate-y-1 duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-[13px] font-bold uppercase tracking-widest text-stone-400 truncate pr-2">{title}</span>
      </div>
      {value === null ? (
        <Skeleton className="h-10 w-24 rounded-lg bg-stone-100" />
      ) : (
        <div className="text-[32px] font-black tracking-tight text-stone-900 tabular-nums leading-none">{value}</div>
      )}
    </div>
  );
}
