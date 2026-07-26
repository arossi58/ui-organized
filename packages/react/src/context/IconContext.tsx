import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { IconLibrary, IconSet } from "../icons/registry.js";

export interface IconConfig {
  /**
   * Active icon library.
   *
   * The set itself must be registered by importing its subpath once —
   * `import "@ui-organized/react/icons/lucide"` — or passed as `icons`. The
   * package deliberately imports none of the icon libraries itself; see
   * `../icons/registry.ts`.
   */
  library: IconLibrary;
  /** Icon style — outline/stroke or solid/filled. */
  style: "outline" | "solid";
  /**
   * When true, stroke width is adjusted per size to maintain consistent
   * optical weight. Only applies to outline style.
   */
  strokeAdjustment: boolean;
  /**
   * The design/reference size in pixels at which the base stroke is defined.
   * At this size no adjustment is made. Defaults to 24.
   */
  baseSize: number;
  /**
   * Stroke width at the reference size. Defaults to 2, which matches
   * Lucide and Tabler's native stroke width.
   */
  baseStroke: number;
  /**
   * The icon set, supplied explicitly rather than through the import-side-effect
   * registry. Takes precedence over `library`, and is the option to reach for if
   * you'd rather not depend on module side effects (some bundlers treat them as
   * removable, and it makes the dependency legible in the code).
   */
  icons?: IconSet;
}

const defaultIconConfig: IconConfig = {
  library: "lucide",
  style: "outline",
  strokeAdjustment: false,
  baseSize: 24,
  baseStroke: 2,
};

export const IconContext = createContext<IconConfig>(defaultIconConfig);

export function useIconConfig(): IconConfig {
  return useContext(IconContext);
}

export interface IconProviderProps
  extends Partial<Pick<IconConfig, "baseSize" | "baseStroke" | "icons">>,
    Omit<IconConfig, "baseSize" | "baseStroke" | "icons"> {
  children: ReactNode;
}

/**
 * Provides icon configuration to all Icon components in the tree.
 * Wrap your application (or the theme builder preview) with this provider,
 * passing the icon settings from the active theme config.
 *
 * Register the library once, near your app entry:
 *
 * @example
 * ```tsx
 * import "@ui-organized/react/icons/lucide";
 *
 * <IconProvider library="lucide" style="outline" strokeAdjustment>
 *   <App />
 * </IconProvider>
 * ```
 *
 * Or pass the set explicitly, with no reliance on import side effects:
 *
 * @example
 * ```tsx
 * import { lucideIcons } from "@ui-organized/react/icons/lucide";
 *
 * <IconProvider library="lucide" icons={lucideIcons}>
 *   <App />
 * </IconProvider>
 * ```
 */
export function IconProvider({
  library,
  style,
  strokeAdjustment,
  baseSize = 24,
  baseStroke = 2,
  icons,
  children,
}: IconProviderProps) {
  // Memoised so the context value is referentially stable — every Icon in the
  // tree consumes it, and a fresh object each render would re-render all of them.
  const value = useMemo<IconConfig>(
    () => ({ library, style, strokeAdjustment, baseSize, baseStroke, icons }),
    [library, style, strokeAdjustment, baseSize, baseStroke, icons],
  );
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
}
