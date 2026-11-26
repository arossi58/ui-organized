import type * as React from "react";

/** One term and its details, for the `items` shorthand. */
export interface DescriptionListEntry {
  term: React.ReactNode;
  details: React.ReactNode;
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** The pairs, as data. Rendered before any `children`. */
  items?: DescriptionListEntry[];
  /** `DescriptionListItem`s, for details that need markup. */
  children?: React.ReactNode;
  /** `inline` puts each term beside its details; `stacked` puts them under it. Defaults to 'inline'. */
  layout?: "inline" | "stacked";
  /** Defaults to 'md'. */
  size?: "sm" | "md";
  /** A rule between rows. */
  divided?: boolean;
}

export interface DescriptionListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What the details describe: "Plan", "Renews". */
  term: React.ReactNode;
  /** The details. */
  children?: React.ReactNode;
}
