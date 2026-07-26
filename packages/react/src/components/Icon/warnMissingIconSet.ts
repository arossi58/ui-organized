import type { IconLibrary } from "../../icons/registry.js";

/**
 * Warn, once per library, that no icon set is registered.
 *
 * This is the single upgrade hazard in moving the icon libraries behind subpaths:
 * an app that upgrades without adding the import renders no icons and, without
 * this, gets no explanation. So the message says exactly which line to add.
 *
 * Dev-only — the check is cheap but the string is not worth shipping, and a
 * production build should have caught this in development first.
 */
/**
 * Global-keyed for the same reason the registry is: this module can be
 * instantiated more than once (the CJS build can't code-split, and a dev server
 * may serve both a pre-bundled and a source copy). A module-local Set then gives
 * each copy its own memory and the "once per library" promise quietly becomes
 * "once per copy" — which is exactly what it did before this change.
 */
const WARNED_KEY = Symbol.for("@ui-organized/react.iconSetWarnings");
type GlobalWithWarned = typeof globalThis & { [WARNED_KEY]?: Set<string> };
const warned: Set<string> = ((globalThis as GlobalWithWarned)[WARNED_KEY] ??= new Set());

export function warnMissingIconSet(library: IconLibrary, registered: IconLibrary[]): void {
  if (process.env.NODE_ENV === "production") return;
  if (warned.has(library)) return;
  warned.add(library);

  const detail = registered.length
    ? `Registered: ${registered.join(", ")}.`
    : "No icon sets are registered.";

  console.warn(
    `[@ui-organized/react] <Icon> can't render: no icon set registered for "${library}". ${detail}\n` +
      `Add this once, near your app entry:\n\n` +
      `    import "@ui-organized/react/icons/${library}";\n\n` +
      `Icon libraries are optional peers, so the package imports none of them itself — ` +
      `that is what keeps the ones you don't use out of your install and your bundle. ` +
      `Make sure "${PACKAGE_FOR[library]}" is installed too.`,
  );
}

const PACKAGE_FOR: Record<IconLibrary, string> = {
  lucide: "lucide-react",
  tabler: "@tabler/icons-react",
  heroicons: "@heroicons/react",
};

/** Test seam — lets a test observe the first-warning behaviour more than once. */
export function resetIconSetWarnings(): void {
  warned.clear();
}
