import { useEffect } from 'react';

/**
 * When a page is restored from the Back‑Forward Cache (bfcache),
 * we immediately redirect to the login page. This prevents a logged‑out
 * user from seeing a stale dashboard UI via the browser back button.
 */
export const useBfcacheHandler = () => {
  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Replace the current entry with the login page – no back navigation to dashboard.
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', handler);
    return () => window.removeEventListener('pageshow', handler);
  }, []);
};
