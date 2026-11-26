import { clsx } from "clsx";
import { EMPTY_STATE_ICON_SIZE, EMPTY_STATE_TEXT_CLASS, emptyStateStyles } from "@ui-organized/core";
import { FeaturedIcon } from "../FeaturedIcon/index.js";
import type { EmptyStateProps } from "./EmptyState.types.js";
import "@ui-organized/core/components/EmptyState/EmptyState.css";

/**
 * What to show when there is nothing to show: an icon or illustration, a title,
 * a line of description and the actions that get the reader out of it.
 */
export function EmptyState({
  title,
  description,
  icon,
  media,
  actions,
  size = "md",
  headingLevel,
  className,
  ...props
}: EmptyStateProps) {
  const text = EMPTY_STATE_TEXT_CLASS[size];
  const Title = headingLevel ? (`h${headingLevel}` as const) : "p";
  const mediaContent =
    media ?? (icon ? <FeaturedIcon icon={icon} variant="neutral" size={EMPTY_STATE_ICON_SIZE[size]} /> : null);

  return (
    <div className={clsx(emptyStateStyles({ size }), className)} {...props}>
      {mediaContent != null && <div className="empty-state__media">{mediaContent}</div>}
      <div className="empty-state__body">
        <Title className={clsx("empty-state__title", text.title)}>{title}</Title>
        {description != null && (
          <p className={clsx("empty-state__description", text.description)}>{description}</p>
        )}
      </div>
      {actions != null && <div className="empty-state__actions">{actions}</div>}
    </div>
  );
}
