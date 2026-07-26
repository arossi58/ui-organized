/**
 * Theming — the three ways to re-skin the system, and the token contract that
 * says when a theme is complete.
 *
 * The "what you can override" table is generated from
 * `packages/react/token-contract.json`, which is itself derived from the
 * component CSS. A hand-written list here would drift the moment a component
 * started reading a new token — which is the exact class of bug this page
 * documents (see `docs/theme-test.md`).
 */
import { Link } from "react-router-dom";
import { CodeBlock, DocsPageHeader, DocsProse, DocsSection } from "../components";
import { LINKS } from "../../lib/links";
import tokenContract from "../../../../../packages/react/token-contract.json";
import styles from "../components/content.module.css";

// ─── Token families, derived from the contract ───────────────────────────────

interface Family {
  prefix: string;
  label: string;
  role: string;
  themeable: boolean;
}

/**
 * Ordered by how likely you are to touch it. `themeable: false` marks the layout
 * constants — in the contract because components read them, but not something a
 * theme has any reason to change.
 */
const FAMILIES: Family[] = [
  {
    prefix: "--color-",
    label: "--color-*",
    role: "Semantic colour roles — surface, content, border, interactive, status. The only colour tokens components reference.",
    themeable: true,
  },
  {
    prefix: "--type-",
    label: "--type-*",
    role: "Font families, weights, sizes and line-heights, per scale step.",
    themeable: true,
  },
  {
    prefix: "--spacing-",
    label: "--spacing-*",
    role: "The spacing scale, generated from one base unit.",
    themeable: true,
  },
  {
    prefix: "--border-radius-",
    label: "--border-radius-*",
    role: "The radius scale, generated from one base unit.",
    themeable: true,
  },
  {
    prefix: "--radius-",
    label: "--radius-*",
    role: "Component radius aliases (interactive, checkbox, status) pointing into the scale.",
    themeable: true,
  },
  {
    prefix: "--Button-",
    label: "--Button-*",
    role: "Per-size button padding, aliased onto spacing steps.",
    themeable: true,
  },
  {
    prefix: "--control-height-",
    label: "--control-height-*",
    role: "Shared control height per size, so buttons, inputs and selects line up.",
    themeable: true,
  },
  {
    prefix: "--dimension-",
    label: "--dimension-*",
    role: "Fixed layout sizes — the sidebar rail, textarea min-heights.",
    themeable: false,
  },
  {
    prefix: "--z-index-",
    label: "--z-index-*",
    role: "Stacking order for portalled overlays: popovers below dialogs, tooltips and toasts above everything.",
    themeable: false,
  },
];

const contractTokens = tokenContract.tokens as string[];

function countFor(prefix: string): number {
  return contractTokens.filter((name) => name.startsWith(prefix)).length;
}

// `--brand` and any other single token that no prefix claims.
const CLASSIFIED = new Set(
  contractTokens.filter((name) => FAMILIES.some((f) => name.startsWith(f.prefix))),
);
const UNCLASSIFIED = contractTokens.filter((name) => !CLASSIFIED.has(name));

// ─── Snippets ────────────────────────────────────────────────────────────────

const CLI_APPLY = `npx @ui-organized/cli theme ~/Downloads/my-theme.zip`;

const CLI_CHECK = `npx @ui-organized/cli theme ~/Downloads/my-theme.zip --dry-run

✓ Theme covers all ${tokenContract.tokens.length} required tokens
✓ Fonts declared for Oswald and Inter`;

const IMPORTS = `import '@ui-organized/react/styles'   // component styles
import './styles/theme.css'           // your theme — after, so it wins`;

const OVERRIDE = `/* src/styles/theme.css — a hand-written theme */
:root {
  /* Mode-independent: type, spacing, radius, layout constants. */
  --type-font-body: 'Inter', sans-serif;
  --spacing-space-04: 16px;
  --border-radius-04: 8px;
}

[data-theme='light'] {
  --color-surface-primary: #ffffff;
  --color-content-primary: #101010;
  --color-interactive-primary-default: #008c63;
}

[data-theme='dark'] {
  --color-surface-primary: #1a1a1a;
  --color-content-primary: #f4f4f4;
  --color-interactive-primary-default: #22c58b;
}`;

const VITE_PLUGIN = `// vite.config.ts
import { themePlugin } from '@ui-organized/react-vite'

export default {
  plugins: [themePlugin({ config: './theme.json' })],
}`;

