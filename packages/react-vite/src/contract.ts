/**
 * The token contract: every custom property the component CSS reads and a
 * theme has to define (`@ui-organized/core/token-contract.json`).
 *
 * The plugin checks against the contract of the library the project actually
 * has installed, not one frozen into this package: react-vite versions on its
 * own, so a snapshot would demand tokens an older library never reads, and
 * would miss the one a newer library just started reading, which is the case
 * the check exists for. The snapshot bundled at build time is only the fallback
 * for a project where no installed copy can be found.
 */

import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import bundled from "@ui-organized/core/token-contract.json" with { type: "json" };

export interface TokenContract {
  tokens: string[];
  /** Where it came from, for the error message. */
  source: string;
}

const CONTRACT = "@ui-organized/core/token-contract.json";
const LIBRARIES = ["react", "svelte", "vue", "angular"] as const;

function read(file: string, source: string): TokenContract | undefined {
  try {
    const json: unknown = JSON.parse(readFileSync(file, "utf-8"));
    const tokens = (json as { tokens?: unknown }).tokens;
    if (Array.isArray(tokens) && tokens.every((t) => typeof t === "string")) {
      return { tokens, source };
    }
  } catch {
    // Unreadable or malformed: try the next place.
  }
  return undefined;
}

function tryResolve(require: NodeJS.Require, id: string): string | undefined {
  try {
    return require.resolve(id);
  } catch {
    return undefined;
  }
}

/** `node_modules/@ui-organized/<lib>` nearest `root`, symlinks followed. */
function findLibrary(root: string, lib: string): string | undefined {
  for (let dir = root; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", "@ui-organized", lib);
    if (existsSync(candidate)) return realpathSync(candidate);
    if (dirname(dir) === dir) return undefined;
  }
}

/**
 * Find the contract for the project at `root`:
 *
 * 1. Through each installed library, so it is the contract of the core that
 *    library actually runs on. React ships a copy of core's (core's
 *    `gen:contract` writes both), and 5.x, which predates core, ships its own.
 *    The others resolve core from the library's real path: pnpm keeps core out
 *    of the project's `node_modules`, but it sits next to the library in the
 *    store.
 * 2. `@ui-organized/core` resolvable from the project itself (a layout with no
 *    `node_modules/@ui-organized/<library>` to start from).
 * 3. The snapshot bundled into this package.
 */
export function loadTokenContract(root: string): TokenContract {
  for (const lib of LIBRARIES) {
    const dir = findLibrary(root, lib);
    if (!dir) continue;
    const viaLib = tryResolve(createRequire(join(dir, "package.json")), CONTRACT);
    const found =
      read(join(dir, "token-contract.json"), `@ui-organized/${lib}/token-contract.json`) ||
      (viaLib && read(viaLib, `${CONTRACT} (via @ui-organized/${lib})`));
    if (found) return found;
  }

  const fromRoot = tryResolve(createRequire(join(root, "package.json")), CONTRACT);
  const direct = fromRoot && read(fromRoot, CONTRACT);
  if (direct) return direct;

  return {
    tokens: bundled.tokens,
    source: `the contract bundled with @ui-organized/react-vite (no installed @ui-organized/core found from ${root})`,
  };
}

/** Contract tokens the declared names don't cover, in contract order. */
export function missingTokens(declared: Iterable<string>, contract: TokenContract): string[] {
  const have = new Set(declared);
  return contract.tokens.filter((name) => !have.has(name));
}
