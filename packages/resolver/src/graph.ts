import { parseReferences } from "./references.js";
import type { DependencyGraph, EffectiveDocument } from "./types.js";

/**
 * Builds the reference dependency graph of an effective document. Out-edges are
 * the direct `{…}` references parsed from each token's `$value` (including
 * composite sub-fields). Edges to non-existent tokens are kept so the editor can
 * surface dangling references; cycle detection ignores them.
 *
 * This is exposed for the editor's dependency view. Resolution detects cycles
 * inline during its memoized traversal — it does not depend on this function.
 */
export function buildGraph(doc: EffectiveDocument): DependencyGraph {
  const nodes = new Map<string, { path: string; references: string[] }>();
  for (const [path, token] of doc.tokens) {
    nodes.set(path, { path, references: parseReferences(token.$value) });
  }
  return { nodes };
}

/**
 * Finds reference cycles via DFS coloring. Returns each detected cycle as the
 * ordered list of paths forming the loop. Cycles are de-duplicated by membership,
 * and only edges to existing nodes are traversed.
 */
export function findCycles(graph: DependencyGraph): string[][] {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const stack: string[] = [];
  const cycles: string[][] = [];
  const seen = new Set<string>();

  const visit = (path: string): void => {
    color.set(path, GRAY);
    stack.push(path);
    const node = graph.nodes.get(path);
    for (const ref of node?.references ?? []) {
      if (!graph.nodes.has(ref)) continue;
      const c = color.get(ref) ?? WHITE;
      if (c === WHITE) {
        visit(ref);
      } else if (c === GRAY) {
        const start = stack.indexOf(ref);
        if (start >= 0) {
          const cycle = stack.slice(start);
          const key = [...cycle].sort().join("|");
          if (!seen.has(key)) {
            seen.add(key);
            cycles.push(cycle);
          }
        }
      }
    }
    stack.pop();
    color.set(path, BLACK);
  };

  for (const path of graph.nodes.keys()) {
    if ((color.get(path) ?? WHITE) === WHITE) visit(path);
  }
  return cycles;
}
