import { useState, type ComponentType } from "react";
import { Reveal } from "../Reveal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { OverviewCard } from "./OverviewCard";
import { OverviewDetail, DetailBody, DETAILS, type OverviewId } from "./OverviewDetail";
import { DesignScene, ToolsScene, CodeScene } from "./overview/scenes";
import "./overview-section.css";

interface OverviewCardDef {
  id: OverviewId;
  title: string;
  body: string;
  Art: ComponentType<{ selected: boolean }>;
}

const CARDS: OverviewCardDef[] = [
  {
    id: "design",
    title: "Design",
    body: "An ever-growing Figma design library.",
    Art: DesignScene,
  },
  {
    id: "tools",
    title: "Tools",
    body: "Generators and utilities to make design easier.",
    Art: ToolsScene,
  },
  {
    id: "code",
    title: "Code",
    body: "Build with out-of-the-box components.",
    Art: CodeScene,
  },
];

/** The detail panel id every card's `aria-controls` points at. */
const PANEL_ID = "overview-detail";

/**
 * Overview — the three pillars of UI Organized, each a card with a bespoke
 * hover animation (morphing rectangles, merging circles, writing code lines).
 * Clicking a card opens a detail panel beneath the row describing that pillar;
 * Design is open by default and clicking the open card collapses it.
 */
export function OverviewSection() {
  const [openId, setOpenId] = useState<OverviewId | null>("design");
  // Below the grid's collapse point the detail panel moves inline, directly
  // under the tapped card, and animates open/closed like an accordion (rather
  // than one shared panel below the whole row).
  const inlineDetail = useMediaQuery("(max-width: 880px)");

  const toggle = (id: OverviewId) =>
    setOpenId((current) => (current === id ? null : id));

  return (
    <section className="section overview" id="overview">
      <div className="wrap">
        <Reveal>
          <div className="overview__head">
            <h2 className="overview__title">An Open Source Design System</h2>
            <p className="overview__lede">
              UI Organized is an open source community building design tools and
              resources for everyone. It takes shape as a design system, a set of
              plugins, and people who want to make design easier.
            </p>
          </div>
        </Reveal>

        <div className="overview__grid">
          {CARDS.map((card) => {
            const open = openId === card.id;
            const cardPanelId = `${PANEL_ID}-${card.id}`;
            return (
              <Reveal key={card.id} className="overview__cell">
                <OverviewCard
                  title={card.title}
                  body={card.body}
                  Art={card.Art}
                  open={open}
                  panelId={inlineDetail ? cardPanelId : PANEL_ID}
                  onToggle={() => toggle(card.id)}
                />

                {/* Mobile: each card gets its own accordion panel beneath it. */}
                {inlineDetail && (
                  <div
                    id={cardPanelId}
                    role="region"
                    aria-label={`${card.title} details`}
                    className={`ov-accordion${open ? " is-open" : ""}`}
                  >
                    <div className="ov-accordion__inner">
                      <div className="ov-detail ov-detail--inline">
                        <DetailBody content={DETAILS[card.id]} />
                      </div>
                    </div>
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>

        {/* Desktop: one shared panel below the row. */}
        {!inlineDetail && <OverviewDetail id={PANEL_ID} openId={openId} />}
      </div>
    </section>
  );
}