const OBSERVER = `const observer = new MutationObserver(readTokens)
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
})`;

// Relative luminance at step 1400 — see docs/theme-test.md.
const NEUTRALS: Array<[string, string, string]> = [
  ["grey", "#969696", "0.305"],
  ["stone", "#5d6e76", "0.148"],
  ["juniper", "#5c7575", "0.163"],
  ["dove", "#765e6f", "0.130"],
];

export function ThemingPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow="Documentation"
        title="Theming"
        lede={
          <>
            Every component reads its colour, type and spacing from CSS custom properties —
            never a literal. Re-theming means redefining those properties, and there are three
            ways to do it: generate a theme, write one by hand, or build one from a config at
            bundle time.
          </>
        }
      />

      <DocsProse>
        <DocsSection
          title="How theming works"
          subtitle="Three layers, and components only ever speak to the top one."
        >
          <ul>
            <li>
              <strong>Primitives</strong> — the raw palette. 37 OKLCH colour ramps of 24 steps
              each, plus the numeric spacing, radius and type scales. Nothing in a component
              references these directly.
            </li>
            <li>
              <strong>Semantic tokens</strong> — the roles.{" "}
              <code>--color-surface-primary</code>, <code>--color-content-primary</code>,{" "}
              <code>--color-interactive-primary-default</code>. Each one points at a primitive
              step, and each carries its own assignment per mode. This is the layer a theme
              re-points.
            </li>
            <li>
              <strong>Component aliases</strong> — a thin layer of shared decisions:{" "}
              <code>--radius-interactive</code>, <code>--control-height-md</code>,{" "}
              <code>--Button-Large-horizontal</code>. Named for what they do, so a change lands
              consistently everywhere.
            </li>
          </ul>
          <p>
            Because components reference roles rather than hexes, swapping the brand or neutral
            family re-flows every surface, border and control at once. See{" "}
            <Link to="/docs/foundations/color">Foundations → Color</Link> for the full palette
            and the role table.
          </p>
        </DocsSection>

        <DocsSection
          title="Option A — the Theme Builder"
          subtitle="Pick a brand and a neutral, preview the whole system, export, apply."
        >
          <p>
            Export from the <Link to="/tools">Theme Builder</Link>, then point the CLI at the
            zip. It puts every file where your project keeps things and checks the theme
            before it writes anything:
          </p>
          <CodeBlock code={CLI_APPLY} language="sh" />
          <p>
            No install step — <code>npx</code> fetches it, and it has no dependencies of its
            own. Add <code>--dry-run</code> to see the plan and the findings without writing.
          </p>
          <p>
            The checks are the reason it exists. Copying four files is{" "}
            <code>unzip &amp;&amp; cp</code>; what needs a tool is knowing whether the result
            is <em>right</em>, and each of these used to be silent — a green build and an app
            that looked plausible while rendering the wrong thing:
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Check</th>
                  <th scope="col">What it catches</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Token coverage</td>
                  <td>
                    A theme that doesn’t define everything the components read, diffed against
                    the contract below. <strong>Blocks the apply</strong> and names each one.
                  </td>
                </tr>
                <tr>
                  <td>Fonts not loadable</td>
                  <td>
                    <code>theme.css</code> copied and <code>fonts.ts</code> left behind, so the
                    head keeps loading the previous theme’s typefaces.
                  </td>
                </tr>
                <tr>
                  <td>Weights that don’t exist</td>
                  <td>
                    A family that doesn’t ship a weight the theme asks for. Google answers{" "}
                    <code>200</code> and omits the face, so only reading the returned CSS
                    reveals it.
                  </td>
                </tr>
                <tr>
                  <td>Cascade conflicts</td>
                  <td>
                    A <code>--type-font-*</code> in your own CSS that will silently beat the
                    theme.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            It refuses to overwrite when your working tree is dirty, detects where an existing{" "}
            <code>theme.css</code> lives rather than assuming a layout (<code>--out</code>{" "}
            overrides), and running it twice is a no-op. Exit code is non-zero when a check
            blocks, so it works in CI.
          </p>

          <h3 className={styles.sectionSub}>What’s in the bundle</h3>
          <p>
            Applying by hand is fine too — the CLI is a convenience over these five files, not
            a requirement:
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">File</th>
                  <th scope="col">What it is</th>
                  <th scope="col">Where it goes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className={styles.propName}>theme.css</span></td>
                  <td>The derived web stylesheet — both modes, self-contained.</td>
                  <td><code>src/styles/theme.css</code></td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>theme.json</span></td>
                  <td>DTCG tokens — the canonical config, and what the Figma plugin imports.</td>
                  <td>Version control, if you also drive Figma from it.</td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>icons.ts</span></td>
                  <td>
                    <code>IconProvider</code> config. Icons are React context, not CSS, so
                    they’re applied in code.
                  </td>
                  <td><code>src/icons.ts</code></td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>fonts.ts</span></td>
                  <td>
                    The typefaces the theme names, with the stylesheet URL that loads each.
                    CSS can name a font but not efficiently fetch one.
                  </td>
                  <td><code>src/fonts.ts</code> + tags in your head</td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>README.md</span></td>
                  <td>The same setup instructions, alongside the files.</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            However the files get there, the imports are yours to add — the CLI prints them
            rather than editing your entry module:
          </p>
          <CodeBlock code={IMPORTS} language="ts" />

          <p>
            <code>theme.css</code> resolves every semantic token to a literal at export time and
            carries the layout constants too, so it is <strong>self-contained</strong> —{" "}
            <code>@ui-organized/tokens/variables.css</code> is optional. Add it <em>before</em>{" "}
            the theme if you also want the raw primitive ramps available to reference.
          </p>
          <p>
            The export panel’s <strong>Default mode</strong> control decides which mode lands on
            bare <code>:root</code>. Both modes always ship — see{" "}
            <Link to="/docs/get-started">Get started</Link> for why pinning{" "}
            <code>data-theme</code> in your HTML is still worth doing.
          </p>
        </DocsSection>

        <DocsSection
          title="Option B — override tokens by hand"
          subtitle="No build step, no generator. Just CSS."
        >
          <CodeBlock code={OVERRIDE} language="css" />
          <p>
            Redefine only what you want to change; everything you leave alone falls through to
            the baseline. Colour tokens belong in the mode blocks, since each mode assigns them
            separately. Type, spacing, radius and the layout constants are mode-independent and
            belong on <code>:root</code>.
          </p>
        </DocsSection>

        <DocsSection
          title="Option C — build from a config"
          subtitle="A theme.json compiled into CSS at bundle time, with HMR."
        >
          <CodeBlock code={VITE_PLUGIN} language="ts" />
          <p>
            <code>@ui-organized/react-vite</code> reads a theme config, validates it against{" "}
            <code>@ui-organized/schema</code>, runs the token pipeline and injects the result —
            exposed as <code>virtual:@ui-organized/theme</code> and emitted as{" "}
            <code>ds-theme.css</code>. Editing the config in development rebuilds the tokens and
            reloads. Use this when the config is the artifact you version rather than the CSS.
          </p>
        </DocsSection>

        <DocsSection
          title="What a theme has to define"
          subtitle={`The ${contractTokens.length} custom properties the component library consumes but doesn't define.`}
        >
          <p>
            This table is generated from the library’s own stylesheets, so it can’t fall out of
            date. Anything here is fair game to override; anything <em>missing</em> from your
            theme falls back to the baseline — or, for the two constant families, to a value
            built into the component CSS.
          </p>
          <p>
            The same list ships as <code>token-contract.json</code> inside{" "}
            <code>@ui-organized/react</code>, which is what{" "}
            <code>npx @ui-organized/cli theme</code> diffs your theme against before applying
            it. You can check a theme yourself at any time:
          </p>
          <CodeBlock code={CLI_CHECK} language="sh" />
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Family</th>
                  <th scope="col">Count</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>
              <tbody>
                {FAMILIES.map((family) => (
                  <tr key={family.prefix}>
                    <td>
                      <span className={styles.propName}>{family.label}</span>
                      {!family.themeable && (
                        <span className={styles.badge} data-tone="info">
                          constant
                        </span>
                      )}
                    </td>
                    <td>{countFor(family.prefix)}</td>
                    <td>{family.role}</td>
                  </tr>
                ))}
                {UNCLASSIFIED.length > 0 && (
                  <tr>
                    <td>
                      {UNCLASSIFIED.map((name) => (
                        <span key={name} className={styles.propName}>
                          {name}
                        </span>
                      ))}
                    </td>
                    <td>{UNCLASSIFIED.length}</td>
                    <td>The brand primary, tracking your chosen primary shade.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p>
            The two <strong>constant</strong> families are worth knowing about.{" "}
            <code>--dimension-*</code> and <code>--z-index-*</code> are theme-independent —
            no theme has a reason to change them — but component CSS still reads them:{" "}
            <code>--dimension-06</code> is the sidebar’s width, and <code>--z-index-*</code> is
            the entire portalled-overlay stack. A theme that omits them used to fail silently,
            with a green build, a clean console, a sidebar shrunk to fit its content and every
            overlay stacking on DOM order. Generated themes now include them, and the component
            styles carry the token values as <code>var()</code> fallbacks so a partial theme
            still renders correctly.
          </p>
        </DocsSection>

        <DocsSection
          title="Typefaces are not loaded by the theme"
          subtitle="The one part of a theme that CSS names but cannot fetch."
        >
          <p>
            <code>--type-font-heading</code> and <code>--type-font-body</code> name families;
            they don’t load them. Add the <code>&lt;link&gt;</code> tags from your export’s{" "}
            <code>fonts.ts</code> to your document head — see{" "}
            <Link to="/docs/get-started">Get started</Link>. Skip it and you get the theme’s
            metrics in a fallback face, which looks intentional rather than broken.
          </p>
          <p>
            Two things that bite after you’ve loaded the font:
          </p>
          <ul>
            <li>
              <strong>Import order still wins.</strong> Any <code>--type-font-*</code>{" "}
              declaration in a stylesheet imported <em>after</em> the theme silently overrides
              it. Loading the font doesn’t fix that.
            </li>
            <li>
              <strong>Not every family ships every weight.</strong> The design system uses four
              (default, emphasis, strong, heavy). A display face like Anton ships only 400, so
              the builder snaps all four roles onto it and your hierarchy flattens — the picker
              says so when it happens. Where a weight is requested but not shipped, Google
              answers <code>200</code> with the face simply missing and the browser synthesises
              it, which reads heavier and looser than a real cut.
            </li>
          </ul>
        </DocsSection>

        <DocsSection
          title="Choosing a neutral"
          subtitle="Tinted neutrals don't just tint — they darken."
        >
          <p>
            Semantic tokens reference ramps by <em>fixed step index</em> (
            <code>grey.1400</code>, <code>grey.2100</code>, …), and the ramps are not
            lightness-normalised across families. Relative luminance at step 1400:
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Family</th>
                  <th scope="col">Hex</th>
                  <th scope="col">Relative luminance</th>
                </tr>
              </thead>
              <tbody>
                {NEUTRALS.map(([family, hex, luminance]) => (
                  <tr key={family}>
                    <td><span className={styles.propName}>{family}</span></td>
                    <td><code>{hex}</code></td>
                    <td>{luminance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Every tinted neutral is roughly <strong>half</strong> the luminance of{" "}
            <code>grey</code> at the same step. So swapping the neutral family shifts the
            weight of the UI, not just its hue — inactive states and skeleton placeholders read
            noticeably heavier in light mode. Not a bug, but check the builder’s light preview
            before committing to a tinted neutral.
          </p>
        </DocsSection>

        <DocsSection title="Switching modes at runtime">
          <p>
            Modes are an attribute, not a re-import — <code>data-theme="light"</code> or{" "}
            <code>"dark"</code> on any element. Set it on <code>&lt;html&gt;</code> for the whole
            page, or on a subtree for a dark island inside a light page.
          </p>
          <p>
            Setting it is a DOM mutation, so nothing re-renders. Components restyle immediately
            because they resolve through CSS; code that reads <em>computed</em> token values has
            to observe the attribute:
          </p>
          <CodeBlock code={OBSERVER} language="ts" />
        </DocsSection>

        <DocsSection title="Design ↔ code">
          <p>
            The same <code>theme.json</code> drives Figma. The{" "}
            <a href={LINKS.githubFigmaPlugin} target="_blank" rel="noreferrer">
              Theme Import plugin
            </a>{" "}
            builds Primitives, Semantic (with Light/Dark modes, aliased to primitives), Scale
            and Typography collections from it. Edit variables in Figma, export a fresh{" "}
            <code>theme.json</code>, and load it back into the builder — the round trip
            preserves your parametric settings, so the design and code sides never
            hand-translate.
          </p>
        </DocsSection>
      </DocsProse>
    </>
  );
}
