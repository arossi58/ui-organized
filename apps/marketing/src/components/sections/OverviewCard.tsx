import { useState, type ComponentType } from "react";

interface OverviewCardProps {
  title: string;
  body: string;
  /** Decorative SVG/DOM art; receives the card's hover/focus state. */
  Art: ComponentType<{ active: boolean }>;
}

/**
 * One overview card: a tall paper panel whose top half holds a monochrome
 * animation and whose foot holds the title + blurb. The art only comes alive —
 * colour and motion — while the card is hovered or focused within, per the
 * design brief. Focus-within keeps the flourish reachable by keyboard.
 */
export function OverviewCard({ title, body, Art }: OverviewCardProps) {
  const [active, setActive] = useState(false);

  return (
    <article
      className={`ov-card${active ? " is-active" : ""}`}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      tabIndex={0}
    >
      <div className="ov-card__stage">
        <Art active={active} />
      </div>
      <div className="ov-card__foot">
        <h3 className="ov-card__title">{title}</h3>
        <p className="ov-card__body">{body}</p>
      </div>
    </article>
  );
}
