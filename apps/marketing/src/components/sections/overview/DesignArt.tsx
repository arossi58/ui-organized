import gsap from "gsap";
import { useHoverTimeline } from "../../../hooks/useHoverTimeline";

interface ArtProps {
  active: boolean;
}

/**
 * Design — three large rounded rectangles fused by an SVG "gooey" filter into
 * one solid, organic mass (the Figma "Union"). On hover the rects rotate, scale
 * and drift through a seamless keyframe loop so the merged silhouette
 * continuously morphs. Reads as a single shifting block of overlapping
 * rectangles — distinct from the Plugins card's airy overlapping rings. Colour
 * (monochrome → brand orange) is owned by CSS.
 */
export function DesignArt({ active }: ArtProps) {
  const scope = useHoverTimeline<SVGSVGElement>(active, () => {
    gsap.set(".ov-rect", { transformBox: "fill-box", transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });

    // Each rect returns to its start pose at the end → seamless repeat.
    tl.to(
      ".ov-rect--a",
      {
        keyframes: [
          { rotation: 26, scale: 1.14, x: 18, y: 10, duration: 2.2 },
          { rotation: -12, scale: 0.92, x: -12, y: 18, duration: 2.2 },
          { rotation: 0, scale: 1, x: 0, y: 0, duration: 2.2 },
        ],
      },
      0,
    )
      .to(
        ".ov-rect--b",
        {
          keyframes: [
            { rotation: -18, scale: 0.88, x: -16, y: 14, duration: 2.2 },
            { rotation: 20, scale: 1.16, x: 14, y: -12, duration: 2.2 },
            { rotation: 0, scale: 1, x: 0, y: 0, duration: 2.2 },
          ],
        },
        0,
      )
      .to(
        ".ov-rect--c",
        {
          keyframes: [
            { rotation: 32, scale: 1.1, x: 12, y: -16, duration: 2.2 },
            { rotation: -8, scale: 0.94, x: -18, y: -6, duration: 2.2 },
            { rotation: 0, scale: 1, x: 0, y: 0, duration: 2.2 },
          ],
        },
        0,
      );

    return tl;
  });

  return (
    <svg
      ref={scope}
      className="ov-art ov-art--design"
      viewBox="0 0 320 320"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Gooey/metaball merge: blur the alpha, then crush it back to a hard
            edge so overlapping shapes weld into one organic silhouette. */}
        <filter id="ov-goo-design" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
          />
        </filter>
      </defs>
      <g filter="url(#ov-goo-design)" fill="currentColor">
        <rect className="ov-rect ov-rect--a" x="40" y="34" width="156" height="156" rx="44" />
        <rect className="ov-rect ov-rect--b" x="130" y="116" width="166" height="140" rx="48" />
        <rect className="ov-rect ov-rect--c" x="48" y="150" width="150" height="150" rx="42" />
      </g>
    </svg>
  );
}
