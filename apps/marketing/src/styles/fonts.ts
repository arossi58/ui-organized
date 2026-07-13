// Self-hosted web fonts (Fontsource) — replaces the Google Fonts CDN <link> that
// previously lived in index.html. Serving the fonts from our own origin means no
// visitor IP / referer is sent to Google on every page load (a GDPR + ePrivacy
// consideration — see the Privacy Policy) and drops a third-party,
// render-blocking request from the critical path.
//
// The @font-face family names Fontsource declares ("Inter", "EB Garamond") match
// the design-system type tokens exactly (var(--font-body) / var(--font-heading)),
// so nothing else has to change. The weights mirror the set the old Google Fonts
// URL requested: Inter 400/500/600/700/900, EB Garamond 400/500/600/700.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource/eb-garamond/700.css";
