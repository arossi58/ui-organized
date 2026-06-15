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

export const LINKS = {
  builder: `${base}builder/`,
  storybook: `${base}storybook/`,
  github: "https://github.com",
  npm: "https://www.npmjs.com",
} as const;
