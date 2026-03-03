'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, generateIdempotencyKey } from '@/lib/utils';
import { Button } from '@/components/Button';

export default function CartPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const { items, updateQuantity, updateNotes, removeItem, clearCart, subtotal } = useCart();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items from the menu to get started.</p>
          <Link
            href={`/table/${params.tableId}/menu`}
            className="inline-block py-3 px-6 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/table/${params.tableId}/menu`} className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
          <span className="text-sm text-gray-500">({items.length} items)</span>
        </div>
      </header>

      {/* Cart Items */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {items.map(item => (
          <div key={item.menuItemId} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center text-[8px] ${
                    item.isVeg ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                  }`}>
                    ●
                  </span>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">{formatCurrency(item.price)} each</p>
              </div>
              <button
                onClick={() => removeItem(item.menuItemId)}
                aria-label="Remove item"
                className="text-gray-400 hover:text-red-500 text-sm p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  −
                </button>
                <span className="font-bold text-gray-900 min-w-[24px] text-center tabular-nums">{item.quantity}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  +
                </button>
              </div>
              <span className="font-semibold text-gray-900">
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
              className="mt-3 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              maxLength={200}
            />
          </div>
        ))}

        {/* Special Notes */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special instructions for the kitchen
          </label>
          <textarea
            value={specialNotes}
            onChange={e => setSpecialNotes(e.target.value)}
            name="special-notes"
            placeholder="Any allergies or special requests…"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
              <span>Estimated Total</span>
              <span>{formatCurrency(subtotal)}</span>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Button
            size="lg"
            className="w-full"
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
