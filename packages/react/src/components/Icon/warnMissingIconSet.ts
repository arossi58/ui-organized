import type { IconLibrary } from "../../icons/registry.js";

/**
 * Warn, once per library, that no icon set is registered.
 *
 * This is the upgrade hazard in moving the icon libraries behind subpaths: an
 * app that never adds the import renders no icons, and without this gets no
 * explanation. So the message says exactly which line to add.
 *
 * **Fires in production too, deliberately.** It was dev-only, on the reasoning
 * that a production build should have caught the problem in development first.
 * That reasoning was wrong in the one case that mattered: a `sideEffects` field
 * that omitted the icon modules let bundlers tree-shake the registration out of
 * *production builds only*. Dev rendered icons; `vite build` rendered none, with
 * no warning — because the only warning was suppressed exactly where the failure
 * lived. A warning that can't reach the environment its bug occurs in is not a
 * warning. The detailed guidance stays dev-only; production gets one short line.
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
  if (warned.has(library)) return;
  warned.add(library);

  const headline =
    `[@ui-organized/react] <Icon> can't render: no icon set registered for "${library}". ` +
    `Add \`import "@ui-organized/react/icons/${library}";\` near your app entry.`;

  if (process.env.NODE_ENV === "production") {
    // Short, because it ships. Long enough to be actionable on its own — someone
    // reading a production console should not have to go and reproduce in dev.
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

const PACKAGE_FOR: Record<IconLibrary, string> = {
  lucide: "lucide-react",
  tabler: "@tabler/icons-react",
  heroicons: "@heroicons/react",
};

/** Test seam — lets a test observe the first-warning behaviour more than once. */
export function resetIconSetWarnings(): void {
  warned.clear();
}
