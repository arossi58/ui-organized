import type { RefObject } from "react";
import "./hero-title.css";

interface HeroTitleProps {
  rootRef: RefObject<HTMLDivElement>;
}

/**
 * The pinned hero heading (SITE.md §5). Real document content — readable
 * without the physics. The engine scales/tucks the root as P advances
 * (transform only).
 */
export function HeroTitle({ rootRef }: HeroTitleProps) {
  return (
    <div className="hero-title" ref={rootRef}>
      <h1 className="hero-title__h1">Is your UI a mess?</h1>
    </div>
  );
}
