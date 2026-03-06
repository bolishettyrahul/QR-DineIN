'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { swrFetcher } from '@/hooks/useRealtime';
import { formatCurrency, PAYMENT_METHOD_DISPLAY } from '@/lib/utils';
import { Button } from '@/components/Button';

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI', description: 'Pay using UPI apps like GPay, PhonePe' },
  { value: 'CASH', label: 'Cash', description: 'Pay with cash to the waiter' },
  { value: 'PAY_AT_COUNTER', label: 'Pay at Counter', description: 'Pay at the billing counter' },
] as const;

export default function CheckoutPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order, error: orderError } = useSWR(
    orderId ? `/api/orders/${orderId}` : null,
    swrFetcher
  );

  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!selectedMethod || !orderId) return;
    setLoading(true);
    setError('');

    try {
      const sessionData = localStorage.getItem('qr-dine-session');
      if (!sessionData) {
        setError('Session expired. Please scan QR code again.');
        return;
      }
      const { sessionId } = JSON.parse(sessionData);

      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          sessionId,
          method: selectedMethod,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Payment failed');
        return;
      }

      // For CASH and PAY_AT_COUNTER, redirect to thank you page
      if (selectedMethod === 'CASH' || selectedMethod === 'PAY_AT_COUNTER') {
        router.push(`/table/${tableId}/thank-you?orderId=${orderId}&method=${selectedMethod}`);
        return;
      }

      // For UPI — redirect to thank you page with pending status
      // In production, the payment gateway webhook will call /api/payments/verify
      router.push(`/table/${tableId}/thank-you?orderId=${orderId}&method=UPI`);
    } catch {
      setError('Unable to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId || orderError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{orderError ? 'Failed to load order' : 'No order found'}</p>
          <Link href={`/table/${tableId}/menu`} className="text-orange-600 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin motion-reduce:animate-none rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
          <p className="text-xs text-gray-500">Order #{order.orderNumber}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Amount to Pay</h3>
          <div className="text-3xl font-bold text-orange-600">
            {formatCurrency(order.totalAmount)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Including {formatCurrency(order.taxAmount)} tax
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Select Payment Method</h3>
          <div role="radiogroup" aria-label="Payment method" className="space-y-3">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.value}
                role="radio"
                aria-checked={selectedMethod === method.value}
                onClick={() => setSelectedMethod(method.value)}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${selectedMethod === method.value
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{method.label}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Button
            size="lg"
            className="w-full"
            onClick={handlePayment}
            loading={loading}
            disabled={!selectedMethod}
          >
            {selectedMethod
              ? `Pay ${formatCurrency(order.totalAmount)} via ${PAYMENT_METHOD_DISPLAY[selectedMethod] || selectedMethod}`
              : 'Select a payment method'}
          </Button>
        </div>
      </div>
    </div>
  );
}
