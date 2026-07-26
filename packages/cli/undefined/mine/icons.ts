/**
 * Icon configuration exported from the UI Organized Theme Builder.
 *
 * Icons are runtime React context, not CSS — wrap your app with <IconProvider>
 * so every <Icon> inherits the chosen library, style, reference size and stroke
 * scaling.
 *
 * Two things to install and import:
 *
 *   npm i lucide-react
 *
 *   import "@ui-organized/react/icons/lucide";   // registers the icon set
 *   import { IconProvider } from "@ui-organized/react";
 *   import { iconConfig } from "./icons";
 *
 *   <IconProvider {...iconConfig}>
 *     <App />
 *   </IconProvider>
 *
 * The subpath import is required: @ui-organized/react imports no icon library
 * itself, which is what keeps the two you didn't choose out of your bundle.
 */
import type { IconConfig } from "@ui-organized/react";

export const iconConfig: IconConfig = {
  library: "lucide",
  style: "outline",
  strokeAdjustment: false,
  baseSize: 24,
  baseStroke: 2,
};
