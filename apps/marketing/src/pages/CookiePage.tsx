import { Link } from "react-router-dom";
import { LegalPage } from "./LegalPage";

/**
 * Cookie Policy. This site is deliberately cookie-light: analytics is cookieless
 * (Cloudflare Web Analytics) and the only browser storage is functional local
 * storage for the design tools and theme preference. That means no consent
 * banner is required — this page is the transparency statement.
 */
export function CookiePage() {
  return (
    <LegalPage title="Cookie Policy" updated="12 July 2026">
      <p>
        This page explains the cookies and similar technologies this site uses. The
        short version: <strong>we don&rsquo;t use tracking or advertising cookies</strong>,
        and we don&rsquo;t need a cookie-consent banner because nothing we store on your
        device is used to track you.
      </p>

      <h2>Cookies</h2>
      <p>
        This site does not set any first-party tracking cookies. Our analytics
        provider, Cloudflare Web Analytics, is <strong>cookieless</strong> by design —
        it measures aggregate traffic without storing cookies or identifying you.
      </p>
      <p>
        If the anti-spam check (Cloudflare Turnstile) is enabled on the contact form,
        Cloudflare may set a strictly necessary token to verify you are not a bot when
        you submit the form. This is used only for security, not tracking.
      </p>

      <h2>Local storage on your device</h2>
      <p>
        Our in-browser tools save your work locally so it persists between visits. This
        is functional, strictly necessary storage — it stays in your browser and is
        never transmitted to us:
      </p>
      <ul>
        <li>
          <strong>Theme preference</strong> — your light/dark and brand choice, so the
          site remembers how you like it.
        </li>
        <li>
          <strong>Colour-palette generator</strong> — the palettes you generate.
        </li>
        <li>
          <strong>Icon scaler</strong> — your icon-scaler workspace state.
        </li>
      </ul>
      <p>
        You can clear this at any time through your browser&rsquo;s &ldquo;clear site
        data&rdquo; controls; doing so simply resets those tools and your theme choice.
      </p>

      <h2>Third-party content</h2>
      <p>
        Some pages load resources from third parties — for example icon files from the
        jsDelivr CDN in the icon-scaler tool, and an embedded Storybook on the docs
        page. These providers may process technical data such as your IP address to
        deliver that content. See our <Link to="/privacy">Privacy Policy</Link> for
        details.
      </p>

      <h2>More information</h2>
      <p>
        For the full picture of how we handle data, see our{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
