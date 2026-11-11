/**
 * The glyphs the components themselves draw — Alert's dismiss, Select's
 * chevron, DatePicker's calendar.
 *
 * @internal Not part of any framework's public API, and never accepted by
 * `<Icon name>`. Users name icons the way their library does (`x`, `x-mark`);
 * these keys exist only so a component can ask the active library's adapter for
 * "the dismiss glyph" without knowing which library is active. That is the one
 * place a library-neutral name is unavoidable, and keeping it private is what
 * keeps it from becoming a vocabulary users have to learn.
 *
 * Each adapter maps every key to a component directly, not to a native name:
 * Lucide renamed `filter` → `funnel` and folded `trash-2` into `trash` between
 * the 0.x React package and v1, so a table of names would be right for one
 * framework and wrong for the next. The import in each adapter is checked by the
 * compiler; a name in a table would not be.
 */
export const SYSTEM_GLYPHS = [
  "close",
  "check",
  "chevron-down",
  "chevron-up",
  "chevron-left",
  "chevron-right",
  "calendar",
  "download",
  "upload",
  "copy",
  "edit",
  "trash",
  "plus",
  "minus",
  "refresh",
  "undo",
  "rotate-ccw",
  "sort",
  "sort-asc",
  "sort-desc",
  "filter",
  "search",
  "check-circle",
  "alert-circle",
  "alert-triangle",
  "info",
  "eye",
  "eye-off",
  "star",
  "tag",
  "menu",
  "grid",
  "list",
  "file",
  "folder",
  "play",
  "pause",
  "user",
  "settings",
  "home",
  "pipette",
] as const;

export type SystemGlyph = (typeof SYSTEM_GLYPHS)[number];
