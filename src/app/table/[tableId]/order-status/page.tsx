'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { swrFetcher } from '@/hooks/useRealtime';
import { useRealtimeSubscription } from '@/hooks/useRealtime';
import { formatCurrency, ORDER_STATUS_DISPLAY } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderCardSkeleton } from '@/components/Skeleton';

const STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

export default function OrderStatusPage({ params }: { params: { tableId: string } }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order, mutate, isLoading } = useSWR(
    orderId ? `/api/orders/${orderId}` : null,
    swrFetcher,
    { refreshInterval: 15000 }
  );

  // Subscribe to realtime updates for this order
  useRealtimeSubscription(
    `order-status-${orderId}`,
    'orders',
    'UPDATE',
    () => {
      mutate();
    },
    orderId ? `id=eq.${orderId}` : undefined
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-gray-900">Order Status</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-4">
          <OrderCardSkeleton />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4" aria-hidden="true">—</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Link
            href={`/table/${params.tableId}/menu`}
            className="text-orange-600 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
          >
            Go to menu
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500">Table {order.table?.number}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Status Stepper */}
        {!isCancelled && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Order Progress</h3>
            <div className="relative">
              {STEPS.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step} className="flex items-start mb-6 last:mb-0">
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCurrent
                            ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                            : isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isActive && !isCurrent ? <span aria-hidden="true">✓</span> : index + 1}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 ${isActive ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className={`pt-1 ${isCurrent ? 'text-gray-900' : isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                      <p className={`text-sm font-medium ${isCurrent ? 'text-orange-600' : ''}`}>
                        {ORDER_STATUS_DISPLAY[step] || step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2" aria-hidden="true">✖</div>
            <h3 className="font-bold text-red-800 mb-1">Order Cancelled</h3>
            <p className="text-sm text-red-600">This order has been cancelled.</p>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Items</h3>
          <div className="space-y-3">
            {order.items?.map((item: { id: string; name: string; quantity: number; price: number; notes: string | null; menuItem?: { isVeg: boolean } }) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] ${
                      item.menuItem?.isVeg ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                    }`}>●</span>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-gray-500 ml-5">{item.notes}</p>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span className="tabular-nums">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment button */}
        {order.status !== 'CANCELLED' && !order.payment && (
          <Link
            href={`/table/${params.tableId}/checkout?orderId=${order.id}`}
            className="block w-full py-4 px-6 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors text-center text-lg tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Pay {formatCurrency(order.totalAmount)}
          </Link>
        )}

        {order.payment?.status === 'COMPLETED' && (
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2" aria-hidden="true">✔</div>
            <p className="font-medium text-green-800">Payment Complete</p>
          </div>
        )}

        {/* Back to menu */}
        <Link
          href={`/table/${params.tableId}/menu`}
          className="block text-center text-orange-600 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
        >
          Order more items
        </Link>
      </main>
    </div>
  );
}
