'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NProgress-style top loading bar.
 * Fires automatically on every client-side route change.
 * Zero external dependencies — pure CSS animations.
 */
export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<'idle' | 'loading' | 'complete'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef<string>('');

  // Derive a unique "route key" from pathname + searchParams
  const routeKey = pathname + searchParams.toString();

  useEffect(() => {
    // Skip the very first mount (no navigation happened yet)
    if (prevPath.current === '') {
      prevPath.current = routeKey;
      return;
    }
    if (prevPath.current === routeKey) return;
    prevPath.current = routeKey;

    // Start the bar
    setState('loading');
    if (timerRef.current) clearTimeout(timerRef.current);

    // Mark complete after a small delay (page content renders)
    timerRef.current = setTimeout(() => {
      setState('complete');
      timerRef.current = setTimeout(() => setState('idle'), 400);
    }, 120);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [routeKey]);

  if (state === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 99999,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #5e6ad2, #828fff, #a682ff)',
          backgroundSize: '200% 100%',
          borderRadius: '0 999px 999px 0',
          ...(state === 'loading'
            ? {
                animation: 'progress-indeterminate 1.2s ease-in-out infinite',
                width: '100%',
                transformOrigin: 'left center',
              }
            : {
                animation: 'progress-complete 0.35s ease forwards',
                width: '100%',
              }),
        }}
      />
    </div>
  );
}
