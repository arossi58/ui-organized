/**
 * The Introduction page — a port of `apps/storybook/src/Introduction.mdx`.
 *
 * Ported to TSX rather than kept as MDX: it's ~60 lines of prose, and adding an
 * MDX toolchain to the marketing build to render three static pages would cost
 * more than it saves. The content is deliberately kept in step with the
 * Storybook original; the tables and swatches on the Foundations pages ARE
 * shared, so the parts that can drift meaningfully don't.
 */
import { Link } from "react-router-dom";
import { DocsPageHeader, DocsProse, DocsSection, EcosystemDiagram } from "../components";
import { LINKS } from "../../lib/links";
import styles from "../components/content.module.css";

// The ones an app installs, grouped the way a reader picks them: one library,
// optionally its table, plus the shared token and tooling packages. Internal
// packages (resolver, export, token-io) are published as dependencies of these
// and left out on purpose.
const PACKAGES: Array<[string, string]> = [
  ["@ui-organized/react", "React component library, built on Ark UI"],
  ["@ui-organized/svelte", "Svelte 5 component library, built on Ark UI"],
  ["@ui-organized/vue", "Vue 3 component library, built on Ark UI"],
  ["@ui-organized/angular", "Angular component library, built on the Angular CDK"],
  [
    "@ui-organized/{react,svelte,vue,angular}-table",
    "The data table for each library, installed alongside it",
  ],
  ["@ui-organized/core", "The framework-neutral stylesheets and variant recipes all four share"],
  ["@ui-organized/table-core", "The framework-neutral table engine the four table packages share"],
  ["@ui-organized/tokens", "Design tokens: typed exports and generated CSS variables"],
  ["@ui-organized/schema", "Zod schema / types for the theme config"],
  ["@ui-organized/utils", "Color, type-scale, spacing & semantic-token utilities"],
  ["@ui-organized/react-vite", "Vite plugin that builds & injects theme tokens (any framework)"],
  ["@ui-organized/cli", "uiorg: applies a theme bundle, and sets up AI coding agents"],
  ["@ui-organized/mcp", "MCP server giving AI agents each library's real components and tokens"],
];

export function DocsIntroPage() {
  return (
    <>
      <DocsPageHeader
        title="UI Organized"
        lede={
          <>
            UI Organized is an open-source, token-driven design system. One
            theme config drives design and code, so a brand color chosen once
            looks identical in Figma, in the component library, and in the
            products built with it.
          </>
        }
      />

      <DocsProse>
        <DocsSection title="The ecosystem">
          <EcosystemDiagram />
        </DocsSection>

        <DocsSection title="Published packages">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Package</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGES.map(([name, role]) => (
                  <tr key={name}>
                    <td>
                      <span className={styles.propName}>{name}</span>
                    </td>
                    <td>{role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocsSection>

        <DocsSection title="Tools">
          <ul>
            <li>
              <strong>Figma plugin.</strong> Pushes the same config into Figma as variables
              and modes, so design and code stay in step.
            </li>
            <li>
              <strong>Theme builder.</strong> <Link to="/tools">A web tool</Link> to pick a
              brand and neutral, preview the whole system live, then export the tokens.
            </li>
            <li>
              <strong>CLI.</strong> <code>npx @ui-organized/cli theme &lt;bundle.zip&gt;</code>{" "}
              applies an export. Before it writes, it checks that the theme covers every token
              the components read, that its typefaces load, and that your own CSS doesn't
              override it. See <Link to="/docs/theming">Theming</Link>.
            </li>
            <li>
              <strong>AI agents.</strong> Run <code>npx @ui-organized/cli init</code> once, then
              ask your coding agent for a screen, a component or a Figma link. It builds with
              your library&apos;s real components and tokens instead of inventing them. See{" "}
              <Link to="/docs/use-with-ai">Use with AI</Link>.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Design decisions">
          <ul>
            <li>
              <strong>One source of truth.</strong> Components reference semantic <em>roles</em>,
              not hexes. Swap the brand or neutral family and the whole UI follows. See{" "}
              <Link to="/docs/foundations/color">Foundations → Color</Link>.
            </li>
            <li>
              <strong>Design ↔ code parity.</strong> The Figma plugin emits the <em>same</em>{" "}
              config the code consumes, so there's no hand-translation.
            </li>
            <li>
              <strong>Accessible by construction.</strong> Brand steps are contrast-checked against on-brand text, and each token carries its own assignment per mode.
            </li>
            <li>
              <strong>One core, four libraries.</strong> Tokens ship as plain CSS variables, and every component's styles and variants live in <code>@ui-organized/core</code>.
              React, Svelte, Vue and Angular render the same classes from it, and a parity gate
              checks that their markup agrees.
            </li>
            <li>
              <strong>Headless behaviour underneath.</strong> Focus management, keyboard
              handling and accessibility come from a headless layer: Ark UI for React, Svelte
              and Vue, the Angular CDK for Angular. The design system owns only the look.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Resources">
          <ul>
            <li>
              <a href={LINKS.npmOrg} target="_blank" rel="noreferrer">
                npm: @ui-organized packages
              </a>
            </li>
            <li>
              <a href={LINKS.figmaLibrary} target="_blank" rel="noreferrer">
                Figma: design library
              </a>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noreferrer">
                GitHub: source &amp; docs
              </a>
            </li>
          </ul>
        </DocsSection>
      </DocsProse>
    </>
  );
}
