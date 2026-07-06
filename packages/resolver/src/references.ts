/**
 * Reference parsing — the primitive the dependency graph and resolver are built
 * on. A reference is a `{group.token}` alias inside a string `$value` or any
 * sub-field of a composite.
 */

/** Matches a single `{group.token}` alias. */
const REFERENCE_TOKEN = /\{([^{}]+)\}/g;

/** Matches a `$value` that is exactly one reference and nothing else. */
const PURE_REFERENCE = /^\s*\{([^{}]+)\}\s*$/;

/**
 * Extracts every `{group.token}` reference from a raw `$value`, recursing into
 * composite objects and arrays. References are returned de-duplicated, in
 * first-seen order, with surrounding whitespace trimmed.
 *
 * It does not validate that the targets exist — that is resolution's job (an
 * unknown target becomes a typed `unknown-token` miss).
 */
export function parseReferences(value: unknown): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  const visit = (node: unknown): void => {
    if (typeof node === "string") {
      for (const match of node.matchAll(REFERENCE_TOKEN)) {
        const ref = match[1]!.trim();
        if (ref.length > 0 && !seen.has(ref)) {
          seen.add(ref);
          found.push(ref);
        }
      }
    } else if (Array.isArray(node)) {
      for (const item of node) visit(item);
    } else if (node !== null && typeof node === "object") {
      for (const item of Object.values(node)) visit(item);
    }
  };

  visit(value);
  return found;
}

/**
 * If `value` is exactly a single reference (e.g. `"{color.brand}"`), returns the
 * referenced path; otherwise `null`. Used to distinguish a pure alias (which
 * adopts its referent's resolved value and type) from an expression that merely
 * contains references.
 */
export function asPureReference(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = PURE_REFERENCE.exec(value);
  return match ? match[1]!.trim() : null;
}

/** True when a string contains at least one `{…}` reference. */
export function containsReference(value: string): boolean {
  return /\{[^{}]+\}/.test(value);
}
