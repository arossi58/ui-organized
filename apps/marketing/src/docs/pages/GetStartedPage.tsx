/**
 * Get started — install, wire up the stylesheets, render a component.
 *
 * This page exists because the site had no install instructions at all: `/docs`
 * went Introduction → Foundations → components, and the only setup guidance
 * anywhere shipped inside the Theme Builder's export zip, where it was both
 * hard to find and wrong (see `docs/theme-test.md`). Everything here has been
 * checked against a real app build, so the snippets are copy-paste correct.
 */
import { Link } from "react-router-dom";
import { CodeBlock, DocsPageHeader, DocsProse, DocsSection } from "../components";
import styles from "../components/content.module.css";

const INSTALL = `npm install @ui-organized/react @ui-organized/tokens`;

const INSTALL_ICONS = `npm install lucide-react
# or @tabler/icons-react, or @heroicons/react`;

const MAIN_TSX = `// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IconProvider } from '@ui-organized/react'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@ui-organized/react/styles'          // 2. component styles
import './styles/theme.css'                  // 3. your theme — last, so it wins
import './index.css'                         // 4. your own layout

import { iconConfig } from './icons'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconProvider {...iconConfig}>
      <App />
    </IconProvider>
  </StrictMode>,
)`;

const INDEX_HTML = `<!-- index.html -->
<html lang="en" data-theme="light">`;

const FONT_LINKS = `<!-- index.html — in <head>, before your stylesheets -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">`;

const APP_TSX = `// src/App.tsx
import { Button, Card, Input } from '@ui-organized/react'

export default function App() {
  return (
    <Card>
      <Input label="Email" placeholder="you@example.com" />
      <Button intent="primary">Save</Button>
    </Card>
  )
}`;

const TOGGLE = `document.documentElement.setAttribute('data-theme', 'dark')`;

export function GetStartedPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow="Documentation"
        title="Get started"
        lede={
          <>
            Install the library, import three stylesheets in the right order, and render a
            component. The order is the part worth reading — it decides whether your theme
            actually wins.
          </>
        }
      />

      <DocsProse>
        <DocsSection title="Install">
          <CodeBlock code={INSTALL} language="sh" />
          <p>
            <code>react</code> and <code>react-dom</code> (&ge;18) are peer dependencies.
            Icon libraries are <strong>optional</strong> peers — install whichever set you
            picked in the <Link to="/tools">Theme Builder</Link>:
          </p>
          <CodeBlock code={INSTALL_ICONS} language="sh" />
          <p>
            Optional means the package doesn’t pull one in for you, and choosing a library
            you haven’t installed fails at <em>import</em> time, not at install time.
          </p>
        </DocsSection>

        <DocsSection
          title="Wire up the stylesheets"
          subtitle="Four imports, once, at your app entry. Order is load-bearing."
        >
          <CodeBlock code={MAIN_TSX} language="tsx" />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Import</th>
                  <th scope="col">Why it sits there</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className={styles.propName}>@ui-organized/tokens/variables.css</span>
                  </td>
                  <td>
                    The full token baseline — primitive ramps plus the semantic layer. Already
                    a dependency of the component library, so it costs nothing new.{" "}
                    <strong>Optional</strong> if your theme file is self-contained; see below.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>@ui-organized/react/styles</span>
                  </td>
                  <td>
                    The component styles. They consume tokens and define almost none, so they
                    can sit either side of the baseline — but they must come before your theme.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>./styles/theme.css</span>
                  </td>
                  <td>
                    Your theme, from the Theme Builder. <strong>Last of the three.</strong>{" "}
                    It and the baseline both declare on <code>:root</code>, and{" "}
                    <code>:root</code> vs <code>:root</code> is a specificity tie — decided by
                    source order. Import it earlier and the baseline silently wins.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>./index.css</span>
                  </td>
                  <td>Anything of your own that should beat all of the above.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            The subpath is <strong>extensionless</strong> in the canonical form, but{" "}
            <code>@ui-organized/react/styles.css</code> resolves to the same file — both are
            exported and both carry types, so neither needs a{" "}
            <code>declare module</code> shim in your project.
          </p>
        </DocsSection>

        <DocsSection
          title="Pin the default mode"
          subtitle="So the first frame paints correctly, before any JavaScript runs."
        >
          <CodeBlock code={INDEX_HTML} language="html" />
          <p>
            A theme’s <code>:root</code> block is one specific mode. If that mode isn’t the one
            your app defaults to, the page paints a single frame of the wrong theme before
            React’s first effect runs. Setting the attribute in the HTML removes the flash
            entirely — no JavaScript involved.
          </p>
          <p>
            Theme Builder exports let you pick which mode lands on <code>:root</code>{" "}
            (including <em>System</em>, which follows <code>prefers-color-scheme</code>). Pin
            the attribute anyway if your app has a fixed default — it costs nothing and it is
            the only thing that runs before first paint.
          </p>
        </DocsSection>

        <DocsSection
          title="Load the fonts"
          subtitle="The theme names its typefaces. Something still has to fetch them."
        >
          <p>
            Tokens can say <code>--type-font-heading: 'Inter', sans-serif</code>, but a
            stylesheet can’t efficiently load a font — so the families your theme names are
            not fetched for you. Add them to your document head:
          </p>
          <CodeBlock code={FONT_LINKS} language="html" />
          <p>
            Without this you get the theme’s <em>metrics</em> — every size, weight and
            line-height exactly right — set in whatever fallback the browser picks. It looks
            deliberate, which is why it’s easy to ship by accident. Check it with the
            rendered width rather than by eye:{" "}
            <code>document.fonts.size</code> is <code>0</code> when nothing loaded.
          </p>
          <p>
            Theme Builder exports include a <code>fonts.ts</code> with the exact tags for
            your families, so you can paste them or generate them at build time. It’s
            deliberately not an <code>@import</code> inside the theme: that sits behind a
            second round trip (the preload scanner can’t see it) and would bake a CDN into
            your tokens, which makes self-hosting a per-export chore.
          </p>
        </DocsSection>

        <DocsSection title="Render something">
          <CodeBlock code={APP_TSX} language="tsx" />
          <p>
            Switch modes at runtime by setting the attribute — there is nothing to re-import:
          </p>
          <CodeBlock code={TOGGLE} language="ts" />
          <p>
            That’s a DOM mutation, so nothing re-renders on its own. Components read their
            colours through CSS and update immediately; code that reads{" "}
            <em>resolved</em> token values needs a <code>MutationObserver</code> on{" "}
            <code>data-theme</code>.
          </p>
        </DocsSection>

        <DocsSection title="Next">
          <ul>
            <li>
              <Link to="/docs/theming">Theming</Link> — generate a theme, override tokens by
              hand, or build them from a config with the Vite plugin.
            </li>
            <li>
              <Link to="/docs/foundations/color">Foundations → Color</Link> — the palette and
              the semantic roles your components actually reference.
            </li>
            <li>
              Any component in the sidebar for live examples, props and an Inspect view.
            </li>
          </ul>
        </DocsSection>
      </DocsProse>
    </>
  );
}
