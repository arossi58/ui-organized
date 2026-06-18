/**
 * Destinations referenced across the site.
 *
 * The builder and Storybook are sibling apps published under the same Pages
 * deployment as this site — builder at `<base>builder/`, Storybook at
 * `<base>storybook/`. `import.meta.env.BASE_URL` is "/" in dev and "/<repo>/"
 * on GitHub Pages (always trailing-slashed), so these resolve correctly in both
 * (note: in local `vite dev` the sibling apps run on their own ports and aren't
 * mounted under the marketing dev server).
 */
const base = import.meta.env.BASE_URL;

/** The public source repository — the canonical home for issues, PRs, source. */
const repo = "https://github.com/arossi58/ui-organized";

export const LINKS = {
  builder: `${base}builder/`,
  storybook: `${base}storybook/`,
  github: repo,
  /** The Figma plugin that imports a theme.json into Figma Variables. */
  githubFigmaPlugin: `${repo}/tree/main/tooling/figma-plugin`,
  npm: "https://www.npmjs.com",
  /** The published React component library on npm. */
  npmReact: "https://www.npmjs.com/package/@ui-organized/react",
} as const;
