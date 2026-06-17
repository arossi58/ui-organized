/**
 * Plugin sandbox entry. Shows the UI and handles both directions:
 *  - import: parse a theme.json from the UI, create/update variables, and stash
 *    the parametric metadata ($extensions) on the document for later export.
 *  - export: read the variables back into a theme.json and send it to the UI.
 */

import { importTheme } from "./importTheme";
import { exportTheme, META_KEY } from "./exportTheme";
import type { ThemeDoc } from "./types";

figma.showUI(__html__, { width: 380, height: 600, title: "Theme Import / Export" });

interface ImportMessage {
  type: "import";
  theme: unknown;
}
interface ExportMessage {
  type: "export";
}
interface CancelMessage {
  type: "cancel";
}
type UIMessage = ImportMessage | ExportMessage | CancelMessage;

figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === "cancel") {
    figma.closePlugin();
    return;
  }

  if (msg.type === "import") {
    try {
      const theme = validate(msg.theme);
      const report = await importTheme(theme);
      // Stash metadata the variables can't represent, so a later Export round-trips it.
      if (theme.$extensions) {
        figma.root.setPluginData(
          META_KEY,
          JSON.stringify({ $description: theme.$description, $extensions: theme.$extensions }),
        );
      }
      figma.ui.postMessage({ type: "done", report });
      const { variableCount } = report;
      figma.notify(`Imported ${variableCount} variable${variableCount === 1 ? "" : "s"}.`);
    } catch (err) {
      figma.ui.postMessage({ type: "error", message: err instanceof Error ? err.message : String(err) });
    }
    return;
  }

  if (msg.type === "export") {
    try {
      const result = await exportTheme();
      figma.ui.postMessage({ type: "exported", json: result.json, warnings: result.warnings });
      figma.notify("Exported theme.json from variables.");
    } catch (err) {
      figma.ui.postMessage({ type: "error", message: err instanceof Error ? err.message : String(err) });
    }
    return;
  }
};

/** Sanity-check the payload looks like a builder-exported theme.json. */
function validate(input: unknown): ThemeDoc {
  if (!input || typeof input !== "object") {
    throw new Error("That doesn't look like JSON.");
  }
  const t = input as ThemeDoc;
  if (!t.primitive?.color) {
    throw new Error("Missing `primitive.color` — is this a theme.json exported by the builder?");
  }
  if (!t.color?.light && !t.color?.dark) {
    throw new Error("Missing `color.light` / `color.dark`.");
  }
  return t;
}
