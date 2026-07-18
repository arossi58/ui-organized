/**
 * Cloudflare Web Analytics integration (cookieless).
 *
 * ─── WHY NOT GOOGLE ANALYTICS ───────────────────────────────────────────────
 * This site previously used GA4 (gtag.js), which sets `_ga` cookies and sends
 * data to Google — triggering GDPR/ePrivacy consent-banner obligations. We
 * replaced it with Cloudflare Web Analytics, which is **cookieless** and stores
 * no personal data on the visitor's device: it needs no consent banner. See the
 * Privacy Policy and Cookie Policy pages for the user-facing statement.
 *
 * ─── HOW IT'S WIRED ─────────────────────────────────────────────────────────
 * The beacon token is read from `VITE_CF_ANALYTICS_TOKEN` (get it from the
 * Cloudflare dashboard → Web Analytics → your site → JS snippet). Set it in
 * `apps/marketing/.env.local` for local runs; when configured, production reads it from
 * a GitHub Actions repository *variable* injected at build time by the build-site action
 * (see `.github/actions/build-site` and `.github/workflows/ci.yml`). It's a repo
 * variable rather than a secret because it ships publicly in the client bundle.
 *
 * When the variable is unset — dev without a `.env.local`, `vite preview`, PR
 * checks — the beacon is never loaded, so analytics is opt-in and silent by
 * default.
 *
 * The beacon tracks single-page-app navigations automatically (it hooks the
 * History API), so there is no per-route tracking hook to maintain.
 */

/** Cloudflare Web Analytics beacon token. Empty string disables analytics. */
export const CF_ANALYTICS_TOKEN = import.meta.env.VITE_CF_ANALYTICS_TOKEN ?? "";

/** Whether a beacon token is configured (analytics should run). */
export const analyticsEnabled = CF_ANALYTICS_TOKEN !== "";

// Guards against double-injecting the beacon if initAnalytics runs twice
// (e.g. React StrictMode double-invokes effects in dev).
let initialized = false;

/**
 * Inject the Cloudflare Web Analytics beacon. Idempotent and a no-op when no
 * token is set. Call once at app startup. `spa: true` enables client-side
 * route-change tracking for the BrowserRouter app.
 */
export function initAnalytics(): void {
  if (initialized || !analyticsEnabled || typeof window === "undefined") return;
  initialized = true;

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute(
    "data-cf-beacon",
    JSON.stringify({ token: CF_ANALYTICS_TOKEN, spa: true }),
  );
  document.head.appendChild(script);
}

/**
 * Record a custom UI event (e.g. "tool_select"). Retained as a no-op so existing
 * call sites keep compiling: Cloudflare Web Analytics is aggregate/cookieless and
 * has no custom-event API, so there is nowhere to send these. Kept as a seam in
 * case a future analytics tool that supports events is adopted — swap the body
 * here rather than re-threading calls through the app.
 */
export function trackEvent(
  _name: string,
  _params?: Record<string, unknown>,
): void {
  /* no-op — see doc comment */
}
