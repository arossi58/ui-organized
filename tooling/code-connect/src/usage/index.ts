/**
 * The usage guides, keyed by docs-site slug.
 *
 * Explicit imports rather than a glob: the glob would save a line per component
 * and cost the one thing that makes authoring forty-five of these tractable —
 * typed totality. Annotated as a `Record<ComponentSlug, UsageGuide>`, TypeScript
 * names the components that still have no guide, and a mistyped cross-reference
 * fails at the keystroke. A glob keyed by file path can do neither, and would
 * make this module bundler-only when `generate-ai-docs.ts` has to read it from
 * plain Node.
 *
 * The record is total: every component the docs site publishes has a guide, and
 * a forty-sixth component fails `typecheck` here until someone writes its
 * guidance. That is the point. Guidance is the one thing on a docs page nothing
 * can generate, so nothing but a human writing it will do.
 */
import { pascalFromSlug, type ComponentSlug } from "./slugs.js";
import type { UsageGuide } from "./types.js";
import { buttonUsage } from "./guides/button.js";
import { meterUsage } from "./guides/meter.js";
import { tagUsage } from "./guides/tag.js";
import { toggleUsage } from "./guides/toggle.js";
import { toolbarUsage } from "./guides/toolbar.js";
import { alertUsage } from "./guides/alert.js";
import { toastUsage } from "./guides/toast.js";
import { progressUsage } from "./guides/progress.js";
import { skeletonUsage } from "./guides/skeleton.js";
import { checkboxUsage } from "./guides/checkbox.js";
import { radioGroupUsage } from "./guides/radio-group.js";
import { switchUsage } from "./guides/switch.js";
import { segmentedControlUsage } from "./guides/segmented-control.js";
import { selectUsage } from "./guides/select.js";
import { comboboxUsage } from "./guides/combobox.js";
import { inputUsage } from "./guides/input.js";
import { searchInputUsage } from "./guides/search-input.js";
import { passwordInputUsage } from "./guides/password-input.js";
import { textAreaUsage } from "./guides/text-area.js";
import { numberFieldUsage } from "./guides/number-field.js";
import { rangeUsage } from "./guides/range.js";
import { fieldErrorUsage } from "./guides/field-error.js";
import { dateInputUsage } from "./guides/date-input.js";
import { dateRangeInputUsage } from "./guides/date-range-input.js";
import { dateTimeInputUsage } from "./guides/date-time-input.js";
import { dialogUsage } from "./guides/dialog.js";
import { alertDialogUsage } from "./guides/alert-dialog.js";
import { sheetUsage } from "./guides/sheet.js";
import { popoverUsage } from "./guides/popover.js";
import { tooltipUsage } from "./guides/tooltip.js";
import { hoverCardUsage } from "./guides/hover-card.js";
import { menuUsage } from "./guides/menu.js";
import { contextMenuUsage } from "./guides/context-menu.js";
import { menubarUsage } from "./guides/menubar.js";
import { accordionUsage } from "./guides/accordion.js";
import { collapsibleUsage } from "./guides/collapsible.js";
import { tabsUsage } from "./guides/tabs.js";
import { breadcrumbUsage } from "./guides/breadcrumb.js";
import { paginationUsage } from "./guides/pagination.js";
import { navigationUsage } from "./guides/navigation.js";
import { cardUsage } from "./guides/card.js";
import { dividerUsage } from "./guides/divider.js";
import { scrollAreaUsage } from "./guides/scroll-area.js";
import { avatarUsage } from "./guides/avatar.js";
import { iconUsage } from "./guides/icon.js";

export const USAGE_GUIDES: Record<ComponentSlug, UsageGuide> = {
  button: buttonUsage,
  meter: meterUsage,
  tag: tagUsage,
  toggle: toggleUsage,
  toolbar: toolbarUsage,
  alert: alertUsage,
  toast: toastUsage,
  progress: progressUsage,
  skeleton: skeletonUsage,
  checkbox: checkboxUsage,
  "radio-group": radioGroupUsage,
  switch: switchUsage,
  "segmented-control": segmentedControlUsage,
  select: selectUsage,
  combobox: comboboxUsage,
  input: inputUsage,
  "search-input": searchInputUsage,
  "password-input": passwordInputUsage,
  "text-area": textAreaUsage,
  "number-field": numberFieldUsage,
  range: rangeUsage,
  "field-error": fieldErrorUsage,
  "date-input": dateInputUsage,
  "date-range-input": dateRangeInputUsage,
  "date-time-input": dateTimeInputUsage,
  dialog: dialogUsage,
  "alert-dialog": alertDialogUsage,
  sheet: sheetUsage,
  popover: popoverUsage,
  tooltip: tooltipUsage,
  "hover-card": hoverCardUsage,
  menu: menuUsage,
  "context-menu": contextMenuUsage,
  menubar: menubarUsage,
  accordion: accordionUsage,
  collapsible: collapsibleUsage,
  tabs: tabsUsage,
  breadcrumb: breadcrumbUsage,
  pagination: paginationUsage,
  navigation: navigationUsage,
  card: cardUsage,
  divider: dividerUsage,
  "scroll-area": scrollAreaUsage,
  avatar: avatarUsage,
  icon: iconUsage,
};

export function getUsageGuide(slug: string | undefined): UsageGuide | undefined {
  return slug ? USAGE_GUIDES[slug as ComponentSlug] : undefined;
}

export function hasUsageGuide(slug: string): boolean {
  return getUsageGuide(slug) !== undefined;
}

/** For the AI-docs generator, which walks manifest entries by `codeName`. */
export function usageGuideForCodeName(codeName: string): UsageGuide | undefined {
  return Object.values(USAGE_GUIDES).find((guide) => guide.codeName === codeName);
}

/**
 * The name to print for a cross-referenced component.
 *
 * Prefers the referenced guide's own `codeName` — the symbol you would import —
 * and falls back to the slug's PascalCase, which is what every slug in the
 * system is the kebab of. The docs site resolves against the live registry
 * instead, so a page always shows the name its own heading uses.
 */
export function usageReferenceName(slug: string): string {
  return getUsageGuide(slug)?.codeName ?? pascalFromSlug(slug);
}

export { COMPONENT_SLUGS, pascalFromSlug, type ComponentSlug } from "./slugs.js";
export type { UsageGuide, UsageAvoid, UsageContrast, UsageAlternative } from "./types.js";
