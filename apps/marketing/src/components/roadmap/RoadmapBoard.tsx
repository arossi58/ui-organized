import { isRoadmapEmpty, orderColumns } from "../../lib/roadmap";
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
 */
export function RoadmapBoard({ state }: { state: RoadmapState }) {
  const { status, data } = state;

  return (
    <div className="roadmap-board">
      {status === "loading" && <RoadmapSkeleton />}

      {status === "error" && <RoadmapEmpty />}

      {status === "ready" &&
        data &&
        (isRoadmapEmpty(data) ? (
          <RoadmapEmpty projectUrl={data.projectUrl} />
        ) : (
          <div className="roadmap-board__columns">
            {orderColumns(data).map((column) => (
              <RoadmapColumn
                key={column.id}
                column={column}
                doneOverflowUrl={data.doneOverflowUrl}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
