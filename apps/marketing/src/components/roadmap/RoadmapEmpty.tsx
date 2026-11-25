import { Button, EmptyState } from "@ui-organized/react";
import { FALLBACK_PROJECT_URL } from "../../lib/roadmap";
import "./roadmap-empty.css";

/**
 * Friendly fallback panel (SITE.md §7.4) for the error/empty states — never a
 * blank region. Points visitors at the live GitHub board so the roadmap is
 * always reachable even when the synced JSON is missing or has no cards.
 */
export function RoadmapEmpty({ projectUrl = FALLBACK_PROJECT_URL }: { projectUrl?: string }) {
  return (
    <EmptyState
      className="roadmap-empty"
      title="Roadmap is syncing"
      description="This board updates from GitHub Projects, and the next sync hasn’t come through yet."
      actions={
        <Button href={projectUrl} intent="primary" size="md" target="_blank" rel="noreferrer">
          Open the board on GitHub
        </Button>
      }
    />
  );
}
