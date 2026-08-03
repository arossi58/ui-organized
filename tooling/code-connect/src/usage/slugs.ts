/**
 * The docs-site slug of every component that has a page.
 *
 * Duplicated from the docs registry deliberately. The registry computes its
 * slugs at runtime from globbed story titles, and a `Record<ComponentSlug, …>`
 * needs them at compile time — that is what turns "you added a component and
 * forgot its guide" into a type error, and what makes a mistyped
 * cross-reference (`instead: ["progres"]`) fail while you are authoring rather
 * than as a dead link in production.
 *
 * `usage.test.ts` in the marketing app asserts this list is exactly
 * `docsComponents.map((c) => c.slug)`, so the duplication cannot drift silently.
 */
export const COMPONENT_SLUGS = [
  "accordion",
  "alert",
  "alert-dialog",
  "avatar",
  "breadcrumb",
  "button",
  "card",
  "checkbox",
  "collapsible",
  "combobox",
  "context-menu",
  "date-input",
  "date-range-input",
  "date-time-input",
  "dialog",
  "divider",
  "field-error",
  "hover-card",
  "icon",
  "input",
  "menu",
  "menubar",
  "meter",
  "navigation",
  "number-field",
  "pagination",
  "password-input",
  "popover",
  "progress",
  "radio-group",
  "range",
  "scroll-area",
  "search-input",
  "segmented-control",
  "select",
  "sheet",
  "skeleton",
  "switch",
  "tabs",
  "tag",
  "text-area",
  "toast",
  "toggle",
  "toolbar",
  "tooltip",
] as const;

export type ComponentSlug = (typeof COMPONENT_SLUGS)[number];

/**
 * `date-range-input` → `DateRangeInput`.
 *
 * The fallback display name for a cross-reference whose target has no guide
 * yet. Every slug in the system is the kebab of its exported symbol, so this
 * reverses cleanly; the docs site prefers the registry's real name, and only
 * falls back to this when a component is referenced before its page exists.
 */
export function pascalFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
