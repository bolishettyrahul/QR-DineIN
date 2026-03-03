'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type RealtimeCallback = (payload: Record<string, unknown>) => void;

export function useRealtimeSubscription(
  channel: string,
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: RealtimeCallback,
  filter?: string
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const channelConfig = supabase
      .channel(channel)
      .on(
        'postgres_changes' as never,
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        } as never,
        (payload: Record<string, unknown>) => {
          callbackRef.current(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelConfig);
    };
  }, [channel, table, event, filter]);
}

// Fallback polling hook for when realtime disconnects
export function useFallbackPolling(
  fetcher: () => Promise<void>,
  intervalMs = 15000,
  enabled = true
) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      fetcherRef.current();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, enabled]);
}

// SWR fetcher utility
export const swrFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
};

// Auth-aware SWR fetcher
export function useAuthFetcher() {
  return useCallback(async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) {
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch');
    }
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Request failed');
    return json.data;
  }, []);
}
