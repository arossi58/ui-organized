import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export interface IconConfig {
  /** Active icon library. */
  library: "lucide" | "tabler" | "heroicons";
  /** Icon style — outline/stroke or solid/filled. */
  style: "outline" | "solid";
  /**
   * When true, stroke width is adjusted per size to maintain consistent
   * optical weight. Only applies to outline style.
   */
  strokeAdjustment: boolean;
}

const defaultIconConfig: IconConfig = {
  library: "lucide",
  style: "outline",
  strokeAdjustment: false,
};

export const IconContext = createContext<IconConfig>(defaultIconConfig);

export function useIconConfig(): IconConfig {
  return useContext(IconContext);
}

export interface IconProviderProps extends IconConfig {
  children: ReactNode;
}

/**
 * Provides icon configuration to all Icon components in the tree.
 * Wrap your application (or the theme builder preview) with this provider,
 * passing the icon settings from the active theme config.
 *
 * @example
 * ```tsx
 * <IconProvider library="lucide" style="outline" strokeAdjustment={true}>
 *   <App />
 * </IconProvider>
 * ```
 */
export function IconProvider({ library, style, strokeAdjustment, children }: IconProviderProps) {
  return (
    <IconContext.Provider value={{ library, style, strokeAdjustment }}>
      {children}
    </IconContext.Provider>
  );
}
