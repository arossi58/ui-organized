/**
 * Registers the Figma-style Inspector panel with Storybook (INSPECTOR.md §2).
 * Runs in the manager (chrome) realm; the panel talks to the preview iframe only
 * through Storybook's args channel (§5).
 */
import { addons, types } from "storybook/manager-api";
import { AddonPanel } from "storybook/internal/components";
import { Panel } from "./Panel.js";
import styles from "./figma-tokens.css";

// Inject the Figma-panel styles once (the CSS is bundled as text).
if (typeof document !== "undefined" && !document.getElementById("fcp-styles")) {
  const tag = document.createElement("style");
  tag.id = "fcp-styles";
  tag.textContent = styles;
  document.head.appendChild(tag);
}

const ADDON_ID = "figma-inspector";
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Inspector",
    match: ({ viewMode }) => viewMode === "story",
    render: ({ active }) => (
      <AddonPanel active={!!active}>
        <Panel />
      </AddonPanel>
    ),
  });
});
