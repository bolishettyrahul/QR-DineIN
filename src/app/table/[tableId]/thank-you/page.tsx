'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PAYMENT_METHOD_DISPLAY } from '@/lib/utils';

export default function ThankYouPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const searchParams = useSearchParams();
  const method = searchParams.get('method') || '';
  const orderId = searchParams.get('orderId') || '';

  const isPending = method === 'CASH' || method === 'PAY_AT_COUNTER';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="text-6xl mb-6" aria-hidden="true">{isPending ? '\u2709' : '\u2714'}</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPending ? 'Order Placed!' : 'Payment Successful!'}
        </h1>

        <p className="text-gray-500 mb-6">
          {isPending
            ? `Please pay via ${PAYMENT_METHOD_DISPLAY[method] || method}. Your food is being prepared!`
            : 'Thank you for your payment. Your food is on its way!'}
        </p>

        <div className="space-y-3">
          {orderId && (
            <Link
              href={`/table/${tableId}/order-status?orderId=${orderId}`}
              className="block w-full py-3 px-6 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Track Your Order
            </Link>
          )}
          <Link
            href={`/table/${tableId}/menu`}
            className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            Order More Items
          </Link>
          <Link
            href={`/table/${tableId}/orders`}
            className="block w-full py-3 px-6 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            📋 View Full Bill
          </Link>
        </div>
      </div>
    </div>
  );
}
