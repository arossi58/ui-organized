import { useState } from "react";
import { isRoadmapEmpty, orderColumns, type ColumnId } from "../../lib/roadmap";
import type { RoadmapState } from "../../hooks/useRoadmap";
import { RoadmapColumn } from "./RoadmapColumn";
import { RoadmapSkeleton } from "./RoadmapSkeleton";
import { RoadmapEmpty } from "./RoadmapEmpty";
import "./roadmap-board.css";

/**
 * The kanban board (SITE.md §7.4). Renders from the load state machine:
 * skeleton while fetching, the three columns when ready, a friendly panel on
 * error or empty — never a blank region. The columns sit on a single
 * design-system `surface-secondary` panel, divided by hairline rules — the
 * Branding mockup's board.
 *
 * On desktop all three columns show side by side. On mobile the board turns
 * into a single-column view with a segmented control (Backlog / In progress /
 * Done) that swaps which column is shown — the three columns won't fit legibly
 * across a phone. The active column is CSS-driven off `data-active`, so the
 * segmented control and the desktop grid share one rendered set of columns.
 */
export function RoadmapBoard({ state }: { state: RoadmapState }) {
  const { status, data } = state;
  const [active, setActive] = useState<ColumnId>("in-progress");

  return (
    <div className="roadmap-board">
      {status === "loading" && <RoadmapSkeleton />}

      {status === "error" && <RoadmapEmpty />}

      {status === "ready" &&
        data &&
        (isRoadmapEmpty(data) ? (
          <RoadmapEmpty projectUrl={data.projectUrl} />
        ) : (
          (() => {
            const columns = orderColumns(data);
            return (
              <>
                {/* Mobile-only column switcher (hidden ≥861px by CSS). */}
                <div
                  className="roadmap-board__tabs"
                  role="tablist"
                  aria-label="Roadmap columns"
                >
                  {columns.map((column) => (
                    <button
                      key={column.id}
                      type="button"
                      role="tab"
                      aria-selected={active === column.id}
                      className="roadmap-board__tab"
                      data-active={active === column.id}
                      onClick={() => setActive(column.id)}
                    >
                      {column.title}
                      <span className="roadmap-board__tab-count">
                        {column.items.length}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="roadmap-board__columns" data-active={active}>
                  {columns.map((column) => (
                    <RoadmapColumn
                      key={column.id}
                      column={column}
                      doneOverflowUrl={data.doneOverflowUrl}
                    />
                  ))}
                </div>
              </>
            );
          })()
        ))}
    </div>
  );
}
