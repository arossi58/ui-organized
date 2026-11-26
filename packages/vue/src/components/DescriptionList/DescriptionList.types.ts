/** One term and its details, for the `items` shorthand. */
export interface DescriptionListEntry {
  term: string;
  details: string;
}

/** The default slot takes DescriptionListItems, rendered after `items`. */
export interface DescriptionListProps {
  /** The pairs, as data. */
  items?: DescriptionListEntry[];
  /** `inline` puts each term beside its details; `stacked` puts them under it. Defaults to 'inline'. */
  layout?: "inline" | "stacked";
  /** Defaults to 'md'. */
  size?: "sm" | "md";
  /** A rule between rows. */
  divided?: boolean;
}

/** The default slot is the details. */
export interface DescriptionListItemProps {
  /** What the details describe: "Plan", "Renews". */
  term: string;
}
