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
  "angle-slider",
  "avatar",
  "breadcrumb",
  "button",
  "card",
  "carousel",
  "checkbox",
  "chip",
  "clipboard",
  "collapsible",
  "color-picker",
  "combobox",
  "context-menu",
  "data-table",
  "date-input",
  "date-picker",
  "date-range-input",
  "date-time-input",
  "dialog",
  "divider",
  "editable",
  "field-error",
  "file-upload",
  "floating-panel",
  "hover-card",
  "icon",
  "image-cropper",
  "input",
  "listbox",
  "marquee",
  "menu",
  "menubar",
  "meter",
  "navigation",
  "number-field",
  "pagination",
  "password-input",
  "pin-input",
  "popover",
  "progress",
  "qr-code",
  "radio-group",
  "range",
  "rating-group",
  "scroll-area",
  "search-input",
  "segmented-control",
  "select",
  "sheet",
  "signature-pad",
  "skeleton",
  "splitter",
  "steps",
  "switch",
  "tabs",
  "tag",
  "tags-input",
  "text-area",
  "timer",
  "toast",
  "toggle",
  "toolbar",
  "tooltip",
  "tour",
  "tree-view",
] as const;

export type ComponentSlug = (typeof COMPONENT_SLUGS)[number];

/**
 * Components with a docs page but no usage guide yet.
 *
 * The guides were written against a 45-component library; this branch took it to
 * 68, and these 23 arrived without one. That is a real content gap, not a
 * bookkeeping one — each guide is hand-authored prose about when to reach for a
 * component and when not to, and there is no generating it.
 *
 * Listing them here rather than loosening `USAGE_GUIDES` to a `Partial` keeps the
 * guarantee this file exists for: `USAGE_GUIDES` is typed as every slug *except*
 * these, so adding component 69 without a guide is still a compile error. The
 * only way into this list is deliberately, in a diff someone reviews.
 *
 * `hasUsageGuide` gates the Usage tab, so a component here simply does not show
 * one. Nothing renders broken; it is just missing.
 */
export const PENDING_USAGE_SLUGS = [
  "angle-slider",
  "carousel",
  "chip",
  "clipboard",
  "color-picker",
  "data-table",
  "date-picker",
  "editable",
  "file-upload",
  "floating-panel",
  "image-cropper",
  "listbox",
  "marquee",
  "pin-input",
  "qr-code",
  "rating-group",
  "signature-pad",
  "splitter",
  "steps",
  "tags-input",
  "timer",
  "tour",
  "tree-view",
] as const;

export type PendingUsageSlug = (typeof PENDING_USAGE_SLUGS)[number];

/** Every slug that must have a guide — the total the `Record` below is keyed on. */
export type WrittenUsageSlug = Exclude<ComponentSlug, PendingUsageSlug>;


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
