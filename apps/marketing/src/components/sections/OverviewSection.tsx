import type { ComponentType } from "react";
import { Reveal } from "../Reveal";
import { OverviewCard } from "./OverviewCard";
import { DesignArt } from "./overview/DesignArt";
import { PluginsArt } from "./overview/PluginsArt";
import { CodeArt } from "./overview/CodeArt";
import "./overview-section.css";

interface OverviewCardDef {
  title: string;
  body: string;
  Art: ComponentType<{ active: boolean }>;
  /** Optional in-site route the card links to. */
  href?: string;
}

const CARDS: OverviewCardDef[] = [
  {
    title: "Design",
    body: "An ever-growing Figma design library.",
    Art: DesignArt,
  },
  {
    title: "Plugins",
    body: "Tools to make design easier.",
    Art: PluginsArt,
  },
  {
    // The component library — its docs are the embedded Storybook at /docs.
    title: "Code",
    body: "Build with out-of-the-box components.",
    Art: CodeArt,
    href: "/docs",
  },
];

/**
 * Overview — the three pillars of UI Organized, each a card with a bespoke
 * hover animation (morphing rectangles, merging circles, writing code lines).
 */
export function OverviewSection() {
  return (
    <section className="section overview" id="overview">
      <div className="wrap">
        <Reveal>
          <div className="overview__head">
            <h2 className="overview__title">What is it?</h2>
            <p className="overview__lede">
              UI Organized is an open source community focused on providing
              design tools and resources for others. This takes shape as a
              design system, plugins, and a community looking to help others.
            </p>
          </div>
        </Reveal>

        <div className="overview__grid">
          {CARDS.map((card) => (
            <Reveal key={card.title} className="overview__cell">
              <OverviewCard
                title={card.title}
                body={card.body}
                Art={card.Art}
                href={card.href}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
