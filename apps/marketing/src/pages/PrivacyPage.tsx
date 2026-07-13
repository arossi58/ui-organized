import { Link } from "react-router-dom";
import { LegalPage } from "./LegalPage";

/**
 * Privacy Policy. Content is tailored to what this site actually does:
 * a cookieless-analytics static marketing site whose only personal-data
 * collection is the contact form (name/email/message → Cloudflare Worker →
 * email via Resend, plus a GitHub Project draft for suggestions).
 *
 * NOTE: this is a plain-language starting point, not legal advice — have it
 * reviewed before relying on it commercially.
 */
export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="12 July 2026">
      <p>
        This Privacy Policy explains what information UI Organized (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects when you visit this website, why we collect it, and
        the choices you have. UI Organized is an open-source design-system project;
        this site is primarily documentation and a set of in-browser design tools.
      </p>

      <h2>Information we collect</h2>
      <h3>Information you give us</h3>
      <p>
        If you use the <Link to="/#contact">contact form</Link>, we collect the
        <strong> name</strong>, <strong>email address</strong>, and{" "}
        <strong>message</strong> you enter, along with the type of enquiry you
        select. We only receive this information when you choose to submit the form.
      </p>
      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Analytics.</strong> We use Cloudflare Web Analytics, which is
          privacy-first and <strong>cookieless</strong>. It records aggregate,
          non-identifying metrics (such as page views, referrers, and general
          country/region) and does not build a profile of you or track you across
          sites. See our <Link to="/cookies">Cookie Policy</Link>.
        </li>
        <li>
          <strong>Server logs.</strong> Like most websites, our hosting and
          network providers automatically process technical data such as your IP
          address and browser type to serve pages and protect against abuse.
        </li>
        <li>
          <strong>On-device storage.</strong> Our in-browser tools (the theme
          builder, colour-palette generator, and icon scaler) and your light/dark
          theme choice save data in your browser&rsquo;s local storage so your work
          persists between visits. This data stays on your device — it is never
          sent to us. See the <Link to="/cookies">Cookie Policy</Link> for the full
          list.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To respond to your enquiry or feedback submitted through the contact form.</li>
        <li>
          For product suggestions, to create an item on our project roadmap (via
          GitHub) so we can consider and track it.
        </li>
        <li>To understand, in aggregate, how the site is used and improve it.</li>
        <li>To keep the site secure and prevent spam and abuse.</li>
      </ul>

      <h2>Legal bases for processing (EEA/UK)</h2>
      <p>
        Where the EU or UK GDPR applies, we rely on: your <strong>consent</strong>{" "}
        and/or our <strong>legitimate interests</strong> in responding to you when you
        contact us; and our <strong>legitimate interests</strong> in running secure,
        functional analytics and protecting the site from abuse. You can object to
        processing based on legitimate interests at any time (see &ldquo;Your rights&rdquo;).
      </p>

      <h2>Who we share it with</h2>
      <p>
        We do not sell your personal information. We share it only with the service
        providers that help us operate the site, acting on our behalf:
      </p>
      <ul>
        <li>
          <strong>Cloudflare</strong> — hosts the contact-form backend (a Cloudflare
          Worker), provides cookieless Web Analytics, and — where enabled — the
          Turnstile anti-spam check.
        </li>
        <li>
          <strong>Resend</strong> — delivers the email that carries your contact-form
          submission to us.
        </li>
        <li>
          <strong>GitHub</strong> — hosts this website and, for product suggestions,
          receives the suggestion as a roadmap item.
        </li>
        <li>
          <strong>jsDelivr</strong> — an open-source CDN that serves icon files if you
          use the icon-scaler tool. Requests to it expose your IP address to the CDN,
          as with any resource loaded from a third party.
        </li>
      </ul>
      <p>
        These providers may process data outside your country, including in the United
        States. Where required, such transfers rely on appropriate safeguards such as
        the providers&rsquo; Standard Contractual Clauses.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep contact-form correspondence for as long as needed to handle your
        enquiry and any follow-up, then delete it when it is no longer required.
        Aggregate analytics data contains no personal information and is retained by
        Cloudflare on a rolling basis.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, delete,
        or receive a copy of your personal information, to object to or restrict certain
        processing, and to withdraw consent. If you are in California, you may have the
        right to know what we collect and to request deletion; we do not sell or share
        your personal information as those terms are defined under California law. To
        exercise any of these rights, contact us using the details below.
      </p>

      <h2>Children</h2>
      <p>
        This site is not directed to children under 16, and we do not knowingly collect
        their personal information.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we will revise the
        &ldquo;Last updated&rdquo; date above.
      </p>

      <h2>Contact us</h2>
      <p>
        For any privacy question or to exercise your rights, reach us through the{" "}
        <Link to="/#contact">contact form</Link>.
      </p>
    </LegalPage>
  );
}
