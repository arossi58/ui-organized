import type { RefObject } from "react";
import { ButtonLink } from "../chrome/ButtonLink";
import "./end-caption.css";

interface EndCaptionProps {
  rootRef: RefObject<HTMLDivElement>;
}

/**
 * The closing caption + CTA, revealed as the layout finishes assembling
 * (SITE.md §5). The engine fades it in and flips pointer-events on once it's
 * visible. The "drag any piece to rearrange" hint returns with arrange mode in
 * phase 4.
 */
export function EndCaption({ rootRef }: EndCaptionProps) {
  return (
    <div className="end-caption" ref={rootRef}>
      <h2 className="end-caption__title">Let’s fix it.</h2>
      {/* Anchors to the overview section below; `scroll-behavior: smooth`
          (layout.css) makes the jump glide. A real in-page link, so it works
          without JS and stays crawlable (SITE.md §8). */}
      <ButtonLink href="#overview" intent="primary" size="lg">
        Get Started
      </ButtonLink>
    </div>
  );
}
