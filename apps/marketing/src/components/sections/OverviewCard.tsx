import { useState, type ComponentType } from "react";

interface OverviewCardProps {
  title: string;
  body: string;
  /** Decorative SVG art; receives the card's selected (panel-open) state. */
  Art: ComponentType<{ selected: boolean }>;
  /** Whether this card's detail panel is currently open. */
  open: boolean;
  /** The detail panel this card toggles — its `aria-controls` target. */
  panelId: string;
  /** Toggle this card's panel open/closed. */
  onToggle: () => void;
}

/**
 * One overview card: a tall paper panel whose top half holds an SVG UI
 * animation and whose foot holds the title + blurb. The whole card is a
 * disclosure button that toggles a shared detail panel below the row (per the
 * design brief). Selecting the card (opening its panel) plays its art once; the
 * card still lifts on hover/focus so it reads as interactive.
 */
export function OverviewCard({ title, body, Art, open, panelId, onToggle }: OverviewCardProps) {
  const [hover, setHover] = useState(false);
  const active = hover || open;

  return (
    <button
      type="button"
      className={`ov-card ov-card--toggle${active ? " is-active" : ""}${open ? " is-open" : ""}`}
      aria-expanded={open}
      aria-controls={panelId}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={onToggle}
    >
      <div className="ov-card__stage">
        <Art selected={open} />
      </div>
      <div className="ov-card__foot">
        <h3 className="ov-card__title">{title}</h3>
        <p className="ov-card__body">{body}</p>
      </div>
    </button>
  );
}
