import type { DtcgType, ProjectDocument } from "@ui-organized/schema";
import {
  asPureReference,
  mergeSets,
  resolve,
  selectSetsForMode,
  type EffectiveDocument,
  type ResolvedColor,
  type ResolvedDimension,
  type ResolvedValue,
  type TokenResolution,
} from "@ui-organized/resolver";
import { applyOverrides } from "@ui-organized/token-io";
import { hexToFigmaRgba, type FigmaRGBA } from "./color.js";
import { hashValue, type StoredManifest } from "./manifest-store.js";

/**
 * Pure DTCG → Figma variable mapping + non-destructive reconciliation. No
 * `figma.*` calls — it turns (document, stored manifest) into a {@link PushPlan}
 * the sandbox (`code.ts`) executes. This is the testable heart of the plugin.
 *
 * Mapping: top-level group → collection; named mode → collection mode; token →
 * typed variable; pure reference → variable alias. The resolver is the value
 * oracle; aliases are emitted from the raw reference and ordered topologically so
 * targets exist before the variables that alias them.
 */

export type FigmaVarType = "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";

export type FigmaValue =
  | { kind: "color"; rgba: FigmaRGBA }
  | { kind: "float"; value: number }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "alias"; path: string };

export interface PlannedVariable {
  path: string;
  collection: string;
  name: string;
  type: FigmaVarType;
  valuesByMode: Record<string, FigmaValue>;
}

export type ReconcileOp =
  | { op: "create"; variable: PlannedVariable }
  | { op: "update"; id: string; variable: PlannedVariable; changedModes: string[] }
  | { op: "noop"; id: string; path: string }
  | { op: "orphan"; id: string; path: string; name: string };

export interface PushPlan {
  collections: string[];
  modes: string[];
  ops: ReconcileOp[];
  /** Topological order of paths for alias binding (targets before dependents). */
  aliasOrder: string[];
}

export interface BuildPlanOptions {
  themeName?: string;
}

// ─── Name normalization (known Figma cleanup, doc 08) ────────────────────────

const NAME_FIXES: Record<string, string> = {
  dimesnion: "dimension",
  "icon-seconadry": "icon-secondary",
};

function normalizeSegment(segment: string): string {
  const trimmed = segment.trim();
  return NAME_FIXES[trimmed] ?? trimmed;
}

/** Figma-legal variable name: collection-relative path, `/`-grouped, normalized. */
export function figmaName(path: string): string {
  const segments = path.split(".").map(normalizeSegment);
  const rest = segments.slice(1);
  return (rest.length > 0 ? rest : segments).join("/");
}

export function collectionFor(path: string): string {
  return normalizeSegment(path.split(".")[0] ?? path);
}

// ─── Type + value mapping ────────────────────────────────────────────────────

export function figmaType(type: DtcgType): FigmaVarType | null {
  switch (type) {
    case "color":
      return "COLOR";
    case "dimension":
    case "duration":
    case "number":
    case "fontWeight":
      return "FLOAT";
    case "fontFamily":
    case "strokeStyle":
      return "STRING";
    default:
      return null; // composites have no Figma variable equivalent
  }
}

function isColor(raw: ResolvedValue): raw is ResolvedColor {
  return raw !== null && typeof raw === "object" && "hex" in raw && "oklch" in raw;
}
function isDimension(raw: ResolvedValue): raw is ResolvedDimension {
  return raw !== null && typeof raw === "object" && "value" in raw && "unit" in raw;
}

function figmaValueFromResolution(resolution: TokenResolution): FigmaValue | null {
  const raw = resolution.raw;
  switch (resolution.$type) {
    case "color": {
      if (!isColor(raw)) return null;
      const rgba = hexToFigmaRgba(raw.hex);
      return rgba ? { kind: "color", rgba } : null;
    }
    case "dimension":
    case "duration":
      return isDimension(raw) ? { kind: "float", value: raw.value } : null;
    case "number":
    case "fontWeight":
      return typeof raw === "number" ? { kind: "float", value: raw } : null;
    case "fontFamily":
      if (Array.isArray(raw) && typeof raw[0] === "string") return { kind: "string", value: raw[0] };
      return typeof raw === "string" ? { kind: "string", value: raw } : null;
    case "strokeStyle":
      return typeof raw === "string" ? { kind: "string", value: raw } : null;
    default:
      return null;
  }
}

