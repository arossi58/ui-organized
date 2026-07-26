/**
 * `@ui-organized/react/icons/lucide` — the Lucide adapter.
 *
 * Importing this module registers Lucide, so `<IconProvider library="lucide">`
 * resolves canonical names. This is the *only* module in the package that
 * imports `lucide-react`; nothing here is reachable from the main entry, which
 * is what keeps the other two icon libraries out of your bundle.
 *
 * ```ts
 * import "@ui-organized/react/icons/lucide";   // register, then use library="lucide"
 * ```
 *
 * Or pass it explicitly, if you'd rather not rely on import side effects:
 *
 * ```tsx
 * import { lucideIcons } from "@ui-organized/react/icons/lucide";
 * <IconProvider library="lucide" icons={lucideIcons}>
 * ```
 */

import { lucideIconSet } from "./lucide.js";
import { registerIconSet, type IconSet } from "./registry.js";

export const lucideIcons: IconSet = {
  library: "lucide",
  outline: lucideIconSet,
  // Lucide ships outline only; `style="solid"` falls back to the outline cut.
  svgProps: (size, stroke) => ({
    size,
    ...(stroke !== undefined ? { strokeWidth: stroke } : {}),
  }),
};

registerIconSet(lucideIcons);

export { lucideIconSet };
