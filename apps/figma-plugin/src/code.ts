import { parseProjectDocument, type ProjectDocument } from "@ui-organized/schema";
import { buildPushPlan, type FigmaValue, type PlannedVariable, type PushPlan } from "./map.js";
import {
  hashValue,
  parseManifest,
  serializeManifest,
  PLUGIN_DATA_KEY,
  type StoredManifest,
} from "./manifest-store.js";

/**
 * The Figma sandbox entry point — the only place that calls `figma.*`. It builds
 * a {@link PushPlan} (pure) and executes it against Figma Variables, then writes
 * the stored id manifest back to the document. Orphans and the publish step are
 * surfaced to the UI, never auto-actioned (escalation: no deletes/publish without
 * explicit confirmation).
 *
 * This runtime can only be exercised inside Figma; the mapping/reconciliation it
 * relies on is unit-tested in `map.test.ts`.
 */

figma.showUI(__html__, { width: 360, height: 480 });

interface PlanMessage { type: "plan"; doc: unknown }
interface ApplyMessage { type: "apply"; doc: unknown }
type UiMessage = PlanMessage | ApplyMessage;

figma.ui.onmessage = async (message: UiMessage) => {
  try {
    const parsed = parseProjectDocument(message.doc);
    if (!parsed.ok) {
      figma.ui.postMessage({ type: "error", message: "Invalid project document." });
      return;
    }
    const manifest = parseManifest(figma.root.getPluginData(PLUGIN_DATA_KEY));
    const plan = buildPushPlan(parsed.value, manifest);

    if (message.type === "plan") {
      figma.ui.postMessage({ type: "plan-result", summary: summarize(plan) });
      return;
    }
    const summary = await applyPlan(parsed.value, plan, manifest);
    figma.ui.postMessage({ type: "applied", summary });
  } catch (error) {
    figma.ui.postMessage({ type: "error", message: error instanceof Error ? error.message : String(error) });
  }
};

function summarize(plan: PushPlan) {
  const count = (op: string) => plan.ops.filter((o) => o.op === op).length;
  return {
    create: count("create"),
    update: count("update"),
    noop: count("noop"),
    orphans: plan.ops.filter((o) => o.op === "orphan").map((o) => (o.op === "orphan" ? o.name : "")),
    collections: plan.collections,
    modes: plan.modes,
  };
}

async function applyPlan(doc: ProjectDocument, plan: PushPlan, manifest: StoredManifest) {
  // 1. Ensure collections + modes; map collection → (collection, modeName→modeId).
  const collections = await ensureCollections(plan);

  // 2. Create/update variables in alias order so targets exist before aliases.
  const idByPath: Record<string, string> = {};
  for (const [path, entry] of Object.entries(manifest)) idByPath[path] = entry.id;
  const planned = new Map<string, { variable: PlannedVariable; isUpdate: boolean; id?: string }>();
  for (const op of plan.ops) {
    if (op.op === "create") planned.set(op.variable.path, { variable: op.variable, isUpdate: false });
    else if (op.op === "update") planned.set(op.variable.path, { variable: op.variable, isUpdate: true, id: op.id });
  }

  let created = 0;
  let updated = 0;
  for (const path of plan.aliasOrder) {
    const entry = planned.get(path);
    if (!entry) continue;
    const { variable, isUpdate } = entry;
    const col = collections.get(variable.collection)!;

    let figmaVar: Variable;
    if (isUpdate && entry.id) {
      const existing = await figma.variables.getVariableByIdAsync(entry.id);
      figmaVar = existing ?? figma.variables.createVariable(variable.name, col.collection, variable.type);
      if (existing && existing.name !== variable.name) existing.name = variable.name;
      updated += 1;
    } else {
      figmaVar = figma.variables.createVariable(variable.name, col.collection, variable.type);
      created += 1;
    }
    idByPath[path] = figmaVar.id;

    for (const [mode, value] of Object.entries(variable.valuesByMode)) {
      const modeId = col.modeIds[mode];
      if (!modeId) continue;
      figmaVar.setValueForMode(modeId, await toFigmaValue(value, idByPath));
    }

    manifest[path] = {
      id: figmaVar.id,
      collection: variable.collection,
      name: variable.name,
      type: variable.type,
      hashByMode: Object.fromEntries(
        Object.entries(variable.valuesByMode).map(([m, v]) => [m, hashValue(v)]),
      ),
    };
  }

  figma.root.setPluginData(PLUGIN_DATA_KEY, serializeManifest(manifest));
  void doc; // (reserved: future per-set collection naming from the document)

  const orphans = plan.ops.filter((o) => o.op === "orphan").map((o) => (o.op === "orphan" ? o.name : ""));
  return {
    created,
    updated,
    noop: plan.ops.filter((o) => o.op === "noop").length,
    orphans,
    publishReminder: "Variables written. Publish the library in Figma to share the update.",
  };
}

interface CollectionHandle {
  collection: VariableCollection;
  modeIds: Record<string, string>;
}

async function ensureCollections(plan: PushPlan): Promise<Map<string, CollectionHandle>> {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  const byName = new Map(existing.map((c) => [c.name, c]));
  const handles = new Map<string, CollectionHandle>();

  for (const name of plan.collections) {
    const collection = byName.get(name) ?? figma.variables.createVariableCollection(name);
    const modeIds: Record<string, string> = {};
    // The first plan mode reuses the collection's default mode; the rest are added.
    plan.modes.forEach((mode, index) => {
      const found = collection.modes.find((m) => m.name === mode);
      if (found) {
        modeIds[mode] = found.modeId;
      } else if (index === 0 && collection.modes.length === 1) {
        collection.renameMode(collection.modes[0]!.modeId, mode);
        modeIds[mode] = collection.modes[0]!.modeId;
      } else {
        modeIds[mode] = collection.addMode(mode);
      }
    });
    handles.set(name, { collection, modeIds });
  }
  return handles;
}

async function toFigmaValue(value: FigmaValue, idByPath: Record<string, string>): Promise<VariableValue> {
  switch (value.kind) {
    case "color":
      return value.rgba;
    case "float":
      return value.value;
    case "string":
      return value.value;
    case "boolean":
      return value.value;
    case "alias": {
      const targetId = idByPath[value.path];
      const target = targetId ? await figma.variables.getVariableByIdAsync(targetId) : null;
      if (!target) throw new Error(`Alias target not found: ${value.path}`);
      return figma.variables.createVariableAlias(target);
    }
  }
}
