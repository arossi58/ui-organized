/**
 * Theming — the three ways to re-skin the system, and the token contract that
 * says when a theme is complete.
 *
 * The "what you can override" table is generated from
 * `packages/react/token-contract.json`, which is itself derived from the
 * component CSS. A hand-written list here would drift the moment a component
 * started reading a new token — which is the exact class of bug this page
 * documents (see the header of `packages/core/src/contract.ts`).
 */
import { Link } from "react-router-dom";
import { type DocFramework } from "@ui-organized/code-connect/browser";
import { getAuthoredFamily, getCoreFamily, relativeLuminance } from "@ui-organized/utils";
import { CodeBlock, DocsPageHeader, DocsProse, DocsSection } from "../components";
import { FrameworkSwitcher, useDocsFramework } from "../frameworks";
import { LINKS } from "../../lib/links";
import { SETUP } from "./getStartedSnippets";
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
    role: "Semantic color roles: surface, content, border, interactive, status. The only color tokens components reference.",
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
    role: "Fixed layout sizes: the sidebar rail, textarea min-heights.",
    themeable: false,
  },
  {
    prefix: "--z-index-",
    label: "--z-index-*",
    role: "Stacking order for portalled overlays: anchored surfaces above dialogs, since a menu can be opened from inside one; tooltips and toasts above those.",
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

/**
 * The stylesheet step the CLI prints, for whichever library the reader picked.
 * Taken from Get started's snippets, which the CLI's own copy is tested
 * against: the numbered imports for React, Svelte and Vue, and for Angular the
 * angular.json list, since the Angular CLI is its main path.
 */
function importsFor(framework: DocFramework): { code: string; language: string } {
  const setup = SETUP[framework];
  if (setup.stylesConfig) return { code: setup.stylesConfig.code, language: "json" };
  const numbered = setup.entry.split("\n").filter((line) => /^import '.+\/\/ \d+\./.test(line));
  return { code: numbered.join("\n"), language: "ts" };
}

const OVERRIDE = `/* src/styles/theme.css: a hand-written theme */
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
}

// src/main.ts: the import is what puts the theme on the page
import 'virtual:@ui-organized/theme.css'`;

const OBSERVER = `const observer = new MutationObserver(readTokens)
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
})`;

/**
 * Step 1400 of four neutrals, as authored (what `variables.css` ships) and as
 * the Theme Builder derives them (`getCoreFamily`). Computed from the palette
 * rather than typed in, so the table can't drift from it.
 */
const NEUTRAL_STEP = "1400";
const swatch = (hex: string) => ({ hex, luminance: relativeLuminance(hex).toFixed(3) });
const NEUTRALS = ["grey", "stone", "juniper", "dove"].map((family) => ({
  family,
  authored: swatch(getAuthoredFamily(family)[NEUTRAL_STEP]!.hex),
  derived: swatch(getCoreFamily(family)[NEUTRAL_STEP]!.hex),
}));

export function ThemingPage() {
  const { framework } = useDocsFramework();
  return (
    <>
      <DocsPageHeader
        title="Theming"
        lede={
          <>
            Every component reads its color, type and spacing from CSS
            properties. Generate a theme, write one by hand, or build one from
            its theme.json at bundle time.
          </>
        }
      />

      <DocsProse>
        <DocsSection title="How theming works">
          <ul>
            <li>
              <strong>Primitives</strong> are the raw scales: 37 color ramps of 24 steps
              each, plus the spacing, radius and type scales. Components never use a color
              primitive; color always goes through a semantic role. Spacing, radius and type
              steps are the exception: component CSS reads them directly (
              <code>--spacing-space-02</code>, <code>--border-radius-full</code>,{" "}
              <code>--type-size-body-medium</code>), so changing a step changes every component
              that uses it.
            </li>
            <li>
              <strong>Semantic tokens</strong> are the roles:{" "}
              <code>--color-surface-primary</code>, <code>--color-content-primary</code>,{" "}
              <code>--color-interactive-primary-default</code>. Each points at a primitive step
              and carries its own assignment per mode. This is the layer a theme re-points.
            </li>
            <li>
              <strong>Component aliases</strong> are shared decisions:{" "}
              <code>--radius-interactive</code>, <code>--control-height-md</code>,{" "}
              <code>--Button-Large-horizontal</code>.
            </li>
          </ul>
          <p>
            Because components reference roles rather than hexes, swapping the brand or neutral
            family re-flows every surface, border and control at once. See{" "}
            <Link to="/docs/foundations/color">Foundations → Color</Link> for the full palette
            and the role table.
          </p>
        </DocsSection>

        <DocsSection title="Option A: the Theme Builder">
          <p>
            Export from the <Link to="/tools">Theme Builder</Link>, then point the CLI at the
            zip. It files each export where your project keeps it, and checks the theme before
            writing anything:
          </p>
          <CodeBlock code={CLI_APPLY} language="sh" />
          <p>
            There is no install step: <code>npx</code> fetches it, and it has no dependencies
            of its own. Add <code>--dry-run</code> to see the plan and the findings without
            writing.
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
                    Tokens the components read but the theme doesn't define, diffed against the
                    contract below. <strong>Blocks the apply</strong> and names each one. The
                    contract ships with <code>@ui-organized/core</code>, which all four libraries
                    install, so the check runs the same for each.
                  </td>
                </tr>
                <tr>
                  <td>Fonts not loadable</td>
                  <td>
                    <code>theme.css</code> copied and <code>fonts.ts</code> left behind, so the
                    head keeps loading the previous theme's typefaces.
                  </td>
                </tr>
                <tr>
                  <td>Weights that don't exist</td>
                  <td>
                    A family that doesn't ship a weight the theme asks for. Google answers{" "}
                    <code>200</code> with the face missing, so only the returned CSS reveals it.
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

          <h3 className={styles.sectionSub}>What's in the bundle</h3>
          <p>
            Applying by hand is fine too. The CLI is a convenience over these five files, not
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
                  <td>The derived web stylesheet: both modes, self-contained.</td>
                  <td><code>src/styles/theme.css</code></td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>theme.json</span></td>
                  <td>DTCG tokens: the canonical config, and what the Figma plugin imports.</td>
                  <td>Version control, if you also drive Figma from it.</td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>icons.ts</span></td>
                  <td>
                    React's <code>IconProvider</code> config. Icons are configured in code, not
                    CSS. The other libraries take the same options; see{" "}
                    <Link to="/docs/get-started#set-up-icons">Set up icons</Link>. For them the
                    CLI skips this file and prints their provider with the theme's values.
                  </td>
                  <td><code>src/icons.ts</code>, in a React app</td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>fonts.ts</span></td>
                  <td>
                    The typefaces the theme names, with the stylesheet URL that loads each.
                  </td>
                  <td><code>src/fonts.ts</code> + tags in your head</td>
                </tr>
                <tr>
                  <td><span className={styles.propName}>README.md</span></td>
                  <td>The same setup instructions, alongside the files.</td>
                  <td>n/a</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            However the files get there, the imports are yours to add. The CLI prints them for
            your library when it finishes, along with the icon set and the font links:
          </p>
          <FrameworkSwitcher label="Framework" />
          <CodeBlock {...importsFor(framework)} />

          <p>
            Order matters because <code>theme.css</code> and{" "}
            <code>@ui-organized/tokens/variables.css</code> declare the same tokens on{" "}
            <code>:root</code>, and that tie goes to whichever loads last. The component styles
            declare none of them.
          </p>
          <p>
            <code>theme.css</code> resolves every semantic token to a literal at export time and
            carries the layout constants, so it is <strong>self-contained</strong> and{" "}
            <code>variables.css</code> is optional. Keep it <em>before</em> the theme if you want
            the raw primitive ramps to reference.
          </p>
          <p>
            The export panel's <strong>Default mode</strong> control decides which mode lands on
            bare <code>:root</code>. Both modes always ship. See{" "}
            <Link to="/docs/get-started">Get started</Link> for why pinning{" "}
            <code>data-theme</code> in your HTML is still worth doing.
          </p>
        </DocsSection>

        <DocsSection
          title="Option B: override tokens by hand"
          subtitle="Plain CSS, with no build step or generator."
        >
          <CodeBlock code={OVERRIDE} language="css" />
          <p>
            Color tokens belong in the mode blocks, since each mode assigns them
            separately. Type, spacing, radius and the layout constants are
            mode-independent, so they belong on <code>:root</code>.
          </p>
        </DocsSection>

        <DocsSection
          title="Option C: build from theme.json"
          subtitle="The Theme Builder's theme.json, compiled into CSS at bundle time."
        >
          <CodeBlock code={VITE_PLUGIN} language="ts" />
          <p>
            <code>@ui-organized/react-vite</code> reads the <code>theme.json</code> from a Theme
            Builder export and writes the same stylesheet the builder exports as{" "}
            <code>theme.css</code>, into your bundle's CSS. The build fails, naming each one, if
            the theme leaves out a token the components read. Editing <code>theme.json</code> in
            development updates the page in place, without a reload.
          </p>
          <p>
            It reads the token values rather than the builder's settings, so a{" "}
            <code>theme.json</code> re-exported from Figma keeps every variable a designer edited
            there, which loading it back into the builder does not. Use this when{" "}
            <code>theme.json</code>, not the CSS, is the file you version. Despite the name,
            nothing in it is React-specific: it works the same with all four libraries, in any
            app Vite builds.
          </p>
        </DocsSection>

        <DocsSection title="What a theme has to define">
          <p>
            The same list ships as <code>token-contract.json</code> inside{" "}
            <code>@ui-organized/core</code>, which every library installs. It is what the CLI
            diffs your theme against before applying it. Check a theme yourself at any time:
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

        </DocsSection>

        <DocsSection title="Typefaces are not loaded by the theme">
          <p>
            <code>--type-font-heading</code> and <code>--type-font-body</code> name families;
            they don't load them. Add the <code>&lt;link&gt;</code> tags from your export's{" "}
            <code>fonts.ts</code> to your document head. See{" "}
            <Link to="/docs/get-started">Get started</Link>.
          </p>
          <p>Two things to be aware of after the font loads:</p>
          <ul>
            <li>
              <strong>Import order still wins.</strong> Any <code>--type-font-*</code>{" "}
              declaration in a stylesheet imported <em>after</em> the theme silently overrides
              it.
            </li>
            <li>
              <strong>Not every family ships every weight.</strong> The system uses four
              (default, emphasis, strong, heavy). A display face like Anton ships only 400, so
              all four roles snap onto it and your hierarchy flattens. The picker says so when
              it happens. Ask for a weight a family doesn't ship and Google answers{" "}
              <code>200</code> with the face missing, leaving the browser to synthesise
              something heavier and looser than a real cut.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Choosing a neutral">
          <p>
            Semantic tokens reference the neutral by fixed step (<code>grey.1400</code>,{" "}
            <code>grey.2100</code>, …). The Theme Builder re-derives every neutral to grey's
            per-step lightness: it keeps the family's hue and adds chroma, giving up at most 0.02
            L at the lightest steps. Switching the neutral there changes the tint of the UI, not
            its weight, and contrast holds for every brand × neutral.
          </p>
          <p>
            The raw ramps in <code>@ui-organized/tokens/variables.css</code> are the authored
            palette and are not normalised. If you point neutral roles at them by hand (Option
            B), expect a heavier UI: at step 1400 the tinted families sit at about half grey's
            luminance. Hex and relative luminance at step 1400:
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="sr-only">
                Neutral families at step 1400, as authored and as the Theme Builder derives them
              </caption>
              <thead>
                <tr>
                  <th scope="col">Family</th>
                  <th scope="col">variables.css</th>
                  <th scope="col">Theme Builder</th>
                </tr>
              </thead>
              <tbody>
                {NEUTRALS.map(({ family, authored, derived }) => (
                  <tr key={family}>
                    <td><span className={styles.propName}>{family}</span></td>
                    <td>
                      <code>{authored.hex}</code> {authored.luminance}
                    </td>
                    <td>
                      <code>{derived.hex}</code> {derived.luminance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocsSection>

        <DocsSection title="Switching modes at runtime">
          <p>
            Modes are an attribute, not a re-import: <code>data-theme="light"</code> or{" "}
            <code>"dark"</code> on any element. Set it on <code>&lt;html&gt;</code> for the whole
            page, or on a subtree for a dark island inside a light page.
          </p>
          <p>
            Setting it is a DOM mutation, so nothing re-renders. Components restyle immediately
            because they resolve through CSS; code that reads <em>computed</em> token values
            must observe the attribute:
          </p>
          <CodeBlock code={OBSERVER} language="ts" />
        </DocsSection>

        <DocsSection title="Design ↔ code">
          <p>
            The same <code>theme.json</code> drives Figma. The{" "}
            <a href={LINKS.githubFigmaPlugin} target="_blank" rel="noreferrer">
              Theme Import plugin
            </a>{" "}
            builds Primitives, Semantic (Light/Dark, aliased to primitives), Scale and
            Typography collections from it, plus Icons when dynamic stroke scaling is on.
          </p>
          <p>
            Exporting from the plugin and loading the file into the builder restores the
            builder's inputs: brand, neutral and tint, primary shade, type scale, line heights,
            fonts and weights, radius and spacing bases, and icons. The builder re-derives
            everything else from those inputs, so edits to individual color, spacing, radius or
            component variables made in Figma are not carried back. The builder lists the values
            it replaced when you load the file. Make those changes in the builder, or keep the
            Figma-exported <code>theme.json</code> as your source and build it with{" "}
            <a href="#option-c-build-from-theme-json">Option C</a>, which reads its token values
            as they are.
          </p>
        </DocsSection>
      </DocsProse>
    </>
  );
}
