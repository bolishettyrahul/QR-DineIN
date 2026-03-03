'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div role="alert" aria-live="assertive" className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 text-center py-2 px-4 text-sm font-medium">
      You seem to be offline. Some features may not work.
    </div>
  );
}
