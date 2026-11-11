import type { IconLibrary } from "../../icons/registry.js";

/**
 * Warn, once per library, that no icon set is registered.
 *
 * This is the upgrade hazard in putting the icon libraries behind subpaths: an
 * app that never adds the import renders no icons, and without this gets no
 * explanation. So the message says exactly which line to add.
 *
 * **Fires in production too, deliberately.** A `sideEffects` field that omits
 * the icon modules lets bundlers tree-shake the registration out of production
 * builds only — dev renders icons, `vite build` renders none. A warning that
 * cannot reach the environment its bug occurs in is not a warning.
 *
 * Global-keyed for the same reason the registry is: this module can be
 * instantiated more than once, and a module-local Set turns "once per library"
 * quietly into "once per copy".
 */
const WARNED_KEY = Symbol.for("@ui-organized/vue.iconSetWarnings");
type GlobalWithWarned = typeof globalThis & { [WARNED_KEY]?: Set<string> };
const warned: Set<string> = ((globalThis as GlobalWithWarned)[WARNED_KEY] ??= new Set());

const PACKAGE_FOR: Record<IconLibrary, string> = {
  // `lucide-vue-next` is deprecated on npm in favour of this one.
  lucide: "@lucide/vue",
  tabler: "@tabler/icons-vue",
  heroicons: "@heroicons/vue",
};

export function warnMissingIconSet(library: IconLibrary, registered: IconLibrary[]): void {
  if (warned.has(library)) return;
  warned.add(library);

  const headline =
    `[@ui-organized/vue] <Icon> can't render: no icon set registered for "${library}". ` +
    `Add \`import "@ui-organized/vue/icons/${library}";\` near your app entry.`;

  if (process.env.NODE_ENV === "production") {
    console.warn(headline);
    return;
  }

  const detail = registered.length
    ? `Registered: ${registered.join(", ")}.`
    : "No icon sets are registered.";

  console.warn(
    `${headline}\n\n${detail}\n\n` +
      `Icon libraries are optional peers, so the package imports none of them itself — ` +
      `that is what keeps the ones you don't use out of your install and your bundle. ` +
      `Make sure "${PACKAGE_FOR[library]}" is installed too.\n\n` +
      `If icons render in dev but not in a production build, the registration import ` +
      `was tree-shaken: check that your bundler honours this package's "sideEffects" field.`,
  );
}

/** Test seam — lets a test observe the first-warning behaviour more than once. */
export function resetIconSetWarnings(): void {
  warned.clear();
  warnedNames.clear();
}

const NAME_WARNED_KEY = Symbol.for("@ui-organized/vue.iconNameWarnings");
type GlobalWithNameWarned = typeof globalThis & { [NAME_WARNED_KEY]?: Set<string> };
const warnedNames: Set<string> = ((globalThis as GlobalWithNameWarned)[NAME_WARNED_KEY] ??=
  new Set());

/**
 * Warn, once per library and name, that an icon name matches nothing
 * registered. Names are the library's own, so the usual causes are a name from
 * a different library (`x-mark` is Heroicons; Lucide calls it `x`) or a
 * forgotten `registerIcons` call. Dev-only: unlike a missing set, this cannot be
 * caused by a production-only bundling difference.
 */
export function warnMissingIcon(library: IconLibrary, name: string, registered: string[]): void {
  if (process.env.NODE_ENV === "production") return;
  const key = `${library}:${name}`;
  if (warnedNames.has(key)) return;
  warnedNames.add(key);

  const known = registered.length
    ? `Registered for ${library}: ${registered.join(", ")}.`
    : `No icons are registered for ${library} yet.`;
  console.warn(
    `[@ui-organized/vue] <Icon name="${name}"> renders nothing: no "${library}" icon is ` +
      `registered under that name.\n\n${known}\n\n` +
      `Names are ${library}'s own, not translated between libraries. Register the icon once:\n` +
      `  import { registerIcons } from "@ui-organized/vue/icons/${library}";\n` +
      `  registerIcons({ <the icon's export> });\n` +
      `or pass the icon itself: <Icon :name="TheIcon" />.`,
  );
}
