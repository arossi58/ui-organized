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
import { CANONICAL_ICON_NAMES } from "@ui-organized/utils";
import { CodeBlock, DocsPageHeader, DocsProse, DocsSection } from "../components";
import styles from "../components/content.module.css";

// Counted from the canonical list itself — the same reason the Theming page
// derives its token counts from the contract rather than restating them.
const CANONICAL_ICON_COUNT = CANONICAL_ICON_NAMES.length;

const INSTALL = `npm install @ui-organized/react @ui-organized/tokens`;

const INSTALL_ICONS = `npm install lucide-react
# or @tabler/icons-react, or @heroicons/react`;

const ICON_REGISTER = `import '@ui-organized/react/icons/lucide'`;

const ICONS_TS = `// src/icons.ts
import type { IconConfig } from '@ui-organized/react'

export const iconConfig: IconConfig = {
  library: 'lucide',        // must match the subpath you imported
  style: 'outline',
  strokeAdjustment: true,
  baseSize: 24,
  baseStroke: 2,
}`;

const ICON_USAGE = `import { Button, Icon } from '@ui-organized/react'

<Icon name="chevron-down" />
<Icon name="trash" size={16} label="Delete project" />
<Button icon="refresh">Reload</Button>`;

const ICON_DIRECT = `import { Sparkles } from 'lucide-react'

<Icon name={Sparkles} size={20} />`;

