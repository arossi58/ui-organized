/**
 * The message protocol between the sandbox (`code.ts`, has the `figma` API) and
 * the UI iframe (`ui.tsx`, has `fetch` + DOM). Figma plugins are split across two
 * realms that can only talk via `postMessage`; typing both ends against these
 * shapes keeps them honest.
 */

/** GitHub + manifest location, persisted in `figma.clientStorage` (§13.2). */
export interface GhSettings {
  token: string;
  owner: string;
  repo: string;
  /** Base branch to open PRs against, e.g. "main". */
  branch: string;
  /** Repo-relative manifest path, e.g. "manifest/components.json". */
  manifestPath: string;
}

export const EMPTY_SETTINGS: GhSettings = {
  token: "",
  owner: "",
  repo: "",
  branch: "main",
  manifestPath: "manifest/components.json",
};

export type SelectionKind = "component" | "instance" | "none" | "multiple" | "other";

/** What the sandbox knows about the current selection. */
export interface SelectionInfo {
  nodeId: string;
  nodeName: string;
  kind: SelectionKind;
  /**
   * The node's intrinsic Figma component key (published key, or node id fallback)
   * — the value written both onto the node's pluginData and into the manifest so a
   * lookup by key resolves (§4.1). Empty for non-component selections.
   */
  figmaKey: string;
  /** The pluginData pointer already on the node, if any (§4.1). */
  mappedKey: string | null;
  /** Variant property names, used to rank match suggestions (§4.3). */
  variantProps: string[];
}

/** UI → sandbox. */
export type UIToSandbox =
  | { type: "ready" }
  | { type: "save-settings"; settings: GhSettings }
  | { type: "write-mapping"; componentKey: string }
  | { type: "clear-mapping" }
  | { type: "notify"; message: string }
  | { type: "resize"; height: number };

/** Sandbox → UI. */
export type SandboxToUI =
  | { type: "settings"; settings: GhSettings }
  | { type: "selection"; selection: SelectionInfo };
