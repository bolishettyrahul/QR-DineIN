'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PendingAction {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers: Record<string, string>;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = 'qrdine-pending-actions';
const MAX_RETRIES = 5;

function loadQueue(): PendingAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingAction[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function addPendingAction(
  url: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {}
): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const queue = loadQueue();
  queue.push({
    id,
    url,
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json', ...headers },
    timestamp: Date.now(),
    retries: 0,
  });
  saveQueue(queue);
  return id;
}

export function usePendingActionQueue() {
  const processingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current || !navigator.onLine) return;
    processingRef.current = true;

    const queue = loadQueue();
    const remaining: PendingAction[] = [];

    for (const action of queue) {
      try {
        const res = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (!res.ok && res.status >= 500) {
          // Server error — retry later
          if (action.retries < MAX_RETRIES) {
            remaining.push({ ...action, retries: action.retries + 1 });
          }
        }
        // Success or client error (4xx) — drop from queue
      } catch {
        // Network error — keep in queue
        if (action.retries < MAX_RETRIES) {
          remaining.push({ ...action, retries: action.retries + 1 });
        }
      }
    }

    saveQueue(remaining);
    processingRef.current = false;
  }, []);

  useEffect(() => {
    // Process on mount
    processQueue();

    // Process when coming back online
    const handleOnline = () => {
      setTimeout(processQueue, 1000);
    };

    window.addEventListener('online', handleOnline);
    
    // Also process periodically
    const interval = setInterval(processQueue, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [processQueue]);

  return { processQueue, getPendingCount: () => loadQueue().length };
}
