/**
 * Contact form data + submission boundary.
 *
 * The form on the homepage is built and validated, but intentionally NOT yet
 * wired to a backend. Everything an integration needs lives here: the payload
 * shape, the (currently stubbed) submit function with a single clear hook, and
 * the bot-verification config. Swap the body of `submitContactForm` for a real
 * request when the email/serverless endpoint exists.
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

/** Pragmatic email shape check — the real validation happens server-side. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Submit a contact message.
 *
 * ─── INTEGRATION POINT ──────────────────────────────────────────────────────
 * This is the single place to connect the form to a real destination. When the
 * endpoint exists, replace the stub below with something like:
 *
 *   const res = await fetch("/api/contact", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(payload),
 *   });
 *   if (!res.ok) throw new Error(`Contact submit failed: ${res.status}`);
 *
 * The server must (1) re-verify `payload.captchaToken` against Cloudflare's
 * siteverify API and (2) forward the message to the email service.
 *
 * Until then we log in dev and resolve, so the UI flow is fully testable.
 */
export async function submitContactForm(payload: ContactPayload): Promise<void> {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[contact] submitContactForm stub — not yet wired:", payload);
  }
  return Promise.resolve();
}
