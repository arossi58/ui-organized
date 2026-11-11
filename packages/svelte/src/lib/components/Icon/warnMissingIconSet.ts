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
 * cannot reach the environment its bug occurs in is not a warning. The detailed
 * guidance stays dev-only; production gets one short line.
 *
 * Global-keyed for the same reason the registry is: this module can be
 * instantiated more than once, and a module-local Set turns "once per library"
 * quietly into "once per copy".
 */
const WARNED_KEY = Symbol.for("@ui-organized/svelte.iconSetWarnings");
type GlobalWithWarned = typeof globalThis & { [WARNED_KEY]?: Set<string> };
const warned: Set<string> = ((globalThis as GlobalWithWarned)[WARNED_KEY] ??= new Set());

/**
 * The npm package each adapter expects alongside this one.
 *
 * Heroicons has no entry because this package ships no `icons/heroicons`
 * subpath. Heroicons publishes per-framework component packages itself for React
 * and Vue but not for Svelte, and every community port on npm was last released
 * before Svelte 5. So `library="heroicons"` here is reachable only by building
 * the set yourself and passing it as `icons` — and the message below has to say
 * that rather than point at a subpath that does not exist.
 */
const PACKAGE_FOR: Partial<Record<IconLibrary, string>> = {
  lucide: "@lucide/svelte",
  tabler: "@tabler/icons-svelte",
};

export function warnMissingIconSet(library: IconLibrary, registered: IconLibrary[]): void {
  if (warned.has(library)) return;
  warned.add(library);

  const iconPackage = PACKAGE_FOR[library];
  const headline = iconPackage
    ? `[@ui-organized/svelte] <Icon> can't render: no icon set registered for "${library}". ` +
      `Add \`import "@ui-organized/svelte/icons/${library}";\` near your app entry.`
    : `[@ui-organized/svelte] <Icon> can't render: this package ships no adapter for ` +
      `"${library}". Build the set yourself and pass it to <IconProvider icons={...}>.`;

  if (process.env.NODE_ENV === "production") {
    console.warn(headline);
    return;
  }

  const detail = registered.length
    ? `Registered: ${registered.join(", ")}.`
    : "No icon sets are registered.";

  if (!iconPackage) {
    console.warn(`${headline}\n\n${detail}`);
    return;
  }

  console.warn(
    `${headline}\n\n${detail}\n\n` +
      `Icon libraries are optional peers, so the package imports none of them itself — ` +
      `that is what keeps the ones you don't use out of your install and your bundle. ` +
      `Make sure "${iconPackage}" is installed too.\n\n` +
      `If icons render in dev but not in a production build, the registration import ` +
      `was tree-shaken: check that your bundler honours this package's "sideEffects" field.`,
  );
}

/** Test seam — lets a test observe the first-warning behaviour more than once. */
export function resetIconSetWarnings(): void {
  warned.clear();
  warnedNames.clear();
}

const NAME_WARNED_KEY = Symbol.for("@ui-organized/svelte.iconNameWarnings");
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
    `[@ui-organized/svelte] <Icon name="${name}"> renders nothing: no "${library}" icon is ` +
      `registered under that name.\n\n${known}\n\n` +
      `Names are ${library}'s own, not translated between libraries. Register the icon once:\n` +
      `  import { registerIcons } from "@ui-organized/svelte/icons/${library}";\n` +
      `  registerIcons({ <the icon's export> });\n` +
      `or pass the icon itself: <Icon name={TheIcon} />.`,
  );
}