// ─── Plan ────────────────────────────────────────────────────────────────────

export function buildPushPlan(
  doc: ProjectDocument,
  manifest: StoredManifest,
  options: BuildPlanOptions = {},
): PushPlan {
  const theme = doc.themes.find((t) => t.name === (options.themeName ?? doc.themes[0]?.name));
  const modes = Object.keys(doc.modes).length > 0 ? Object.keys(doc.modes) : ["default"];
  const overrides = doc.overrides ?? {};

  const effByMode = new Map<string, EffectiveDocument>();
  const resByMode = new Map<string, Map<string, TokenResolution>>();
  for (const mode of modes) {
    const active = (theme ? selectSetsForMode(doc, theme, mode) : doc.sets).map((set) => ({
      ...set,
      tokens: applyOverrides(set.tokens, overrides),
    }));
    const eff = mergeSets(active);
    effByMode.set(mode, eff);
    resByMode.set(mode, resolve(eff, { mode }).tokens);
  }

  // Pushable paths (first-seen order), each with a Figma type.
  const pushable = new Map<string, FigmaVarType>();
  const order: string[] = [];
  for (const mode of modes) {
    for (const [path, res] of resByMode.get(mode)!) {
      if (pushable.has(path)) continue;
      const type = figmaType(res.$type);
      if (type) {
        pushable.set(path, type);
        order.push(path);
      }
    }
  }

  const planned = new Map<string, PlannedVariable>();
  const aliasEdges = new Map<string, Set<string>>();

  for (const path of order) {
    const type = pushable.get(path)!;
    const valuesByMode: Record<string, FigmaValue> = {};
    for (const mode of modes) {
      const res = resByMode.get(mode)?.get(path);
      if (!res) continue;
      const effTok = effByMode.get(mode)?.tokens.get(path);
      const refPath = effTok ? asPureReference(effTok.$value) : null;
      if (refPath && pushable.has(refPath)) {
        valuesByMode[mode] = { kind: "alias", path: refPath };
        let deps = aliasEdges.get(path);
        if (!deps) {
          deps = new Set();
          aliasEdges.set(path, deps);
        }
        deps.add(refPath);
      } else {
        const value = figmaValueFromResolution(res);
        if (value) valuesByMode[mode] = value;
      }
    }
    if (Object.keys(valuesByMode).length === 0) continue;
    planned.set(path, { path, collection: collectionFor(path), name: figmaName(path), type, valuesByMode });
  }

  const ops: ReconcileOp[] = [];
  for (const [path, variable] of planned) {
    const entry = manifest[path];
    if (!entry) {
      ops.push({ op: "create", variable });
      continue;
    }
    const changedModes = Object.keys(variable.valuesByMode).filter(
      (m) => hashValue(variable.valuesByMode[m]!) !== entry.hashByMode[m],
    );
    const metaChanged = entry.name !== variable.name || entry.collection !== variable.collection;
    if (changedModes.length === 0 && !metaChanged) ops.push({ op: "noop", id: entry.id, path });
    else ops.push({ op: "update", id: entry.id, variable, changedModes });
  }
  for (const path of Object.keys(manifest)) {
    if (!planned.has(path)) {
      const entry = manifest[path]!;
      ops.push({ op: "orphan", id: entry.id, path, name: entry.name });
    }
  }

  const collections = [...new Set([...planned.values()].map((v) => v.collection))];
  const aliasOrder = topoSort([...planned.keys()], aliasEdges);

  return { collections, modes, ops, aliasOrder };
}

/** DFS post-order: a path's alias targets are emitted before the path itself. */
function topoSort(nodes: string[], edges: Map<string, Set<string>>): string[] {
  const nodeSet = new Set(nodes);
  const visited = new Set<string>();
  const inProgress = new Set<string>();
  const result: string[] = [];
  const visit = (node: string): void => {
    if (visited.has(node) || inProgress.has(node)) return; // cycles flagged by the resolver
    inProgress.add(node);
    for (const dep of edges.get(node) ?? []) if (nodeSet.has(dep)) visit(dep);
    inProgress.delete(node);
    visited.add(node);
    result.push(node);
  };
  for (const node of nodes) visit(node);
  return result;
}
