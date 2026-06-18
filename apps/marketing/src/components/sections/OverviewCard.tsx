import { useState, type ComponentType } from "react";

interface OverviewCardProps {
  title: string;
  body: string;
  /** Decorative SVG/DOM art; receives the card's hover/focus/open state. */
  Art: ComponentType<{ active: boolean }>;
  /** Whether this card's detail panel is currently open. */
  open: boolean;
  /** The detail panel this card toggles — its `aria-controls` target. */
  panelId: string;
  /** Toggle this card's panel open/closed. */
  onToggle: () => void;
}

/**
 * One overview card: a tall paper panel whose top half holds a monochrome
 * animation and whose foot holds the title + blurb. The whole card is a
 * disclosure button that toggles a shared detail panel below the row (per the
 * design brief). The art comes alive — colour and motion — while the card is
 * hovered/focused, and stays lit while its panel is open, so the expanded card
 * reads as selected.
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
        <Art active={active} />
      </div>
      <div className="ov-card__foot">
        <h3 className="ov-card__title">{title}</h3>
        <p className="ov-card__body">{body}</p>
      </div>
    </button>
  );
}
