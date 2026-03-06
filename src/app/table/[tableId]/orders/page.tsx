'use client';

import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { swrFetcher } from '@/hooks/useRealtime';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderCardSkeleton } from '@/components/Skeleton';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes: string | null;
}

interface Order {
    id: string;
    orderNumber: number;
    status: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
    payment: { status: string; method: string } | null;
}

interface SessionData {
    id: string;
    status: string;
    table: { id: string; number: number; label: string | null };
    orders: Order[];
}

function getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const data = localStorage.getItem('qr-dine-session');
        if (!data) return null;
        return JSON.parse(data).sessionId || null;
    } catch {
        return null;
    }
}

export default function MyOrdersPage({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = use(params);
    const sessionId = getSessionId();

    const { data: session, isLoading } = useSWR<SessionData>(
        sessionId ? `/api/sessions/${sessionId}` : null,
        swrFetcher,
        { refreshInterval: 10000 }
    );

    const orders = session?.orders || [];
    const activeOrders = orders.filter(o => o.status !== 'CANCELLED');

    const grandSubtotal = activeOrders.reduce((sum, o) => sum + Number(o.subtotal), 0);
    const grandTax = activeOrders.reduce((sum, o) => sum + Number(o.taxAmount), 0);
    const grandTotal = activeOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    if (!sessionId) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <div className="text-center animate-fade-in-up">
                    <div className="text-6xl mb-6 grayscale opacity-80">📋</div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">No active session</h2>
                    <p className="text-stone-500 mb-8 font-medium">Please scan the QR code to start ordering.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50">
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-4 border-b border-stone-100">
                        <Link href={`/table/${tableId}/menu`} className="text-stone-400 hover:text-stone-900 transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-stone-100">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">My Orders</h1>
                    </div>
                </header>
                <main className="max-w-lg mx-auto px-5 py-6 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <OrderCardSkeleton key={i} />
                    ))}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FCFBFA] pb-44 font-sans antialiased text-stone-900">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-40 border-b border-stone-100/80">
                <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/table/${tableId}/menu`} className="text-stone-400 hover:text-stone-900 transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-stone-50 font-bold active:scale-95">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-stone-900">My Orders</h1>
                            <p className="text-[11px] font-bold text-stone-400 mt-0.5 uppercase tracking-widest">
                                Table {session?.table?.number} • {activeOrders.length} Order{activeOrders.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in-up">
                        <div className="text-6xl mb-6 grayscale opacity-80 mix-blend-multiply">🍽️</div>
                        <h2 className="text-[22px] font-black tracking-tight mb-2">No orders yet</h2>
                        <p className="text-[15px] font-medium text-stone-500 mb-8">Your orders will appear here.</p>
                        <Link
                            href={`/table/${tableId}/menu`}
                            className="inline-block py-4 px-8 bg-stone-900 text-white rounded-[16px] text-[15px] font-bold hover:bg-stone-800 transition-all active:scale-[0.98] shadow-elegant tracking-wide"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Individual Orders */}
                        {orders.map((order, index) => (
                            <div
                                key={order.id}
                                className={`bg-white rounded-[24px] p-6 shadow-sm border border-stone-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow animate-fade-in-up ${order.status === 'CANCELLED' ? 'opacity-50 grayscale' : ''
                                    }`}
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-stone-100/60">
                                    <div>
                                        <h3 className="font-black text-stone-900 text-[19px] tracking-tight">
                                            Order #{order.orderNumber}
                                        </h3>
                                        <p className="text-[12px] uppercase tracking-widest text-stone-400 font-bold mt-1">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="self-start sm:self-center">
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-start text-[15px]">
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold text-stone-800 leading-snug">{item.name}</span>
                                                    <span className="text-stone-400 font-medium">×{item.quantity}</span>
                                                </div>
                                                {item.notes && (
                                                    <p className="text-[13px] font-medium text-stone-400 mt-1 leading-relaxed">{item.notes}</p>
                                                )}
                                            </div>
                                            <span className="font-black text-stone-900 tabular-nums shrink-0 mt-0.5">
                                                {formatCurrency(Number(item.price) * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-stone-50/50 rounded-[16px] p-4 flex justify-between items-center border border-stone-100/50">
                                    <span className="text-[14px] font-bold text-stone-500 uppercase tracking-widest">Order Total</span>
                                    <span className="font-black text-[20px] text-stone-900 tabular-nums">
                                        {formatCurrency(Number(order.totalAmount))}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                    {order.payment?.status === 'COMPLETED' ? (
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-green-700 bg-green-50 rounded-full px-4 py-2 border border-green-100/80 w-full sm:w-auto justify-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> PAID
                                        </div>
                                    ) : (
                                        <div />
                                    )}

                                    {/* Link to track individual order */}
                                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                                        <Link
                                            href={`/table/${tableId}/order-status?orderId=${order.id}`}
                                            className="w-full sm:w-auto text-center px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-[14px] text-[14px] transition-colors active:scale-95"
                                        >
                                            <span className="flex items-center gap-1 justify-center">Track Order <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Grand Total Card */}
                        {activeOrders.length > 0 && (
                            <div className="bg-stone-900 text-white rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.15)] animate-fade-in-up mt-8" style={{ animationDelay: `${orders.length * 80}ms` }}>
                                <h3 className="font-black text-[22px] mb-6 tracking-tight flex items-center gap-3">
                                    Running Bill
                                    <span className="text-[10px] bg-white/15 px-2.5 py-1 rounded-full uppercase tracking-widest">{activeOrders.length} Orders</span>
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[15px] font-bold text-stone-400">
                                        <span>Subtotal</span>
                                        <span className="tabular-nums text-white text-[16px]">{formatCurrency(grandSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[15px] font-bold text-stone-400">
                                        <span>Tax</span>
                                        <span className="tabular-nums text-white text-[16px]">{formatCurrency(grandTax)}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-5 mt-5 flex justify-between items-center">
                                        <span className="font-black text-white text-[18px] uppercase tracking-widest">Grand Total</span>
                                        <span className="font-black text-[32px] tracking-tight tabular-nums text-[#ea580c] drop-shadow-sm">
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-5 md:p-8 bg-gradient-to-t from-[#FCFBFA] via-[#FCFBFA]/90 to-transparent z-50 pointer-events-none pb-safe">
                <div className="max-w-2xl mx-auto pointer-events-auto animate-fade-in-up flex justify-center md:justify-end">
                    <Link
                        href={`/table/${tableId}/menu`}
                        className="group flex-1 md:flex-none md:w-[280px] flex items-center justify-between px-6 py-4 bg-[#ea580c] hover:bg-[#d94a06] text-white rounded-[16px] shadow-[0_10px_25px_rgba(234,88,12,0.3)] outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50 active:scale-[0.98] transition-all font-bold text-[16px] tracking-wide"
                    >
                        <span>Order More</span>
                        <span className="text-xl group-hover:translate-x-1 transition-transform flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
