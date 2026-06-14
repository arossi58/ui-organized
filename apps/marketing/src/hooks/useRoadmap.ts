import { useEffect, useState } from "react";
import { type RoadmapData } from "../lib/roadmap";
import fixture from "../lib/fixtures/roadmap.json";

/**
 * Loads the roadmap (SITE.md §7.2/§7.4). Fetches the deployed `roadmap.json`
 * the sync Action publishes, so visitors get the latest board without a hard
 * refresh; on any failure it falls back to the bundled fixture, so the page is
 * never blank. Returns a small state machine the board renders from:
 *
 *   loading → skeleton · ready → board · error → friendly "syncing" panel
 *
 * `error` only surfaces when even the fixture can't be read — the deployed
 * fetch failing is silently absorbed into `ready(fixture)`.
 */
export type RoadmapStatus = "loading" | "ready" | "error";

export interface RoadmapState {
  status: RoadmapStatus;
  data: RoadmapData | null;
  /** True when the shown data is the local fixture, not the deployed sync. */
  fromFixture: boolean;
}

export function useRoadmap(): RoadmapState {
  const [state, setState] = useState<RoadmapState>({
    status: "loading",
    data: null,
    fromFixture: false,
  });

  useEffect(() => {
    let cancelled = false;
    // The deployed JSON lives next to the app under the Vite base path.
    const url = `${import.meta.env.BASE_URL}roadmap.json`;

    fetch(url, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`roadmap fetch ${res.status}`);
        return res.json() as Promise<RoadmapData>;
      })
      .then((data) => {
        if (cancelled) return;
        setState({ status: "ready", data, fromFixture: false });
      })
      .catch(() => {
        if (cancelled) return;
        // Network/parse failure: fall back to the build-time fixture.
        try {
          setState({ status: "ready", data: fixture as RoadmapData, fromFixture: true });
        } catch {
          setState({ status: "error", data: null, fromFixture: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
