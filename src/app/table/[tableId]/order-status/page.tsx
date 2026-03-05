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
      <div className="min-h-screen bg-[#FCFBFA] font-sans">
        <header className="bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-40 border-b border-stone-100/80">
          <div className="max-w-2xl mx-auto px-5 py-4">
            <h1 className="text-[20px] font-black tracking-tight text-stone-900">Order Status</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-5 py-6">
          <OrderCardSkeleton />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FCFBFA] font-sans flex items-center justify-center p-6">
        <div className="text-center animate-fade-in-up">
          <div className="text-6xl mb-6 grayscale opacity-80 mix-blend-multiply" aria-hidden="true">🍽️</div>
          <h2 className="text-[22px] font-black tracking-tight text-stone-900 mb-3">Order not found</h2>
          <Link
            href={`/table/${params.tableId}/menu`}
            className="inline-block py-4 px-8 bg-[#ea580c] text-white rounded-[16px] text-[15px] font-bold hover:bg-[#d94a06] transition-all shadow-elegant"
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
    <div className="min-h-screen bg-[#FCFBFA] font-sans pb-32">
      <header className="bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-40 border-b border-stone-100/80">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/table/${params.tableId}/orders`} className="text-stone-400 hover:text-stone-900 transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-stone-50 font-bold active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-[20px] font-black tracking-tight text-stone-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-[11px] font-bold text-stone-400 mt-0.5 uppercase tracking-widest">Table {order.table?.number}</p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        {/* Status Stepper */}
        {!isCancelled && (
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-stone-100 animate-fade-in-up">
            <h3 className="text-[14px] font-bold tracking-widest uppercase text-stone-400 mb-8">Live Progress</h3>
            <div className="relative pl-2">
              {STEPS.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const animDelay = `${index * 150}ms`;

                return (
                  <div key={step} className="flex flex-col relative pb-8 last:pb-0" style={{ animationDelay: animDelay }} >
                    <div className="flex items-start">
                      {/* Timeline Line */}
                      {index < STEPS.length - 1 && (
                        <div className={`absolute left-[11px] top-8 bottom-0 w-0.5 rounded-full ${isActive ? 'bg-[#ea580c]/30' : 'bg-stone-100'}`} />
                      )}

                      {/* Icon Bubble */}
                      <div
                        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-500 ${isCurrent
                          ? 'bg-[#ea580c] ring-8 ring-orange-100 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                          : isActive
                            ? 'bg-[#ea580c]'
                            : 'bg-stone-200'
                          }`}
                      >
                        {isActive && !isCurrent ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                        ) : null}
                      </div>

                      {/* Text */}
                      <div className="ml-6">
                        <p className={`text-[17px] font-black tracking-tight transition-colors duration-500 ${isCurrent ? 'text-[#ea580c]' : isActive ? 'text-stone-900' : 'text-stone-300'}`}>
                          {ORDER_STATUS_DISPLAY[step] || step}
                        </p>
                        {isCurrent && (
                          <p className="text-[13px] font-medium text-stone-500 mt-1 animate-fade-in-up">
                            {step === 'PLACED' && "We've received your order."}
                            {step === 'CONFIRMED' && "Kitchen has acknowledged it."}
                            {step === 'PREPARING' && "Our chefs are cooking your meal."}
                            {step === 'READY' && "Ready to be served at your table!"}
                            {step === 'COMPLETED' && "Enjoy your meal!"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50/50 rounded-[24px] p-8 text-center border border-red-100">
            <div className="text-5xl mb-4 grayscale opacity-80 mix-blend-multiply" aria-hidden="true">✖</div>
            <h3 className="font-black text-[22px] text-red-900 mb-2">Order Cancelled</h3>
            <p className="text-[15px] text-red-700/80 font-medium">This order has been cancelled.</p>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-stone-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-[14px] font-bold tracking-widest uppercase text-stone-400 mb-5">Order Details</h3>
          <div className="space-y-4">
            {order.items?.map((item: { id: string; name: string; quantity: number; price: number; notes: string | null; menuItem?: { isVeg: boolean } }) => (
              <div key={item.id} className="flex justify-between items-start text-[15px]">
                <div className="flex-1 pr-4">
                  <div className="flex items-start gap-2.5">
                    {item.menuItem?.isVeg ? (
                      <span className="w-3.5 h-3.5 mt-0.5 rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 border-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 mt-0.5 rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 border-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      </span>
                    )}
                    <span className="font-bold text-stone-800 leading-snug">{item.name}</span>
                    <span className="text-stone-400 font-medium">x{item.quantity}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[13px] font-medium text-stone-400 mt-1.5 ml-6 leading-relaxed bg-stone-50 p-2 rounded-lg border border-stone-100">{item.notes}</p>
                  )}
                </div>
                <span className="font-black text-stone-900 tabular-nums shrink-0 mt-0.5">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 mt-6 pt-5 space-y-3">
            <div className="flex justify-between text-[14px] font-medium text-stone-500">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[14px] font-medium text-stone-500">
              <span>Tax</span>
              <span className="tabular-nums">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center bg-stone-50 p-4 rounded-[16px] border border-stone-100/50 mt-2">
              <span className="font-bold text-[14px] tracking-widest uppercase text-stone-900">Total</span>
              <span className="font-black text-[22px] text-stone-900 tabular-nums">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {order.payment?.status === 'COMPLETED' ? (
            <div className="bg-green-50 rounded-[16px] p-5 text-center border border-green-100 flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">✓</div>
              <p className="font-black text-[16px] text-green-800">Payment Complete</p>
            </div>
          ) : order.status !== 'CANCELLED' && !order.payment ? (
            <Link
              href={`/table/${params.tableId}/checkout?orderId=${order.id}`}
              className="group flex w-full items-center justify-between px-6 py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-[16px] shadow-elegant outline-none focus-visible:ring-4 focus-visible:ring-stone-500/50 active:scale-[0.98] transition-all"
            >
              <span className="font-bold text-[16px] tracking-wide">Pay Now</span>
              <span className="font-black text-[18px] tabular-nums group-hover:-translate-y-0.5 transition-transform">{formatCurrency(order.totalAmount)}</span>
            </Link>
          ) : null}

          <div className="flex gap-3">
            <Link
              href={`/table/${params.tableId}/menu`}
              className="flex-1 text-center py-4 bg-white border border-stone-200 text-stone-700 font-bold rounded-[16px] hover:bg-stone-50 transition-colors active:scale-[0.98] text-[15px]"
            >
              Order More
            </Link>
            <Link
              href={`/table/${params.tableId}/orders`}
              className="flex-1 text-center py-4 bg-white border border-stone-200 text-stone-700 font-bold rounded-[16px] hover:bg-stone-50 transition-colors active:scale-[0.98] text-[15px]"
            >
              All Orders
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
