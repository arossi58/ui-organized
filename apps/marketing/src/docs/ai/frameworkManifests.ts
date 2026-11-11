/**
 * Svelte, Vue and Angular's own scanned manifests, for "Copy for AI".
 *
 * Each is a few hundred kilobytes, so they're loaded only when a reader picks
 * that library, each as its own chunk. Until one arrives the copy falls back to
 * the shared API, the same as before the scans existed; it never blocks.
 */
import { useEffect, useState } from "react";
import type { DocFramework } from "@ui-organized/code-connect/browser";
import type { ComponentManifest } from "@ui-organized/code-connect/schema";

const LOADERS: Record<Exclude<DocFramework, "react">, () => Promise<{ default: unknown }>> = {
  svelte: () => import("../../../../../manifest/frameworks/svelte.json"),
  vue: () => import("../../../../../manifest/frameworks/vue.json"),
  angular: () => import("../../../../../manifest/frameworks/angular.json"),
};

const loaded = new Map<DocFramework, ComponentManifest>();

/** The library's own manifest once it has loaded; undefined for React or while loading. */
export function useFrameworkManifest(framework: DocFramework): ComponentManifest | undefined {
  const [manifest, setManifest] = useState(() => loaded.get(framework));

  useEffect(() => {
    if (framework === "react") {
      setManifest(undefined);
      return;
    }
    const cached = loaded.get(framework);
    if (cached) {
      setManifest(cached);
      return;
    }
    let live = true;
    void LOADERS[framework]().then((module) => {
      const value = module.default as ComponentManifest;
      loaded.set(framework, value);
      if (live) setManifest(value);
    });
    return () => {
      live = false;
    };
  }, [framework]);

  return framework === "react" ? undefined : manifest;
}
