import { Badge } from "@ui-organized/react";
import { type RoadmapData, timeAgo } from "../../lib/roadmap";
import "./sync-status.css";

/**
 * Freshness pill for the section header (the mockup's "Last Updated …" status):
 * a design-system info `Badge`, wrapped in a link to the project board so the
 * invite to contribute stays one click away. When the data is the local fixture
 * (the deployed sync wasn't reachable) it says "Preview data" rather than
 * claiming to be live (SITE.md §7.4).
 */
export function SyncStatus({ data, fromFixture }: { data: RoadmapData; fromFixture: boolean }) {
  const label = fromFixture ? "Preview data" : `Last updated ${timeAgo(data.syncedAt)}`;

  return (
    <a
      className="sync-status"
      href={data.projectUrl}
      target="_blank"
      rel="noreferrer"
      title="Open the project board"
    >
      <Badge variant="info" emphasized={false} size="sm">
        {label}
      </Badge>
    </a>
  );
}