const MAIN_TSX = `// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IconProvider } from '@ui-organized/react'

import '@ui-organized/tokens/variables.css'  // 1. token baseline
import '@ui-organized/react/styles'          // 2. component styles
import './styles/theme.css'                  // 3. your theme — last, so it wins
import './index.css'                         // 4. your own layout

import '@ui-organized/react/icons/lucide'    // registers your icon set

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

const CLI_APPLY = `npx @ui-organized/cli theme ~/Downloads/my-theme.zip`;

export function GetStartedPage() {
  return (
    <>
      <DocsPageHeader
        title="Get started"
        lede={
          <>
            Install the library, import the stylesheets in the right order, and render a
            component. Order is the part worth reading: it decides whether your theme wins.
          </>
        }
      />

      <DocsProse>
        <DocsSection title="Install">
          <CodeBlock code={INSTALL} language="sh" />
          <p>
            <code>react</code> and <code>react-dom</code> (&ge;18) are peer dependencies.
            Icons come from one of three libraries — install whichever set you picked in the{" "}
            <Link to="/tools">Theme Builder</Link>:
          </p>
          <CodeBlock code={INSTALL_ICONS} language="sh" />
          <p>
            Just one. All three are <strong>optional</strong> peers, and the library imports
            none of them itself, so the two you skip never reach your install or your bundle.{" "}
            <a href="#set-up-icons">Set up icons</a> covers the one you did install.
          </p>
        </DocsSection>

        <DocsSection
          title="Add your theme"
          subtitle="One command, if you exported one from the Theme Builder."
        >
          <CodeBlock code={CLI_APPLY} language="sh" />
          <p>
            Writes <code>theme.css</code>, <code>fonts.ts</code> and <code>icons.ts</code> where
            your project keeps them, after checking three things: that the theme defines every
            token the components read, that its typefaces can load, and that nothing in your own
            CSS overrides it. Add <code>--dry-run</code> to see the plan without writing.
          </p>
          <p>
            It prints the import lines rather than editing your entry module. They’re the next
            section, and they’re the same either way. Full detail in{" "}
            <Link to="/docs/theming">Theming</Link>.
          </p>
          <p className={styles.propNote}>
            Skipping the theme for now is fine — <code>@ui-organized/tokens/variables.css</code>{" "}
            is a complete default theme on its own.
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
                    The token baseline — primitive ramps plus the semantic layer. Already a
                    dependency of the component library, so it costs nothing new.{" "}
                    <strong>Optional</strong> if your theme file is self-contained.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>@ui-organized/react/styles</span>
                  </td>
                  <td>
                    The component styles. They consume tokens and define almost none, so they
                    can sit either side of the baseline — but always before your theme.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>./styles/theme.css</span>
                  </td>
                  <td>
                    Your theme, from the Theme Builder. <strong>Last of the three.</strong>{" "}
                    It and the baseline both declare on <code>:root</code>, so source order
                    breaks the tie. Import it earlier and the baseline silently wins.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>./index.css</span>
                  </td>
                  <td>Anything of your own that should beat all of the above.</td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>@ui-organized/react/icons/lucide</span>
                  </td>
                  <td>
                    Not a stylesheet — it registers your icon set. Swap <code>lucide</code>{" "}
                    for <code>tabler</code> or <code>heroicons</code> to match what you
                    installed. See <a href="#set-up-icons">Set up icons</a>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <code>@ui-organized/react/styles.css</code> resolves to the same file as the
            extensionless form. Both subpaths are exported and typed, so neither needs a{" "}
            <code>declare module</code> shim.
          </p>
        </DocsSection>

        <DocsSection
          title="Set up icons"
          subtitle="Components ask for an icon by name. You choose which library draws it."
        >
          <p>
            The library ships no icon artwork. Components reference{" "}
            <strong>canonical names</strong> — <code>chevron-down</code>, <code>refresh</code>,{" "}
            <code>close</code> — and each supported library maps those names onto its own
            components. So the icon set is a theme decision, not something baked into your
            component code.
          </p>
          <p>Two lines wire that up. The subpath import registers the set:</p>
          <CodeBlock code={ICON_REGISTER} language="ts" />
          <p>
            And <code>IconProvider</code> configures how it draws. This is the{" "}
            <code>icons.ts</code> a Theme Builder export gives you:
          </p>
          <CodeBlock code={ICONS_TS} language="ts" />

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Option</th>
                  <th scope="col">What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className={styles.propName}>library</span>
                  </td>
                  <td>
                    Which registered set to draw from. Has to match the subpath you imported —
                    this field selects, it doesn’t load.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>style</span>
                  </td>
                  <td>
                    <code>outline</code> or <code>solid</code>. Falls back to outline per icon
                    where a library has no solid cut — Lucide ships none at all.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>strokeAdjustment</span>
                  </td>
                  <td>
                    Thins the stroke as icons scale up, so a 48px icon doesn’t read heavier
                    than a 16px one. Outline only.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className={styles.propName}>baseSize</span> /{" "}
                    <span className={styles.propName}>baseStroke</span>
                  </td>
                  <td>
                    The reference size and stroke that adjustment is measured from. At{" "}
                    <code>baseSize</code> the stroke is exactly <code>baseStroke</code>.
                    24 / 2 matches Lucide’s and Tabler’s native weight.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.sectionSub}>Using them</h3>
          <p>
            <code>Icon</code> takes a name; components that carry icons take the same names on
            an <code>icon</code> prop. Pass <code>label</code> when the icon carries meaning on
            its own — without it the icon is treated as decorative and hidden from assistive
            tech, which is what you want beside a text label.
          </p>
          <CodeBlock code={ICON_USAGE} language="tsx" />
          <p>
            There are {CANONICAL_ICON_COUNT} canonical names. For anything outside that set,
            pass a component straight through — no registration, and only the icons you import
            ship:
          </p>
          <CodeBlock code={ICON_DIRECT} language="tsx" />
          <p className={styles.propNote}>
            Changing library later is those same two lines: swap the import, swap{" "}
            <code>library</code>. Nothing that renders an icon changes, because the names are
            canonical.
          </p>
          <p>
            Miss the registration import and <code>&lt;Icon&gt;</code> renders nothing rather
            than guessing. It logs the exact line to add, in production builds too — the case
            it’s guarding is a bundler tree-shaking the import out of a production build while
            development still works.
          </p>
        </DocsSection>

        <DocsSection
          title="Pin the default mode"
          subtitle="So the first frame paints correctly, before any JavaScript runs."
        >
          <CodeBlock code={INDEX_HTML} language="html" />
          <p>
            A theme’s <code>:root</code> block is one specific mode. If that isn’t your app’s
            default, the page paints one frame of the wrong theme before React’s first effect
            runs. The attribute removes the flash, with no JavaScript involved.
          </p>
          <p>
            Theme Builder exports let you choose which mode lands on <code>:root</code>,
            including <em>System</em> (follows <code>prefers-color-scheme</code>). Pin the
            attribute anyway if your app has a fixed default: it’s the only thing that runs
            before first paint.
          </p>
        </DocsSection>

        <DocsSection
          title="Load the fonts"
          subtitle="The theme names its typefaces. Something still has to fetch them."
        >
          <p>
            A token can say <code>--type-font-heading: 'Inter', sans-serif</code>, but naming a
            family isn’t loading it. Add the families to your document head:
          </p>
          <CodeBlock code={FONT_LINKS} language="html" />
          <p>
            Skip it and you get the theme’s <em>metrics</em> — every size, weight and
            line-height exactly right — in whatever fallback the browser picks. That looks
            deliberate, which is why it ships by accident. Don’t check by eye:{" "}
            <code>document.fonts.size</code> is <code>0</code> when nothing loaded.
          </p>
          <p>
            Theme Builder exports include a <code>fonts.ts</code> with the exact tags for your
            families, to paste or generate at build time. The theme deliberately doesn’t{" "}
            <code>@import</code> them: that hides the fetch from the preload scanner and bakes
            a CDN into your tokens.
          </p>
        </DocsSection>

        <DocsSection title="Render something">
          <CodeBlock code={APP_TSX} language="tsx" />
          <p>
            Switch modes at runtime by setting the attribute — there is nothing to re-import:
          </p>
          <CodeBlock code={TOGGLE} language="ts" />
          <p>
            That’s a DOM mutation, so nothing re-renders. Components resolve their colours
            through CSS and update immediately; code that reads <em>resolved</em> token values
            needs a <code>MutationObserver</code> on <code>data-theme</code>.
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
