/**
 * Contact form data + submission boundary.
 *
 * The homepage form POSTs here, and this module is the single place that knows
 * about the backend: the payload shape, the submit function, and the
 * bot-verification config. The site is static (GitHub Pages), so the actual
 * work — Turnstile verification, sending email, and creating the GitHub "Ideas"
 * item for suggestions — happens in the Cloudflare Worker under
 * `apps/marketing/worker/`. Point `VITE_CONTACT_ENDPOINT` at the deployed
 * Worker URL to enable live submissions.
 */

export type ContactInquiryType = "suggestion" | "contribution";

export interface ContactPayload {
  /** Which segmented-control option the visitor chose. */
  inquiryType: ContactInquiryType;
  name: string;
  email: string;
  message: string;
  /**
   * Cloudflare Turnstile token. Present only when `TURNSTILE_SITE_KEY` is
   * configured; otherwise `null` (the honeypot + timing checks stand in).
   * Verify this server-side before trusting the submission.
   */
  captchaToken: string | null;
}

/**
 * Cloudflare Turnstile site key. Set `VITE_TURNSTILE_SITE_KEY` in an `.env`
 * file (e.g. `apps/marketing/.env.local`) to enable the verification widget.
 * Left blank, the form still ships the honeypot + submit-timing defenses.
 */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

/**
 * URL of the Cloudflare Worker that handles submissions (see
 * `apps/marketing/worker/`). Set `VITE_CONTACT_ENDPOINT` in the build env
 * (e.g. `https://contact.uiorganized.com`). Left blank, the form short-circuits
 * to a dev-only stub so the UI flow stays testable without a backend.
 */
export const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT ?? "";

/** Pragmatic email shape check — the real validation happens server-side. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Submit a contact message to the Worker endpoint.
 *
 * The Worker (apps/marketing/worker/) re-verifies `captchaToken` against
 * Cloudflare's siteverify API, emails the submission, and — for suggestions —
 * adds a draft item to the GitHub Project's "Ideas" column. Throws on any
 * non-2xx response so the form can surface the error state.
 *
 * When `CONTACT_ENDPOINT` is unset we stay testable: log + resolve in dev, and
 * throw in a real build (a missing endpoint there is a misconfiguration, not a
 * silent success).
 */
export async function submitContactForm(payload: ContactPayload): Promise<void> {
  if (!CONTACT_ENDPOINT) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[contact] VITE_CONTACT_ENDPOINT unset — submission stubbed:", payload);
      return;
    }
    throw new Error("Contact endpoint is not configured (VITE_CONTACT_ENDPOINT).");
  }

  const res = await fetch(CONTACT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Contact submit failed: ${res.status}`);
  }
}
