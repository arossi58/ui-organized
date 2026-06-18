import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/analytics";

/**
 * Send a GA4 page view on every route change (and on first mount). Must be used
 * inside a Router so `useLocation` resolves. No-op when analytics is disabled —
 * `trackPageView` guards on the Measurement ID being set.
 *
 * Tracks `pathname + search` so query-param-distinguished views (e.g. a tool
 * gallery filter) register as separate page views. The hash is intentionally
 * omitted; the site routes by path, not by fragment.
 */
export function usePageTracking(): void {
  const { pathname, search } = useLocation();

  useEffect(() => {
    trackPageView(pathname + search);
  }, [pathname, search]);
}
