import { useCallback, useRef, useState } from "react";
import { Alert, Button, Input, TextArea } from "@ui-organized/react";
import { Reveal } from "../Reveal";
import { Turnstile } from "./Turnstile";
import {
  isValidEmail,
  submitContactForm,
  TURNSTILE_SITE_KEY,
  type ContactInquiryType,
} from "../../lib/contact";
import { trackEvent } from "../../lib/analytics";
import "./contact-section.css";

interface InquiryOption {
  value: ContactInquiryType;
  label: string;
}

const INQUIRY_OPTIONS: InquiryOption[] = [
  { value: "suggestion", label: "I have a suggestion" },
  { value: "contribution", label: "I want to contribute" },
];

/** Submissions faster than this (ms) after mount are treated as bots. */
const MIN_FILL_MS = 1500;

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

/**
 * Contact form — the homepage's closing section (Figma node 170:15686).
 *
 * Built entirely from `@ui-organized/react` primitives (Input, TextArea, Button, Alert)
 * and design-system tokens. It is NOT wired to a backend yet — submission flows
 * through `submitContactForm` in lib/contact.ts, the single integration point.
 *
 * Spam defenses, all client-side and ready to be reinforced server-side:
 *   • Honeypot — a hidden field real users never see; bots fill it → drop.
 *   • Timing trap — submissions within MIN_FILL_MS of mount → drop.
 *   • Turnstile — Cloudflare CAPTCHA, enabled by VITE_TURNSTILE_SITE_KEY.
 */
export function ContactSection() {
  const [inquiryType, setInquiryType] = useState<ContactInquiryType>("suggestion");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedAtRef = useRef<number>(Date.now());
  // Tracks whether we've already logged the "started filling the form" event,
  // so contact_start fires at most once per mount (on first field interaction).
  const startedRef = useRef(false);

  /** Fire contact_start the first time the visitor edits any field. */
  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("contact_start", { inquiry_type: inquiryType });
  }

  const handleCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), []);
  const handleCaptchaExpire = useCallback(() => setCaptchaToken(null), []);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!isValidEmail(email)) next.email = "Please enter a valid email address.";
    if (!message.trim()) next.message = "Please enter a message.";
    return next;
  }

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setInquiryType("suggestion");
    setCaptchaToken(null);
    if (window.turnstile) window.turnstile.reset();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Bot trap 1 — honeypot: a hidden field only automated agents fill in.
    // Bot trap 2 — timing: a form completed implausibly fast isn't human.
    // Either way, feign success so we don't teach the bot what tripped it.
    const trippedHoneypot = !!honeypotRef.current?.value;
    const tooFast = Date.now() - mountedAtRef.current < MIN_FILL_MS;
    if (trippedHoneypot || tooFast) {
      setStatus("success");
      resetForm();
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // CAPTCHA is only enforced when a site key is configured.
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setFormError("Please complete the verification challenge before sending.");
      return;
    }

    setStatus("submitting");
    try {
      await submitContactForm({ inquiryType, name, email, message, captchaToken });
      setStatus("success");
      // Conversion: only a genuine submission (not the honeypot/timing feigned
      // success above, which returns early) reaches here.
      trackEvent("contact_submit", { inquiry_type: inquiryType });
      resetForm();
    } catch {
      setStatus("error");
      setFormError("Something went wrong sending your message. Please try again.");
    }
  }

  return (
    <section className="section contact-section" id="contact">
      <Reveal className="wrap contact-section__wrap">
        <header className="contact-section__header">
          <h2 className="contact-section__title">We&rsquo;d like to hear from you</h2>
          <p className="contact-section__sub">
            We welcome any feedback or ideas to help make UI Organized better. We are
            also in need of designers, developers, and anyone else interested in
            helping make design easier for everyone.
          </p>
        </header>

        <form
          className="contact-form"
          onSubmit={handleSubmit}
          onChange={markStarted}
          noValidate
        >
          {status === "success" && (
            <Alert variant="success" title="Thanks for reaching out">
              Your message is on its way — we&rsquo;ll be in touch soon.
            </Alert>
          )}
          {status === "error" && formError && (
            <Alert variant="error" title="Couldn't send">
              {formError}
            </Alert>
          )}

          <div
            className="contact-segmented"
            role="radiogroup"
            aria-label="What would you like to tell us?"
          >
            {INQUIRY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="contact-segmented__item"
                data-active={inquiryType === option.value}
              >
                <input
                  type="radio"
                  name="inquiryType"
                  value={option.value}
                  checked={inquiryType === option.value}
                  onChange={() => setInquiryType(option.value)}
                  className="contact-segmented__input"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {/* Honeypot — visually hidden, off the tab order, never autofilled.
              A real visitor leaves it empty; bots tend to fill every field. */}
          <div className="contact-form__honeypot" aria-hidden="true">
            <label htmlFor="contact-company">Company</label>
            <input
              ref={honeypotRef}
              id="contact-company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <Input
            label="Name"
            required
            name="name"
            autoComplete="name"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            error={errors.name}
          />
          <Input
            label="Email"
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={errors.email}
          />
          <TextArea
            label="Message"
            required
            name="message"
            placeholder="Your input"
            resize="vertical"
            className="contact-form__message"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            error={errors.message}
          />

          <Turnstile onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} />

          {formError && status !== "error" && (
            <p className="contact-form__error" role="alert">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            intent="primary"
            size="lg"
            className="contact-form__submit"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Sending…" : "Submit"}
          </Button>
        </form>
      </Reveal>
    </section>
  );
}
