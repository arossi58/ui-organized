import { Badge, Card, CardBody, type BadgeProps } from "@ds/react";
import { TYPE_META, type RoadmapItem, type RoadmapType } from "../../lib/roadmap";
import "./roadmap-card.css";

/**
 * Per-type category colour, expressed through the design-system `Badge`'s own
 * status variants (subdued) rather than a bespoke chip — so the board's tags
 * speak the library's language. Maps the four roadmap types onto distinct
 * variants for at-a-glance scanning.
 */
const TYPE_BADGE: Record<RoadmapType, NonNullable<BadgeProps["variant"]>> = {
  design: "info-secondary",
  development: "info",
  docs: "caution",
  community: "success",
};

interface RoadmapCardProps {
  item: RoadmapItem;
}

/**
 * One roadmap card (SITE.md §7.4): the library `Card` on the design system's
 * `surface-primary` with a `border-secondary` hairline (the mockup's
 * status-card), a heading-small task name, and the category as a DS `Badge`.
 * Cards with a `url` are whole-card links to the issue with a visible focus
 * ring; draft items render the badge + a subtle `draft` label and no link.
 */
export function RoadmapCard({ item }: RoadmapCardProps) {
  const isDraft = item.url === null;

  const card = (
    <Card variant="outlined" padding="md" className="roadmap-card">
      <CardBody className="roadmap-card__body">
        <p className="roadmap-card__title">{item.title}</p>
        <span className="roadmap-card__meta">
          <Badge variant={TYPE_BADGE[item.type]} emphasized={false} size="sm">
            {TYPE_META[item.type].label}
          </Badge>
          {isDraft && <span className="roadmap-card__draft">draft</span>}
        </span>
      </CardBody>
    </Card>
  );

  if (isDraft) return card;

  return (
    <a className="roadmap-card__link" href={item.url ?? undefined} target="_blank" rel="noreferrer">
      {card}
    </a>
  );
}
