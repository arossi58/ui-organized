import type { ReactNode } from "react";
import { Divider } from "@ui-organized/react";
import { STATS, type PartId } from "./parts";
import { useShowcase } from "./showcaseContext";

/**
 * Where a part docks in the live mockup. Renders nothing itself: `PartHost`
 * moves the part's node in, so the component inside keeps its state whether
 * it is here or falling in the hero. The hero measures the part, not this
 * wrapper, so the wrapper only passes width through.
 */
export function PartSlot({ id, fill = false }: { id: PartId; fill?: boolean }) {
  const { host } = useShowcase();
  return (
    <div
      className={`showcase-piece${fill ? " showcase-piece--fill" : ""}`}
      data-piece={id}
      ref={(el) => host.registerSlot(id, el)}
    />
  );
}

/** Wraps a piece of mockup chrome a mirror piece stands in for (parts.tsx),
 * so it can be measured, and hidden while its mirror is in flight. */
export function MirrorSlot({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div className="showcase-mirror" data-piece={id}>
      {children}
    </div>
  );
}

/**
 * The mockup's Dashboard page (Figma 2472:22361 / 2472:22374): four stat cards
 * over a two-column panel of live components. Layout only — every card and
 * control is a part ShowcaseMockup mounts once and docks here.
 * `DASHBOARD_SPEC` in showcaseSpecs.ts is the Code view of this page.
 */
export function DashboardPage() {
  return (
    <div className="showcase-dashboard">
      <section className="showcase-stats" aria-label="Highlights">
        {STATS.map((stat, index) => (
          <PartSlot id={`stat-${index}` as PartId} fill key={stat.label} />
        ))}
      </section>

      <section className="showcase-panel" aria-label="Components">
        <div className="showcase-panel__column">
          <PartSlot id="segments" fill />
          <PartSlot id="radios" />
          <PartSlot id="input" fill />
          <PartSlot id="textarea" fill />
          <PartSlot id="date" fill />
        </div>

        <Divider orientation="vertical" />

        <div className="showcase-panel__column">
          <PartSlot id="toolbar" fill />
          <PartSlot id="checks" />
          <PartSlot id="meter" fill />
          <PartSlot id="switch" />
          <PartSlot id="color" fill />
          <PartSlot id="select" fill />
          <div className="showcase-row showcase-row--fill">
            <PartSlot id="btn-primary" fill />
            <PartSlot id="btn-dialog" fill />
            <PartSlot id="btn-sheet" fill />
          </div>
        </div>
      </section>
    </div>
  );
}
