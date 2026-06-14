import gsap from "gsap";
import { useHoverTimeline } from "../../../hooks/useHoverTimeline";

interface ArtProps {
  active: boolean;
}

/**
 * Plugins — three concentric translucent discs (the Figma bullseye: stacked
 * fills darken toward the core). On hover they stagger their scale from the
 * centre outward — inner ring swells first, then middle, then outer — so a
 * crest travels through the rings like the ripple from a water droplet. Each
 * ring returns to rest scale within the loop, so it repeats seamlessly and the
 * paused (monochrome) card shows the static bullseye.
 */
export function PluginsArt({ active }: ArtProps) {
  const scope = useHoverTimeline<SVGSVGElement>(active, () => {
    gsap.set(".ov-ring", { transformBox: "fill-box", transformOrigin: "50% 50%" });

    // One 3s loop. Each ring holds at rest, pulses once, holds again — the pulse
    // windows are offset inner→outer so the swell reads as an expanding wave.
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });

    tl.to(
      ".ov-ring--1",
      {
        keyframes: [
          { scale: 1.18, fillOpacity: 0.52, duration: 0.6 },
          { scale: 1, fillOpacity: 0.34, duration: 0.7 },
          { scale: 1, duration: 1.7 },
        ],
      },
      0,
    )
      .to(
        ".ov-ring--2",
        {
          keyframes: [
            { scale: 1, duration: 0.55 },
            { scale: 1.14, fillOpacity: 0.5, duration: 0.6 },
            { scale: 1, fillOpacity: 0.34, duration: 0.7 },
            { scale: 1, duration: 1.15 },
          ],
        },
        0,
      )
      .to(
        ".ov-ring--3",
        {
          keyframes: [
            { scale: 1, duration: 1.1 },
            { scale: 1.1, fillOpacity: 0.46, duration: 0.6 },
            { scale: 1, fillOpacity: 0.34, duration: 0.7 },
            { scale: 1, duration: 0.6 },
          ],
        },
        0,
      );

    return tl;
  });

  return (
    <svg
      ref={scope}
      className="ov-art ov-art--plugins"
      viewBox="0 0 320 320"
      aria-hidden="true"
      focusable="false"
    >
      {/* Largest disc on the bottom, smallest on top — the overlap stacks into a
          darker core (the Figma bullseye). fillOpacity is the rest value the
          ripple animates around. */}
      <g fill="currentColor">
        <circle className="ov-ring ov-ring--3" cx="160" cy="160" r="146" fillOpacity="0.34" />
        <circle className="ov-ring ov-ring--2" cx="160" cy="160" r="106" fillOpacity="0.34" />
        <circle className="ov-ring ov-ring--1" cx="160" cy="160" r="66" fillOpacity="0.34" />
      </g>
    </svg>
  );
}
