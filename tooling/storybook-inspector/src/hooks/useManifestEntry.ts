/**
 * Resolves the current story to a manifest entry + its confidence/staleness/drift
 * (INSPECTOR.md §3, §6). All the "is this stale / how confident" answers come from
 * the SHARED core (`computeStalenessCore`, `similarity`) — not a panel-local
 * heuristic — so this human-facing tool and the AI-facing MCP server never diverge.
 */
import { useEffect, useState } from "react";
import { useParameter, useStorybookApi, useArgTypes } from "storybook/manager-api";
import {
  computeStalenessCore,
  entryId,
  type ComponentManifestEntry,
  type Staleness,
} from "@ui-organized/code-connect/browser";
import { loadManifestData, type ManifestData } from "../manifest-source.js";
import { resolveStory, type Resolution } from "../manifest-resolver.js";
import { computeArgDrift, type ArgDrift, type StoryArgType } from "../arg-drift.js";

export interface EntryState {
  loading: boolean;
  error?: string;
  resolution: Resolution;
  staleness: Staleness | null;
  drift: ArgDrift[];
  /** All manifest entries — for the Unmapped state's manual search (§7). */
  allEntries: ComponentManifestEntry[];
}

const NONE: Resolution = { entry: null, confidence: "none", source: "none" };

export function useManifestEntry(): EntryState {
  const [data, setData] = useState<ManifestData | null>(null);
  useEffect(() => {
    let live = true;
    loadManifestData().then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, []);

  const params = useParameter<{ componentKey?: string }>("figmaCodeConnect", {});
  const api = useStorybookApi();
  const argTypes = (useArgTypes() ?? {}) as Record<string, StoryArgType>;
  const story = api.getCurrentStoryData();

  if (!data) return { loading: true, resolution: NONE, staleness: null, drift: [], allEntries: [] };
  if (data.error || !data.manifest) {
    return { loading: false, error: data.error, resolution: NONE, staleness: null, drift: [], allEntries: [] };
  }

  const componentName = story?.title?.split("/").pop();
  const importPath = (story as { importPath?: string } | undefined)?.importPath;
  const resolution = resolveStory(data.manifest.components, {
    componentKey: params?.componentKey,
    componentName,
    importPath,
  });

  let staleness: Staleness | null = null;
  let drift: ArgDrift[] = [];
  if (resolution.entry) {
    const id = entryId(resolution.entry.codePath, resolution.entry.codeName);
    staleness = computeStalenessCore(
      resolution.entry,
      data.latestScan?.hashes[id],
      data.latestScan?.props?.[id],
    );
    drift = computeArgDrift(resolution.entry.props, argTypes);
  }

  return { loading: false, resolution, staleness, drift, allEntries: data.manifest.components };
}
