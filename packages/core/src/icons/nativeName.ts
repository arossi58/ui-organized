/**
 * Turn an icon library's export name back into the name the library itself
 * publishes the icon under.
 *
 * ── Why names are the library's own ─────────────────────────────────────────
 *
 * `Icon` takes the name you would find on lucide.dev, tabler.io or
 * heroicons.com — `x`, `x-mark`, `circle-alert` — and never a renamed
 * vocabulary of ours. That is also why one string belongs to one library:
 * Lucide's `x` is Heroicons' `x-mark`, and nothing here pretends otherwise.
 *
 * ── Why this conversion exists at all ───────────────────────────────────────
 *
 * Registration takes the icons as you imported them —
 * `registerIcons({ ChevronDown, X })` — so you never spell a name twice. The
 * export name is derived from the native one by capitalising each segment
 * (`grid-2x2` → `Grid2x2`), which loses where the dashes were, so going back is
 * a heuristic. It is checked against every icon each library ships (see
 * `nativeName.test.ts`), and the handful it cannot recover are listed there.
 * For those, a key that is already kebab-case passes straight through:
 * `registerIcons({ "h1": H1Icon })`.
 */

import type { IconLibrary } from "./registry.js";

/**
 * True when `key` is already a native name — lowercase, digits and dashes. A
 * single lowercase word (`x`, `house`) is a native name too.
 */
export function isNativeName(key: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key);
}

/**
 * Strip whatever each package adds around the base name: Tabler's `Icon`
 * prefix, Heroicons' `Icon` suffix, Lucide's optional `Icon` suffix and
 * `Lucide` prefix, and the `@ng-icons` pack prefixes (`lucideX`, `tablerX`,
 * `tablerXFill`, `heroXMark`, `heroXMarkSolid`).
 */
function stripAffixes(library: IconLibrary, name: string): string {
  switch (library) {
    case "lucide":
      return name.replace(/^[Ll]ucide(?=[A-Z0-9])/, "").replace(/(?<=.)Icon$/, "");
    case "tabler":
      return name
        .replace(/^tabler(?=[A-Z0-9])/, "")
        .replace(/^Icon(?=[A-Z0-9])/, "")
        // `@ng-icons` spells Tabler's `star-filled` as `tablerStarFill`.
        .replace(/(?<=.)Fill$/, "Filled");
    case "heroicons":
      return name
        .replace(/^hero(?=[A-Z0-9])/, "")
        .replace(/(?<=.)Solid$/, "")
        .replace(/(?<=.)Icon$/, "");
  }
}

/**
 * The native name for an export name, e.g. `IconChevronDown` → `chevron-down`,
 * `XMarkIcon` → `x-mark`, `Grid2X2` → `grid-2x2`. Native names pass through
 * unchanged.
 */
export function toNativeName(library: IconLibrary, exportName: string): string {
  if (isNativeName(exportName)) return exportName;
  const base = stripAffixes(library, exportName);
  return (
    base
      // `2X2`, `3x3`: a dimension stays one segment. Parked on `×` so the rules
      // below, which only look at letters, leave it alone.
      .replace(/(\d)[xX](?=\d)/g, "$1×")
      // `arrowUp` → `arrow-Up`, `2Tooth` → `2-Tooth`
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      // `AZ` → `A-Z`: consecutive capitals are separate single-letter segments.
      .replace(/([A-Z])(?=[A-Z])/g, "$1-")
      // `Trash2` → `Trash-2`, `Cog6` → `Cog-6`
      .replace(/([a-zA-Z])(\d)/g, "$1-$2")
      .replace(/×/g, "x")
      .toLowerCase()
  );
}
