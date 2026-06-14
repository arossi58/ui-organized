import gsap from "gsap";
import { useHoverTimeline } from "../../../hooks/useHoverTimeline";

interface ArtProps {
  active: boolean;
}

/** width % + indent level — shaped to read like indented lines of code. */
const LINES: ReadonlyArray<{ w: number; indent: number }> = [
  { w: 52, indent: 0 },
  { w: 76, indent: 1 },
  { w: 60, indent: 2 },
  { w: 44, indent: 2 },
  { w: 70, indent: 1 },
  { w: 34, indent: 0 },
  { w: 64, indent: 1 },
  { w: 80, indent: 2 },
  { w: 46, indent: 0 },
];

/**
 * Code — rounded bars that write on from the left in a top-to-bottom cascade,
 * hold, then retract, looping like lines of code being typed and cleared. Each
 * bar grows from its left edge (transform-origin) so the stagger reads as a
 * cursor running down the block.
 */
export function CodeArt({ active }: ArtProps) {
  const scope = useHoverTimeline<HTMLDivElement>(active, () => {
    // Rest pose = lines fully drawn (CSS default). The loop clears them top-down,
    // then rewrites them, so a paused card still shows the monochrome block.
    gsap.set(".ov-line", { transformOrigin: "left center" });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.to(".ov-line", {
      scaleX: 0,
      opacity: 0.35,
      duration: 0.4,
      ease: "power2.in",
      stagger: 0.07,
    }).to(
      ".ov-line",
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.11,
      },
      "+=0.6",
    );

    return tl;
  });

  return (
    <div ref={scope} className="ov-art ov-art--code" aria-hidden="true">
      <div className="ov-code">
        {LINES.map((line, i) => (
          <span
            key={i}
            className="ov-line"
            style={{ width: `${line.w}%`, marginLeft: `${line.indent * 16}px` }}
          />
        ))}
      </div>
    </div>
  );
}
