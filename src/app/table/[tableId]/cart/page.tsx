'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, generateIdempotencyKey } from '@/lib/utils';
import { Button } from '@/components/Button';

export default function CartPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const { items, updateQuantity, updateNotes, removeItem, clearCart, subtotal } = useCart(params.tableId);
  const [specialNotes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Get session from localStorage
      const sessionData = localStorage.getItem('qr-dine-session');
      if (!sessionData) {
        setError('Session expired. Please scan the QR code again.');
        return;
      }

      const { sessionId, tableId } = JSON.parse(sessionData);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          sessionId,
          tableId,
          items: items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes,
          })),
          specialNotes: specialNotes || undefined,
          idempotencyKey: generateIdempotencyKey(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Failed to place order');
        return;
      }

      clearCart();
      router.push(`/table/${params.tableId}/order-status?orderId=${data.data.id}`);
    } catch {
      setError('Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center animate-fade-in-up">
          <div className="text-6xl mb-6 grayscale opacity-80 mix-blend-multiply">🛒</div>
          <h2 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">Your cart is empty</h2>
          <p className="text-stone-500 mb-8 font-medium">Add items from the menu to get started.</p>
          <Link
            href={`/table/${params.tableId}/menu`}
            className="inline-block py-4 px-8 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-[0.98] shadow-elegant tracking-wide"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] pb-32 font-sans text-stone-900 antialiased">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.02)] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between border-b border-stone-100">
          <div className="flex items-center gap-4">
            <Link href={`/table/${params.tableId}/menu`} className="text-stone-400 hover:text-stone-900 transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-stone-100 font-bold active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-2xl font-black tracking-tight">Your Cart</h1>
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">{items.length} Items</span>
        </div>
      </header>

      {/* Cart Items */}
      <main className="max-w-2xl mx-auto px-5 py-8 space-y-5">
        {items.map((item, index) => (
          <div key={item.menuItemId} className="bg-white rounded-[24px] p-6 shadow-sm border border-stone-100 animate-fade-in-up hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`w-4 h-4 rounded-[4px] border-[2px] flex items-center justify-center ${item.isVeg ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                  </span>
                  <h3 className="font-bold text-[18px] tracking-tight">{item.name}</h3>
                </div>
                <p className="text-[15px] font-medium text-stone-500 ml-7">{formatCurrency(item.price)} each</p>
              </div>
              <button
                onClick={() => removeItem(item.menuItemId)}
                aria-label="Remove item"
                className="text-stone-300 hover:text-red-500 hover:bg-red-50 text-sm w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 font-bold active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between mt-6 mb-4 bg-stone-50/50 p-2 rounded-[16px] border border-stone-100/50">
              <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm border border-stone-100 p-1 pl-2 pr-2">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-[10px] text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 font-bold text-xl"
                >
                  −
                </button>
                <span className="font-black text-stone-900 min-w-[36px] text-center tabular-nums text-[19px]">{item.quantity}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-[10px] text-stone-600 hover:bg-stone-50 hover:text-stone-900 cursor-pointer active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 font-bold text-xl"
                >
                  +
                </button>
              </div>
              <span className="font-black text-[20px] tracking-tight pr-3">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>

            <input
              type="text"
              name="item-note"
              aria-label="Note for this item"
              placeholder="Add note (e.g., extra spicy)…"
              value={item.notes || ''}
              onChange={e => updateNotes(item.menuItemId, e.target.value)}
              className="w-full text-sm border-b border-stone-200 bg-transparent px-1 py-2 text-stone-900 placeholder-stone-400 focus-visible:outline-none focus-visible:border-stone-900 transition-colors"
              maxLength={200}
            />
          </div>
        ))}

        {/* Special Notes */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 animate-fade-in-up" style={{ animationDelay: `${items.length * 50}ms` }}>
          <label className="block text-sm font-bold text-stone-900 mb-3">
            Special instructions for the kitchen
          </label>
          <textarea
            value={specialNotes}
            onChange={e => setSpecialNotes(e.target.value)}
            name="special-notes"
            placeholder="Any allergies or special requests…"
            className="w-full text-sm bg-stone-50 border-none rounded-2xl px-4 py-4 text-stone-900 placeholder-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 resize-none transition-shadow"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 animate-fade-in-up" style={{ animationDelay: `${(items.length + 1) * 50}ms` }}>
          <h3 className="font-bold text-stone-900 mb-4 tracking-tight">Order Summary</h3>
          <div className="space-y-3 test-base">
            <div className="flex justify-between font-medium text-stone-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between font-medium text-stone-500">
              <span>Taxes</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-stone-100 pt-4 mt-4 flex justify-between items-center">
              <span className="font-bold text-stone-900">Estimated Total</span>
              <span className="font-bold text-xl text-stone-900 tracking-tight">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}
      </main>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent z-50 pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto animate-fade-in-up" style={{ animationDelay: `${(items.length + 2) * 50}ms` }}>
          <Button
            size="lg"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white shadow-elegant hover:scale-[0.98] outline-none focus-visible:ring-stone-900 focus-visible:ring-offset-stone-50"
            onClick={handlePlaceOrder}
            loading={loading}
          >
            Place Order • {formatCurrency(subtotal)}
          </Button>
        </div>
      </div>
    </div>
  );
}
