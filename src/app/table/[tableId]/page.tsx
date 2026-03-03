'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TableLandingPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initSession() {
      try {
        // Create or get existing session
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId: params.tableId }),
        });

        const data = await res.json();

        if (!data.success) {
          setError(data.error?.message || 'Failed to start session');
          setLoading(false);
          return;
        }

        // Store session info in localStorage
        localStorage.setItem('qr-dine-session', JSON.stringify({
          sessionId: data.data.id,
          tableId: params.tableId,
        }));

        // Redirect to menu
        router.replace(`/table/${params.tableId}/menu`);
      } catch {
        setError('Unable to connect. Please check your internet connection.');
        setLoading(false);
      }
    }

    initSession();
  }, [params.tableId, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="animate-spin motion-reduce:animate-none rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600 text-lg">Setting up your table…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-orange-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <div className="text-5xl mb-4" aria-hidden="true">⚠</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return null;
}
