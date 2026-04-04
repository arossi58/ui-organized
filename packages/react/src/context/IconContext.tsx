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

export interface IconProviderProps extends Partial<Pick<IconConfig, "baseSize" | "baseStroke">>, Omit<IconConfig, "baseSize" | "baseStroke"> {
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
export function IconProvider({
  library,
  style,
  strokeAdjustment,
  baseSize = 24,
  baseStroke = 2,
  children,
}: IconProviderProps) {
  return (
    <IconContext.Provider value={{ library, style, strokeAdjustment, baseSize, baseStroke }}>
      {children}
    </IconContext.Provider>
  );
}
