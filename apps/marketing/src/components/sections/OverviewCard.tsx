import { useState, type ComponentType } from "react";
import { Link } from "react-router-dom";

interface OverviewCardProps {
  title: string;
  body: string;
  /** Decorative SVG/DOM art; receives the card's hover/focus state. */
  Art: ComponentType<{ active: boolean }>;
  /** Optional in-site route — turns the whole card into a link to it. */
  href?: string;
}

/**
 * One overview card: a tall paper panel whose top half holds a monochrome
 * animation and whose foot holds the title + blurb. The art only comes alive —
 * colour and motion — while the card is hovered or focused within, per the
 * design brief. When `href` is set the whole card becomes an in-site link (an
 * `<a>`, already keyboard-focusable); otherwise it's a focusable `<article>`.
 */
export function OverviewCard({ title, body, Art, href }: OverviewCardProps) {
  const [active, setActive] = useState(false);

  const interaction = {
    className: `ov-card${href ? " ov-card--link" : ""}${active ? " is-active" : ""}`,
    onPointerEnter: () => setActive(true),
    onPointerLeave: () => setActive(false),
    onFocus: () => setActive(true),
    onBlur: () => setActive(false),
  };

  const content = (
    <>
      <div className="ov-card__stage">
        <Art active={active} />
      </div>
      <div className="ov-card__foot">
        <h3 className="ov-card__title">{title}</h3>
        <p className="ov-card__body">{body}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link to={href} {...interaction}>
        {content}
      </Link>
    );
  }

  return (
    <article {...interaction} tabIndex={0}>
      {content}
    </article>
  );
}
