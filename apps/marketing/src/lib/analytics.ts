/**
 * Google Analytics 4 (gtag.js) integration.
 *
 * ─── HOW IT'S WIRED ─────────────────────────────────────────────────────────
 * The Measurement ID is read from `VITE_GA_MEASUREMENT_ID` (same pattern as the
 * Turnstile key in `contact.ts`) so no ID is hard-coded in source. Set it in
 * `apps/marketing/.env.local` for local runs; production gets it from a GitHub
 * Actions secret injected at build time (see `.github/workflows/deploy.yml`).
 *
 * When the variable is unset — dev without a `.env.local`, `vite preview`, PR
 * checks — `GA_MEASUREMENT_ID` is empty, `initAnalytics()` does nothing, and the
 * gtag script is never loaded. So analytics is opt-in and silent by default.
 *
 * Because the site is a BrowserRouter SPA, the default gtag snippet's single
 * load-time pageview would miss every client-side navigation. So we configure
 * with `send_page_view: false` and emit page views ourselves on each route
 * change via `trackPageView()` (driven by `usePageTracking`).
 */

/** GA4 Measurement ID (e.g. "G-XXXXXXXXXX"). Empty string disables analytics. */
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? "";

/** Whether a Measurement ID is configured (analytics should run). */
export const analyticsEnabled = GA_MEASUREMENT_ID !== "";

// Guards against double-injecting the script if initAnalytics runs twice
// (e.g. React StrictMode double-invokes effects in dev).
let initialized = false;

/**
 * Push a raw gtag command onto the dataLayer. Mirrors the standard inline
 * snippet's `gtag(...)` shim, but typed and centralised.
 */
function gtag(...args: unknown[]): void {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

/**
 * Load gtag.js and configure the GA4 property. Idempotent and a no-op when no
 * Measurement ID is set. Call once at app startup.
 */
export function initAnalytics(): void {
  if (initialized || !analyticsEnabled || typeof window === "undefined") return;
  initialized = true;

  // Inject the async gtag loader script.
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  // send_page_view:false — we emit page views per route change instead, so SPA
  // navigations are counted (the default would only fire once, on first load).
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

/**
 * Record a page view for a client-side route. `path` should be the in-app path
 * (pathname + search), e.g. "/tools/figma-plugin". No-op when analytics is off.
 */
export function trackPageView(path: string): void {
  if (!analyticsEnabled || typeof window === "undefined") return;
  gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  });
}

/**
 * Record a custom event (e.g. "view_npm_package", "tool_select"). `params`
 * become GA4 event parameters — note that custom params only surface in reports
 * once registered as custom dimensions (Admin → Custom definitions). No-op when
 * analytics is off.
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (!analyticsEnabled || typeof window === "undefined") return;
  gtag("event", name, params ?? {});
}
