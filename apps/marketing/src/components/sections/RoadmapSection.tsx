import { Reveal } from "../Reveal";
import { RoadmapBoard } from "../roadmap/RoadmapBoard";
import { SyncStatus } from "../roadmap/SyncStatus";
import { useRoadmap } from "../../hooks/useRoadmap";
import { isRoadmapEmpty } from "../../lib/roadmap";
import "./roadmap-section.css";

/**
 * Roadmap as a homepage section (SITE.md §7) — the public, read-only kanban
 * that mirrors the GitHub Projects board, styled with the design system's own
 * surfaces, status badges, and tokens (the Branding "What we're working on"
 * mockup). The header pairs the editorial title + invite copy with a live
 * "last updated" status badge; the board renders from the load state machine.
 */
export function RoadmapSection() {
  const roadmap = useRoadmap();
  const hasData = roadmap.status === "ready" && roadmap.data && !isRoadmapEmpty(roadmap.data);

  return (
    <section className="section roadmap-section" id="roadmap">
      <div className="wrap">
        <Reveal>
          <div className="roadmap-section__head">
            <div className="roadmap-section__intro">
              <h2 className="section-title roadmap-section__title">What we’re working on</h2>
              <p className="roadmap-section__lede">
                A live look at what&rsquo;s in progress. See something you&rsquo;d
                like to help with?{" "}
                <a className="roadmap-section__link" href={LINKS_CONTRIBUTE}>
                  Learn how to contribute.
                </a>
                <br />
                Have an idea to share?{" "}
                <a className="roadmap-section__link" href="#contact">
                  Submit it below.
                </a>
              </p>
            </div>
            {hasData && roadmap.data && (
              <SyncStatus data={roadmap.data} fromFixture={roadmap.fromFixture} />
            )}
          </div>
        </Reveal>

        <div className="roadmap-section__board">
          <RoadmapBoard state={roadmap} />
        </div>
      </div>
    </section>
  );
}

/** Where "Learn how you can contribute" points — the public project board. */
const LINKS_CONTRIBUTE = "https://github.com/users/arossi58/projects/2";
