/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Cloudflare Turnstile site key. When set, the contact form renders the
   * Turnstile bot-verification widget. Leave unset to fall back to the
   * honeypot + submit-timing checks alone.
   */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Minimal typing for the Cloudflare Turnstile global injected by its script. */
interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "auto" | "light" | "dark";
      size?: "normal" | "flexible" | "compact";
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

interface Window {
  turnstile?: TurnstileApi;
}
