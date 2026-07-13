import { type RoadmapColumn as Column, DONE_VISIBLE_LIMIT } from "../../lib/roadmap";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";
import { ButtonLink } from "../chrome/ButtonLink";
import { RoadmapCard } from "./RoadmapCard";
import "./roadmap-column.css";

interface RoadmapColumnProps {
  column: Column;
  doneOverflowUrl: string;
}

/**
 * One board column (SITE.md §7.4): a centered serif title (the mockup's column
 * heads), then the cards — which stagger in (~40ms apart) once the column
 * scrolls into view (the column's own reveal). The Done column appends the
 * "see everything shipped" overflow link when it's at the visible cap.
 */
export function RoadmapColumn({ column, doneOverflowUrl }: RoadmapColumnProps) {
  const ref = useRevealOnScroll<HTMLElement>();
  const isDone = column.id === "done";
  const showOverflow = isDone && column.items.length >= DONE_VISIBLE_LIMIT;

  return (
    <section
      className="roadmap-column"
      aria-label={column.title}
      data-column={column.id}
      ref={ref}
    >
      <h3 className="roadmap-column__title">{column.title}</h3>

      <ol className="roadmap-column__list">
        {column.items.map((item) => (
          <li className="roadmap-column__item" key={item.id}>
            <RoadmapCard item={item} />
          </li>
        ))}
      </ol>

      {showOverflow && (
        <ButtonLink
          className="roadmap-column__overflow"
          href={doneOverflowUrl}
          intent="tertiary"
          size="sm"
          target="_blank"
          rel="noreferrer"
        >
          See everything shipped →
        </ButtonLink>
      )}
    </section>
  );
}
