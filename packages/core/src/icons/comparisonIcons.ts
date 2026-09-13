/**
 * The six comparison glyphs the design system draws inside a `Chip`.
 *
 * These are **first-party** icons: they are not in Lucide, Tabler or Heroicons,
 * and they have no canonical name, so they cannot go through the icon registry
 * that the three third-party packs share. They are markup rather than
 * components because four libraries render them and only a string is portable
 * between React, Svelte, Vue and Angular — the same reason `@ng-icons` ships
 * strings, and the reason Angular's `UioIcon` already accepts one.
 *
 * GENERATED from `packages/core/src/icons/*.svg`, which is the designer's
 * handoff and the source of truth. `comparisonIcons.test.ts` re-reads those files
 * and fails if this drifts from them; regenerate rather than hand-editing.
 *
 * The one transformation applied is `#030303` → `currentColor`. The export
 * hard-codes the light-theme ink, and an icon that cannot take its colour from
 * the text beside it is an icon that is wrong in the dark theme and wrong again
 * inside a selected chip.
 */

/** Every glyph is drawn in a 16-unit box, unlike the packs' 24. */
export const COMPARISON_ICON_VIEWBOX = 16;

export const COMPARISON_ICON_NAMES = [
  "equals",
  "is-any-of",
  "contains",
  "does-not-contain",
  "starts-with",
  "ends-with",
] as const;

export type ComparisonIconName = (typeof COMPARISON_ICON_NAMES)[number];

/** Full `<svg>` markup per glyph, ready to be parsed or injected. */
export const COMPARISON_ICONS: Record<ComparisonIconName, string> = {
  equals:
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="3" y="4" width="10" height="2" fill="currentColor"/> <rect x="3" y="10" width="10" height="2" fill="currentColor"/> </svg>',
  "is-any-of":
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M5 7C5.55228 7 6 7.44772 6 8C6 8.55228 5.55228 9 5 9C4.44772 9 4 8.55228 4 8C4 7.44772 4.44772 7 5 7ZM8 7C8.55228 7 9 7.44772 9 8C9 8.55228 8.55228 9 8 9C7.44772 9 7 8.55228 7 8C7 7.44772 7.44772 7 8 7ZM11 7C11.5523 7 12 7.44772 12 8C12 8.55228 11.5523 9 11 9C10.4477 9 10 8.55228 10 8C10 7.44772 10.4477 7 11 7Z" fill="currentColor"/> </svg>',
  contains:
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="5" cy="8" r="1" fill="currentColor"/> <circle cx="8" cy="8" r="1" fill="currentColor"/> <circle cx="11" cy="8" r="1" fill="currentColor"/> <rect x="2" y="4" width="12" height="8" rx="2" stroke="currentColor" stroke-width="2"/> </svg>',
  "does-not-contain":
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14.707 2.70703L2.70703 14.707L1.29297 13.293L13.293 1.29297L14.707 2.70703Z" fill="currentColor"/> <path d="M11.6143 7.21289C11.8485 7.39591 12 7.67974 12 8C12 8.55228 11.5523 9 11 9C10.6797 9 10.3959 8.84845 10.2129 8.61426L11.6143 7.21289ZM5 7C5.31977 7 5.60308 7.15119 5.78613 7.38477L4.38477 8.78613C4.15119 8.60308 4 8.31977 4 8C4 7.44772 4.44772 7 5 7Z" fill="currentColor"/> <path d="M14.4941 4.33301C14.8135 4.80981 15 5.38305 15 6V10C15 11.6569 13.6569 13 12 13H5.82812L7.82812 11H12C12.5523 11 13 10.5523 13 10V6C13 5.94605 12.9936 5.89343 12.9854 5.8418L14.4941 4.33301ZM8.17188 5H4C3.44772 5 3 5.44772 3 6V10C3 10.0536 3.00556 10.1059 3.01367 10.1572L1.50488 11.666C1.18603 11.1894 1 10.6165 1 10V6C1 4.34315 2.34315 3 4 3H10.1719L8.17188 5Z" fill="currentColor"/> </svg>',
  "starts-with":
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="5" cy="8" r="1" fill="currentColor"/> <circle cx="8" cy="8" r="1" fill="currentColor"/> <circle cx="11" cy="8" r="1" fill="currentColor"/> <path d="M1 6C1 4.34315 2.34315 3 4 3H14V5H4C3.44772 5 3 5.44772 3 6H1ZM14 13H4C2.34315 13 1 11.6569 1 10H3C3 10.5523 3.44772 11 4 11H14V13ZM4 13C2.34315 13 1 11.6569 1 10V6C1 4.34315 2.34315 3 4 3V5C3.44772 5 3 5.44772 3 6V10C3 10.5523 3.44772 11 4 11V13ZM4 11M14 4V12V4" fill="currentColor"/> </svg>',
  "ends-with":
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="5" cy="8" r="1" fill="currentColor"/> <circle cx="8" cy="8" r="1" fill="currentColor"/> <circle cx="11" cy="8" r="1" fill="currentColor"/> <path d="M2 3H12C13.6569 3 15 4.34315 15 6H13C13 5.44772 12.5523 5 12 5H2V3ZM15 10C15 11.6569 13.6569 13 12 13H2V11H12C12.5523 11 13 10.5523 13 10H15ZM13 10M2 12V4V12M12 3C13.6569 3 15 4.34315 15 6V10C15 11.6569 13.6569 13 12 13V11C12.5523 11 13 10.5523 13 10V6C13 5.44772 12.5523 5 12 5V3Z" fill="currentColor"/> </svg>',
};
