/**
 * Everything the AI surface needs about Svelte, Vue and Angular, read from a repo
 * checkout: each library's export surface (what it ships, under which names, from
 * which package), its own scanned manifest, and its version.
 *
 * Node-only. The docs generator and the repo MCP server call it directly; the
 * published `@ui-organized/mcp` serialises its result at build time and reads the
 * JSON instead, because a consumer has no source to read.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { surfaceFromSources, type DocFramework, type FrameworkSurface } from "./frameworks.js";
import type { ComponentManifest } from "./schema.js";

export type OtherFramework = Exclude<DocFramework, "react">;
export const OTHER_FRAMEWORKS: readonly OtherFramework[] = ["svelte", "vue", "angular"];

/** One library's data, as the read tools and the spec generator consume it. */
export interface FrameworkData {
  surface: FrameworkSurface;
  /** Its own scan, `manifest/frameworks/<framework>.json`; absent until it has a scanner. */
  manifest?: ComponentManifest;
  version: string;
}

/** A file's text, or nothing when the package isn't in this checkout. */
function source(repo: string, path: string): string[] {
  const abs = join(repo, path);
  return existsSync(abs) ? [readFileSync(abs, "utf8")] : [];
}

/** `.ts` files directly in `dir`, then one level down — the globs the docs site uses. */
function angularSourcesIn(repo: string, dir: string, depths: Array<1 | 2>): string[] {
  const root = join(repo, dir);
  if (!existsSync(root)) return [];
  const isSource = (name: string) => name.endsWith(".ts") && !name.endsWith(".spec.ts");
  const out: string[] = [];
  for (const item of readdirSync(root, { withFileTypes: true })) {
    if (depths.includes(1) && item.isFile() && isSource(item.name)) {
      out.push(readFileSync(join(root, item.name), "utf8"));
    }
    if (depths.includes(2) && item.isDirectory()) {
      for (const name of readdirSync(join(root, item.name)).filter(isSource)) {
        out.push(readFileSync(join(root, item.name, name), "utf8"));
      }
    }
  }
  return out;
}

/** The export surface of each library, built by the same function the docs site's framework switcher uses. */
export function loadFrameworkSurfaces(repo: string): Record<OtherFramework, FrameworkSurface> {
  return {
    svelte: surfaceFromSources("svelte", {
      barrels: source(repo, "packages/svelte/src/lib/index.ts"),
      table: {
        packageName: "@ui-organized/svelte-table",
        barrels: source(repo, "packages/svelte-table/src/lib/index.ts"),
      },
    }),
    vue: surfaceFromSources("vue", {
      barrels: source(repo, "packages/vue/src/index.ts"),
      table: {
        packageName: "@ui-organized/vue-table",
        barrels: source(repo, "packages/vue-table/src/index.ts"),
      },
    }),
    angular: surfaceFromSources("angular", {
      barrels: source(repo, "packages/angular/src/public-api.ts"),
      table: {
        packageName: "@ui-organized/angular-table",
        barrels: source(repo, "packages/angular-table/src/public-api.ts"),
      },
      angularSources: [
        ...angularSourcesIn(repo, "packages/angular/src/lib", [2]),
        ...angularSourcesIn(repo, "packages/angular-table/src/lib", [1, 2]),
      ],
    }),
  };
}

export function packageVersion(repo: string, dir: string): string {
  return (JSON.parse(readFileSync(join(repo, "packages", dir, "package.json"), "utf8")) as { version: string }).version;
}

/** Surface, own manifest and version for each of Svelte, Vue and Angular. */
export function loadFrameworkData(repo: string): Record<OtherFramework, FrameworkData> {
  const surfaces = loadFrameworkSurfaces(repo);
  const out = {} as Record<OtherFramework, FrameworkData>;
  for (const fw of OTHER_FRAMEWORKS) {
    const path = join(repo, "manifest/frameworks", `${fw}.json`);
    out[fw] = {
      surface: surfaces[fw],
      ...(existsSync(path) ? { manifest: JSON.parse(readFileSync(path, "utf8")) as ComponentManifest } : {}),
      version: packageVersion(repo, fw),
    };
  }
  return out;
}
