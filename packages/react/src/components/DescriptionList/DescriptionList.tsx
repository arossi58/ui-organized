import { clsx } from "clsx";
import { descriptionListStyles } from "@ui-organized/core";
import type { DescriptionListItemProps, DescriptionListProps } from "./DescriptionList.types.js";
import "@ui-organized/core/components/DescriptionList/DescriptionList.css";

/** One term and its details. */
export function DescriptionListItem({
  term,
  children,
  className,
  ...props
}: DescriptionListItemProps) {
  return (
    <div className={clsx("description-list__item", className)} {...props}>
      <dt className="description-list__term">{term}</dt>
      <dd className="description-list__details">{children}</dd>
    </div>
  );
}

/**
 * Terms and their details, such as a record's fields. Pass `items` for plain
 * data, or `DescriptionListItem` children for details with markup.
 */
export function DescriptionList({
  items,
  children,
  layout = "inline",
  size = "md",
  divided,
  className,
  ...props
}: DescriptionListProps) {
  return (
    <dl className={clsx(descriptionListStyles({ layout, size, divided }), className)} {...props}>
      {items?.map((item, i) => (
        <DescriptionListItem key={i} term={item.term}>
          {item.details}
        </DescriptionListItem>
      ))}
      {children}
    </dl>
  );
}
