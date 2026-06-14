import { FALLBACK_PROJECT_URL } from "../../lib/roadmap";
import { ButtonLink } from "../chrome/ButtonLink";
import "./roadmap-empty.css";

/**
 * Friendly fallback panel (SITE.md §7.4) for the error/empty states — never a
 * blank region. Points visitors at the live GitHub board so the roadmap is
 * always reachable even when the synced JSON is missing or has no cards.
 */
export function RoadmapEmpty({ projectUrl = FALLBACK_PROJECT_URL }: { projectUrl?: string }) {
  return (
    <div className="roadmap-empty">
      <p className="roadmap-empty__title">Roadmap is syncing</p>
      <p className="roadmap-empty__body">
        The board updates straight from GitHub Projects. See it live while the next
        sync lands.
      </p>
      <ButtonLink href={projectUrl} intent="primary" size="md" target="_blank" rel="noreferrer">
        Open the board on GitHub
      </ButtonLink>
    </div>
  );
}
