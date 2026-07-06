import type { DtcgGroup, DtcgToken } from "@ui-organized/schema";

/**
 * Pure DTCG tree helpers used by the reconciler. Operate on plain `DtcgGroup`
 * objects by dot-path; never mutate the input.
 */

const META_KEYS = new Set(["$type", "$description", "$extensions"]);
type MutableTree = Record<string, unknown>;

function clone(tree: DtcgGroup): MutableTree {
  return JSON.parse(JSON.stringify(tree)) as MutableTree;
}

function isToken(node: unknown): node is DtcgToken {
  return node !== null && typeof node === "object" && "$value" in node;
}

/** Returns the token at `path`, or `undefined` if missing or a group. */
export function getTokenAtPath(tree: DtcgGroup, path: string): DtcgToken | undefined {
  let node: unknown = tree;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as MutableTree)[key];
  }
  return isToken(node) ? node : undefined;
}

/** Every token path in the tree (dot-joined), in document order. */
export function flattenPaths(tree: DtcgGroup): string[] {
  const out: string[] = [];
  const walk = (node: MutableTree, prefix: string): void => {
    for (const [key, child] of Object.entries(node)) {
      if (META_KEYS.has(key) || child === null || typeof child !== "object") continue;
      const path = prefix ? `${prefix}.${key}` : key;
      if (isToken(child)) out.push(path);
      else walk(child as MutableTree, path);
    }
  };
  walk(tree as unknown as MutableTree, "");
  return out;
}

/**
 * Returns a new tree with `props` merged onto the token at `path` (override
 * application). Paths with no token are skipped — those are stale and handled by
 * {@link reconcileOverrides}.
 */
export function mergeProps(
  tree: DtcgGroup,
  path: string,
  props: Record<string, unknown>,
): DtcgGroup {
  const next = clone(tree);
  let node: MutableTree = next;
  const parts = path.split(".");
  for (let i = 0; i < parts.length; i++) {
    const child = node[parts[i]!];
    if (child === null || typeof child !== "object") return next as DtcgGroup;
    node = child as MutableTree;
  }
  if (isToken(node)) Object.assign(node, props);
  return next as DtcgGroup;
}

/**
 * Returns a new tree with provenance for `packId` removed from every token/group
 * (`$extensions[packId]`), dropping `$extensions` entirely when it becomes empty.
 * Used for export ("valid with `$extensions` removed") and structural detach.
 */
export function stripProvenance(tree: DtcgGroup, packId: string): DtcgGroup {
  const next = clone(tree);
  const walk = (node: MutableTree): void => {
    const ext = node.$extensions as Record<string, unknown> | undefined;
    if (ext && packId in ext) {
      delete ext[packId];
      if (Object.keys(ext).length === 0) delete node.$extensions;
    }
    for (const [key, child] of Object.entries(node)) {
      if (META_KEYS.has(key)) continue;
      if (child !== null && typeof child === "object") walk(child as MutableTree);
    }
  };
  walk(next);
  return next as DtcgGroup;
}
