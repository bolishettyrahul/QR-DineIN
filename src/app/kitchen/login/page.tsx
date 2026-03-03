'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';


export default function KitchenLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/kitchen-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Invalid PIN');
        setPin('');
        setLoading(false);
        return;
      }

      // Store token
      localStorage.setItem('auth-token', data.data.token);
      router.push('/kitchen');
    } catch {
      setError('Unable to connect. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  }, [pin, router]);

  // Auto-submit when 4 digits entered
  const submittedRef = useRef(false);
  useEffect(() => {
    if (pin.length === 4 && !loading && !submittedRef.current) {
      submittedRef.current = true;
      handleSubmit().finally(() => { submittedRef.current = false; });
    }
  }, [pin, loading, handleSubmit]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Kitchen Login</h1>
          <p className="text-gray-400">Enter your 4-digit PIN</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
                pin.length > i
                  ? 'border-orange-500 bg-orange-500/20 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-600'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {error && (
          <div role="alert" className="text-center text-red-400 text-sm mb-4">{error}</div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'].map((key) => {
            if (key === '') return <div key="empty" />;
            if (key === '←') {
              return (
                <button
                  key="backspace"
                  onClick={handleBackspace}
                  aria-label="Backspace"
                  className="h-14 min-w-[44px] rounded-lg bg-gray-700 text-white text-xl font-medium hover:bg-gray-600 transition-colors active:bg-gray-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  ←
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => handlePinInput(key)}
                disabled={pin.length >= 4}
                className="h-14 min-w-[44px] rounded-lg bg-gray-800 text-white text-xl font-medium hover:bg-gray-700 transition-colors active:bg-gray-600 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                {key}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="mt-6 text-center">
            <div className="animate-spin motion-reduce:animate-none rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
