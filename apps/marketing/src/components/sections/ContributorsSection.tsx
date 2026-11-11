import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Avatar, Icon, Tooltip } from "@ui-organized/react";
import { Reveal } from "../Reveal";
import { CONTRIBUTE_EVENT, CONTRIBUTORS, avatarSrc, type Contributor } from "../../lib/contributors";
import "./contributors-section.css";

/** Rows of slots before the bottom vignette has swallowed them. */
const MIN_ROWS = 4;
/** Columns rendered before the first measurement lands. */
const DEFAULT_COLS = 13;

/**
 * Fill order for the grid: the slots nearest the top-center first, since the
 * vignette fades the sides and bottom. Rows weigh more than columns so the
 * first row fills well out before the second starts.
 */
function slotOrder(cols: number, rows: number): number[] {
  const center = (cols - 1) / 2;
  const slots: { index: number; score: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({ index: r * cols + c, score: Math.hypot(c - center, r * 1.6) });
    }
  }
  return slots.sort((a, b) => a.score - b.score).map((slot) => slot.index);
}

/** Switch the contact form to "I want to contribute"; the anchor does the scroll. */
const announceContribute = () => window.dispatchEvent(new Event(CONTRIBUTE_EVENT));

/**
 * "The people making it happen" — every contributor as an avatar in a grid
 * that runs the full width of the section and fades out at the sides and
 * bottom. Real contributors sit top-center and link to their site; every other
 * slot is an open invitation that jumps to the contact form.
 */
export function ContributorsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(DEFAULT_COLS);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // The cell size is the css's --contributor-cell, which shrinks on phones.
    const observer = new ResizeObserver(([entry]) => {
      const cell = parseFloat(getComputedStyle(grid).getPropertyValue("--contributor-cell")) || 88;
      const fit = Math.max(3, Math.floor(entry.contentRect.width / cell));
      // Odd, so there is a true center column for the first contributor.
      setCols(fit % 2 ? fit : fit - 1);
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  const slots = useMemo(() => {
    // Keep two spare rows under the last contributor so nobody lands in the fade.
    const rows = Math.max(MIN_ROWS, Math.ceil(CONTRIBUTORS.length / cols) + 2);
    const placed: (Contributor | null)[] = new Array(cols * rows).fill(null);
    slotOrder(cols, rows).forEach((index, i) => {
      if (i < CONTRIBUTORS.length) placed[index] = CONTRIBUTORS[i];
    });
    return placed;
  }, [cols]);

  return (
    <section className="section contributors-section" id="contributors">
      <div className="wrap">
        <Reveal>
          <h2 className="section-title contributors-section__title">The people making it happen</h2>
          <p className="contributors-section__lede">
            Everyone who has designed, built, or written part of ui-organized.
            Want to see yourself here?{" "}
            <a className="contributors-section__link" href="#contact" onClick={announceContribute}>
              Get in touch below.
            </a>
          </p>
        </Reveal>
      </div>

      <div
        ref={gridRef}
        className="contributors-grid"
        style={{ "--contributor-cols": cols } as React.CSSProperties}
      >
        {slots.map((contributor, index) =>
          contributor ? (
            <Tooltip key={contributor.id} content={contributor.name}>
              <a
                className="contributor-slot"
                href={contributor.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${contributor.name} (opens in a new tab)`}
              >
                <Avatar size="xl" name={contributor.name} src={avatarSrc(contributor.avatar)} alt="" />
              </a>
            </Tooltip>
          ) : (
            // Decorative: dozens of identical invitations would swamp the tab
            // order and screen readers, so the lede's link stands in for them.
            <Tooltip key={`empty-${index}`} content="This could be you!">
              <a
                className="contributor-slot contributor-slot--empty"
                href="#contact"
                tabIndex={-1}
                aria-hidden="true"
                onClick={announceContribute}
              >
                <span className="contributor-slot__placeholder">
                  <Icon name="plus" size={20} />
                </span>
              </a>
            </Tooltip>
          ),
        )}
      </div>
    </section>
  );
}
