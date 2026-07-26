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
import { docsComponents } from "../registry";
import { LINKS } from "../../lib/links";
import styles from "../components/content.module.css";

const PACKAGES: Array<[string, string]> = [
  ["@ui-organized/react", "React component library, built on Ark UI"],
  ["@ui-organized/tokens", "Design tokens — typed exports + generated CSS variables"],
  ["@ui-organized/schema", "Zod schema / types for the theme config"],
  ["@ui-organized/utils", "Colour, type-scale, spacing & semantic-token utilities"],
  ["@ui-organized/react-vite", "Vite plugin that builds & injects theme tokens"],
];

export function DocsIntroPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow="Documentation"
        title="UI Organized"
        lede={
          <>
            <strong>An open-source, token-driven design system ecosystem.</strong> A single
            theme config drives everything — design and code — so a brand colour chosen once
            shows up identically in Figma, in the component library, and on the products
            built with it. These docs are the live component reference, and they're built
            with the system itself.
          </>
        }
      />

      <DocsProse>
        <DocsSection
          title="The ecosystem"
          subtitle="One config flows through every layer."
        >
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
              <strong>Figma plugin</strong> — pushes the same config into Figma as variables,
              modes and styles, keeping design and code in lockstep.
            </li>
            <li>
              <strong>Theme builder</strong> — <Link to="/tools">a web tool</Link> to pick a
              brand + neutral, preview the whole system live, then export the tokens.
            </li>
            <li>
              <strong>Storybook</strong> — the interactive playground, with per-story controls
              and the visual-regression harness, at{" "}
              <a href={LINKS.storybook}>{LINKS.storybook}</a>.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="What makes it better">
          <ul>
            <li>
              <strong>One source of truth.</strong> Components reference semantic <em>roles</em>,
              not hexes. Re-theme by swapping the brand/neutral family — every surface, border
              and control follows. See <Link to="/docs/foundations/color">Foundations → Color</Link>.
            </li>
            <li>
              <strong>Design ↔ code parity.</strong> The Figma plugin emits the <em>same</em>{" "}
              config the code consumes, so there's no hand-translation drift between the two.
            </li>
            <li>
              <strong>Accessible by construction.</strong> Brand steps are contrast-checked
              against on-brand text, and light/dark are first-class — each token carries its
              own assignment per mode.
            </li>
            <li>
              <strong>Framework-agnostic foundation.</strong> Tokens ship as plain CSS
              variables and typed exports; the React library is one consumer, not the boundary.
            </li>
            <li>
              <strong>Built on Ark UI.</strong> Behaviour, focus management and accessibility
              come from a robust headless layer; the design system owns only the look.
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Resources">
          <ul>
            <li>
              <a href={LINKS.npmReact} target="_blank" rel="noreferrer">
                npm — @ui-organized packages
              </a>
            </li>
            <li>
              <a href={LINKS.figmaLibrary} target="_blank" rel="noreferrer">
                Figma — design library
              </a>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noreferrer">
                GitHub — source &amp; docs
              </a>
            </li>
          </ul>
          <p>
            New here? Start with <Link to="/docs/get-started">Get started</Link> to install and
            wire up the stylesheets, then <Link to="/docs/theming">Theming</Link> to make it
            yours. Browse <Link to="/docs/foundations/color">Foundations</Link> for the token
            reference, or pick any of the {docsComponents.length} components from the sidebar.
          </p>
        </DocsSection>
      </DocsProse>
    </>
  );
}
