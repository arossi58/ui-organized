/**
 * Plugin sandbox entry (has the `figma` API; no React).
 *
 * Builds a spec — the hand-authored slice, a committed rendered spec (by
 * component name), or an inline one — applying the document's persisted
 * Resolution Map (Phase 5) so manual choices stick and the build converges. The
 * `resolve` message merges new picks into that map and rebuilds.
 */

import { buildComponentSpec, type BuildReport } from "./builder";
import { buttonSlice } from "./fixtures/buttonSlice";
import { SPECS } from "./generated/specs";
import type { ComponentSpec } from "./spec";
import type { ResolutionMap } from "./resolution";

figma.showUI(__html__, { width: 400, height: 600, title: "Component Bridge" });

/** Resolution Map persisted on the document, so choices survive across runs. */
const RESOLUTIONS_KEY = "component-bridge:resolutions";

interface BuildSliceMessage {
  type: "build-slice";
}
interface BuildMessage {
  type: "build";
  component?: string;
  spec?: ComponentSpec;
}
interface ResolveMessage {
  type: "resolve";
  component: string;
  resolutions: ResolutionMap;
}
interface CancelMessage {
  type: "cancel";
}
type UIMessage = BuildSliceMessage | BuildMessage | ResolveMessage | CancelMessage;

figma.ui.onmessage = async (msg: UIMessage) => {
  try {
    if (msg.type === "cancel") {
      figma.closePlugin();
      return;
    }
    if (msg.type === "build-slice") {
      await buildAndReport(buttonSlice);
      return;
    }
    if (msg.type === "build") {
      await buildAndReport(resolveBuildSpec(msg));
      return;
    }
    if (msg.type === "resolve") {
      saveResolutions({ ...loadResolutions(), ...msg.resolutions });
      await buildAndReport(specForComponent(msg.component));
      return;
    }
  } catch (err) {
    figma.ui.postMessage({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};

async function buildAndReport(spec: ComponentSpec): Promise<void> {
  const report = await buildComponentSpec(spec, loadResolutions());
  figma.ui.postMessage({ type: "built", report });
  notify(report);
}

/** The spec for a `build` message: inline, or a committed spec by name. */
function resolveBuildSpec(msg: BuildMessage): ComponentSpec {
  if (msg.spec) return msg.spec;
  if (msg.component) return specForComponent(msg.component);
  throw new Error("build message had neither a component nor a spec.");
}

/** A committed rendered spec by name, falling back to the hand-authored Button slice. */
function specForComponent(component: string): ComponentSpec {
  const spec = SPECS[component];
  if (spec) return spec;
  if (component === "Button") return buttonSlice;
  throw new Error(`No committed spec for "${component}". Run \`generate:spec -- ${component}\` first.`);
}

function loadResolutions(): ResolutionMap {
  try {
    return JSON.parse(figma.root.getPluginData(RESOLUTIONS_KEY) || "{}") as ResolutionMap;
  } catch {
    return {};
  }
}

function saveResolutions(map: ResolutionMap): void {
  figma.root.setPluginData(RESOLUTIONS_KEY, JSON.stringify(map));
}

function notify(report: BuildReport): void {
  const variants = `${report.variantsBuilt} variant${report.variantsBuilt === 1 ? "" : "s"}`;
  const tokens = `${report.boundTokens} token${report.boundTokens === 1 ? "" : "s"} bound`;
  const open = report.unresolved.length ? `, ${report.unresolved.length} unresolved` : "";
  figma.notify(`Built ${report.component}: ${variants}, ${tokens}${open}.`);
}
