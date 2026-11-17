/**
 * Get started's "Style the page" snippet: the document itself, from tokens.
 *
 * The library styles its components and nothing else, so a fresh app renders
 * body text in the browser's default serif and keeps a white page behind
 * dark-mode components. The apps in this repo each style their own `body` the
 * same way (`apps/marketing/src/styles/layout.css`); consumers had no such
 * line to copy.
 *
 * Its own module, rather than inline on the page like the font links, so
 * `pageCss.test.ts` can check that every token it names is one a Theme Builder
 * export declares. `--color-surface-base` is the page layer: cards, dialogs and
 * inputs sit on `--color-surface-primary` above it.
 */
export function pageCss(file: string): string {
  return `/* ${file}: your own stylesheet, loaded after the theme */
body {
  margin: 0;
  background: var(--color-surface-base);
  color: var(--color-content-primary);
  font-family: var(--type-font-body), sans-serif;
  font-size: var(--type-size-body-medium);
  line-height: var(--type-leading-body-medium);
}`;
}
