import { COLUMN_ORDER } from "../../lib/roadmap";
import "./roadmap-skeleton.css";

/** How many placeholder cards each column shows while loading. */
const SKELETON_COUNTS = [4, 3, 5];

/**
 * Loading placeholder (SITE.md §7.4): the board's three columns with shimmer
 * cards, so the region never flashes blank. Token-coloured, reduced-motion safe
 * (the shimmer animation is motion-gated; the layout is identical either way).
 */
export function RoadmapSkeleton() {
  return (
    <div className="roadmap-board__columns" aria-hidden="true">
      {COLUMN_ORDER.map((col, c) => (
        <div className="roadmap-column" key={col.id}>
          <div className="roadmap-column__header">
            <span className="eyebrow roadmap-column__title">{col.title}</span>
          </div>
          <div className="roadmap-column__list">
            {Array.from({ length: SKELETON_COUNTS[c] ?? 3 }).map((_, i) => (
              <div className="roadmap-skeleton-card skeleton" key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
