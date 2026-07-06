import type { DtcgGroup, DtcgToken, DtcgType } from "@ui-organized/schema";

/**
 * Pure helpers for manipulating a DTCG token tree (a plain `DtcgGroup` object)
 * by dot-path. No React, no Yjs — the Yjs store calls these to produce the next
 * tokens object, then writes it back to the document. Reusing the resolver's
 * `flattenSet` for *reading* keeps listing and resolution consistent.
 */

const META_KEYS = new Set(["$type", "$description", "$extensions"]);

type MutableTree = Record<string, unknown>;

function clone(tree: DtcgGroup): MutableTree {
  return JSON.parse(JSON.stringify(tree)) as MutableTree;
}

function isTokenNode(node: unknown): node is DtcgToken {
  return node !== null && typeof node === "object" && "$value" in node;
}

/** Returns the token at `path`, or `undefined` if the path is missing or a group. */
export function getTokenAt(tree: DtcgGroup, path: string): DtcgToken | undefined {
  const parts = path.split(".");
  let node: unknown = tree;
  for (const key of parts) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as MutableTree)[key];
  }
  return isTokenNode(node) ? node : undefined;
}

/**
 * Returns a new tree with `token` set at `path`, creating intermediate groups as
 * needed (and replacing any group/leaf that sits in the way).
 */
export function setTokenAt(tree: DtcgGroup, path: string, token: DtcgToken): DtcgGroup {
  const next = clone(tree);
  const parts = path.split(".");
  const leaf = parts[parts.length - 1]!;
  let node: MutableTree = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const child = node[key];
    if (child === null || typeof child !== "object" || isTokenNode(child)) {
      node[key] = {};
    }
    node = node[key] as MutableTree;
  }
  node[leaf] = token;
  return next as DtcgGroup;
}

/**
 * Returns a new tree with the token at `path` removed, pruning any group that is
 * left empty (no child tokens/groups) as a result.
 */
export function deleteTokenAt(tree: DtcgGroup, path: string): DtcgGroup {
  const next = clone(tree);
  const parts = path.split(".");
  const chain: MutableTree[] = [next];
  let node: MutableTree = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const child = node[parts[i]!];
    if (child === null || typeof child !== "object") return next as DtcgGroup;
    node = child as MutableTree;
    chain.push(node);
  }
  delete node[parts[parts.length - 1]!];

  // Prune now-empty ancestor groups (those with no non-meta children).
  for (let i = chain.length - 1; i > 0; i--) {
    const group = chain[i]!;
    const hasChildren = Object.keys(group).some((k) => !META_KEYS.has(k));
    if (hasChildren) break;
    const parent = chain[i - 1]!;
    const keyInParent = parts[i - 1]!;
    delete parent[keyInParent];
  }
  return next as DtcgGroup;
}

/** True when `path` already holds a token in the tree. */
export function hasTokenAt(tree: DtcgGroup, path: string): boolean {
  return getTokenAt(tree, path) !== undefined;
}

/** A reasonable empty `$value` for a freshly-created token of each type. */
export function defaultValueForType(type: DtcgType): DtcgToken["$value"] {
  switch (type) {
    case "color":
      return "#000000";
    case "dimension":
      return "0px";
    case "duration":
      return "200ms";
    case "number":
      return 0;
    case "fontFamily":
      return "Inter";
    case "fontWeight":
      return 400;
    case "cubicBezier":
      return [0.4, 0, 0.2, 1];
    case "typography":
      return { fontFamily: "Inter", fontSize: "16px", fontWeight: 400, lineHeight: 1.5 };
    case "shadow":
      return { color: "#000000", offsetX: "0px", offsetY: "1px", blur: "2px" };
    case "border":
      return { color: "#000000", width: "1px", style: "solid" };
    case "transition":
      return { duration: "200ms", timingFunction: [0.4, 0, 0.2, 1] };
    case "gradient":
      return [{ color: "#000000", position: 0 }];
    case "strokeStyle":
      return "solid";
    default:
      return "";
  }
}

/** Builds a new token object of the given type with a default value. */
export function makeToken(type: DtcgType): DtcgToken {
  return { $type: type, $value: defaultValueForType(type) };
}
