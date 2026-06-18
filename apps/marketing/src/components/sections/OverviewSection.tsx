import { useState, type ComponentType } from "react";
import { Reveal } from "../Reveal";
import { OverviewCard } from "./OverviewCard";
import { OverviewDetail, type OverviewId } from "./OverviewDetail";
import { DesignArt } from "./overview/DesignArt";
import { PluginsArt } from "./overview/PluginsArt";
import { CodeArt } from "./overview/CodeArt";
import "./overview-section.css";

interface OverviewCardDef {
  id: OverviewId;
  title: string;
  body: string;
  Art: ComponentType<{ active: boolean }>;
}

const CARDS: OverviewCardDef[] = [
  {
    id: "design",
    title: "Design",
    body: "An ever-growing Figma design library.",
    Art: DesignArt,
  },
  {
    id: "tools",
    title: "Tools",
    body: "Generators and utilities to make design easier.",
    Art: PluginsArt,
  },
  {
    id: "code",
    title: "Code",
    body: "Build with out-of-the-box components.",
    Art: CodeArt,
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

  return (
    <section className="section overview" id="overview">
      <div className="wrap">
        <Reveal>
          <div className="overview__head">
            <h2 className="overview__title">An Open Source Design System</h2>
            <p className="overview__lede">
              UI Organized is an open source community focused on providing
              design tools and resources for others. This takes shape as a
              design system, plugins, and a community looking to help others.
            </p>
          </div>
        </Reveal>

        <div className="overview__grid">
          {CARDS.map((card) => (
            <Reveal key={card.id} className="overview__cell">
              <OverviewCard
                title={card.title}
                body={card.body}
                Art={card.Art}
                open={openId === card.id}
                panelId={PANEL_ID}
                onToggle={() =>
                  setOpenId((current) => (current === card.id ? null : card.id))
                }
              />
            </Reveal>
          ))}
        </div>

        <OverviewDetail id={PANEL_ID} openId={openId} />
      </div>
    </section>
  );
}
