import { Badge, Card, CardBody } from "@ui-organized/react";
import { TYPE_META, type RoadmapItem } from "../../lib/roadmap";
import { trackEvent } from "../../lib/analytics";
import "./roadmap-card.css";

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
          <Badge variant={TYPE_META[item.type].badge} emphasized={false} size="sm">
            {TYPE_META[item.type].label}
          </Badge>
          {isDraft && <span className="roadmap-card__draft">draft</span>}
        </span>
      </CardBody>
    </Card>
  );

  if (isDraft) return card;

  return (
    <a
      className="roadmap-card__link"
      href={item.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("roadmap_card_click", { item_type: item.type })}
    >
      {card}
    </a>
  );
}
