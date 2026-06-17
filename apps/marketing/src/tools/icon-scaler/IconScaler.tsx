import { IconProvider } from "@ui-organized/react";
import IconScalerApp from "./IconScalerApp.jsx";

/**
 * Marketing-site entry for the Icon Scaler tool.
 *
 * Fills the embedding panel (a display:flex column with a definite height) and
 * lets the tool own its internal scrolling. Design tokens and DS component
 * stylesheets are loaded globally by the app entry, so nothing extra is
 * imported here. The whole tree is wrapped in IconProvider so the DS <Icon>
 * glyphs used throughout the UI render against the Lucide outline set.
 */
export default function IconScaler() {
  return (
    <IconProvider library="lucide" style="outline" strokeAdjustment>
      <IconScalerApp />
    </IconProvider>
  );
}
