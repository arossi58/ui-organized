import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "../../lib/contact";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_ID = "cf-turnstile-script";

/** Load the Turnstile script once, shared across any number of widgets. */
let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Turnstile failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface TurnstileProps {
  /** Fired with the verification token once the challenge is solved. */
  onVerify: (token: string) => void;
  /** Fired when the token expires or the widget errors — clears the token. */
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile bot-verification widget.
 *
 * Renders nothing unless `VITE_TURNSTILE_SITE_KEY` is configured, so the form
 * works out of the box (relying on the honeypot + timing checks) and gains a
 * full CAPTCHA the moment a key is supplied — no code change required.
 */
export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keep the latest callbacks in refs so the widget mounts exactly once.
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "auto",
          size: "flexible",
          callback: (token) => onVerifyRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onExpireRef.current?.(),
        });
      })
      .catch(() => {
        /* Network/script failure — the honeypot + timing checks still apply. */
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={containerRef} className="contact-form__captcha" />;
}
