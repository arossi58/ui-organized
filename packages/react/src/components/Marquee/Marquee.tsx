import { Marquee as ArkMarquee } from "@ark-ui/react";
import { clsx } from "clsx";
import { marqueeStyles } from "./Marquee.styles.js";
import type { MarqueeProps } from "./Marquee.types.js";
import "@ui-organized/core/components/Marquee/Marquee.css";

/** Authored default gap. zag resolves it into `--marquee-spacing` at runtime,
 *  so the value it computes with is not a token — but the one we author is. */
const DEFAULT_SPACING = "var(--spacing-space-04)";

/**
 * The machine has no `orientation`; it has `side`, which is the direction of
 * travel and implies the axis. The library uses `orientation` everywhere else,
 * so the public prop keeps that name and the default side for each axis is
 * chosen here. `reverse` flips the direction within the axis.
 */
const SIDE_BY_ORIENTATION = {
  horizontal: "start",
  vertical: "top",
} as const;

export function Marquee({
  items,
  speed,
  delay,
  orientation = "horizontal",
  reverse,
  spacing = DEFAULT_SPACING,
  autoFill = true,
  pauseOnInteraction,
  defaultPaused,
  loopCount,
  showEdges = true,
  className,
}: MarqueeProps) {
  return (
    <ArkMarquee.Root
      className={clsx(marqueeStyles({ orientation }), className)}
      speed={speed}
      delay={delay}
      side={SIDE_BY_ORIENTATION[orientation]}
      reverse={reverse}
      spacing={spacing}
      autoFill={autoFill}
      pauseOnInteraction={pauseOnInteraction}
      defaultPaused={defaultPaused}
      loopCount={loopCount}
    >
      {showEdges && (
        <>
          <ArkMarquee.Edge side="start" className="marquee__edge" />
          <ArkMarquee.Edge side="end" className="marquee__edge" />
        </>
      )}
      <ArkMarquee.Viewport className="marquee__viewport">
        {/* One Content, not one per copy. Ark's Content renders itself
            `api.contentCount` times — the machine decides how many passes are
            needed to fill the track from the measured content and `autoFill` —
            and tags every duplicate `data-clone` so it stays out of the
            accessibility tree. Looping here would duplicate the duplicates. */}
        <ArkMarquee.Content className="marquee__content">
          {items.map((item) => (
            <ArkMarquee.Item key={item.id} className="marquee__item">
              {item.content}
            </ArkMarquee.Item>
          ))}
        </ArkMarquee.Content>
      </ArkMarquee.Viewport>
    </ArkMarquee.Root>
  );
}
