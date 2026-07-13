import { Link } from "react-router-dom";
import { LegalPage } from "./LegalPage";

/**
 * Terms of Service. Short terms suited to an open-source design-system marketing
 * site with free in-browser tools and no accounts or payments. The component
 * library itself is governed by its open-source (MIT) licence, referenced below.
 */
export function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="12 July 2026">
      <p>
        These terms govern your use of this website and the in-browser tools it hosts.
        By using the site, you agree to them. If you don&rsquo;t agree, please don&rsquo;t
        use the site.
      </p>

      <h2>The service</h2>
      <p>
        UI Organized is an open-source design-system project. This site provides
        documentation and free design tools (a theme builder, colour-palette generator,
        and icon scaler) that run in your browser. There are no user accounts and
        nothing is for sale here.
      </p>

      <h2>Open-source software</h2>
      <p>
        The UI Organized component library and related packages are distributed under
        their open-source licence (MIT). Your use of that software is governed by that
        licence, not by these terms. These terms cover your use of this website itself.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the site in any way that breaks the law or infringes others&rsquo; rights;</li>
        <li>attempt to disrupt, overload, or gain unauthorised access to the site or its backend;</li>
        <li>submit unlawful, abusive, or deliberately misleading content through the contact form.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        Work you create in the in-browser tools is yours; it stays in your browser and
        we make no claim to it. If you send us feedback or a suggestion through the{" "}
        <Link to="/#contact">contact form</Link>, you allow us to use it to improve the
        project without obligation to you.
      </p>

      <h2>No warranty</h2>
      <p>
        The site and its tools are provided &ldquo;as is&rdquo;, without warranties of any
        kind. We don&rsquo;t guarantee the site will be uninterrupted, error-free, or that
        outputs from the tools will be fit for any particular purpose.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we will not be liable for any indirect,
        incidental, or consequential damages arising from your use of the site. Nothing
        in these terms limits liability that cannot be limited under applicable law.
      </p>

      <h2>Third-party links</h2>
      <p>
        The site links to third-party sites and services (such as GitHub, Figma, and
        npm). We are not responsible for their content or practices.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time; the &ldquo;Last updated&rdquo; date
        above reflects the latest version. Continued use of the site means you accept the
        updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach us through the{" "}
        <Link to="/#contact">contact form</Link>. See also our{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
