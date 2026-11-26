import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

/** One term and its details, for the `items` shorthand. */
export interface DescriptionListEntry {
  term: string;
  details: string;
}

export interface DescriptionListProps extends Omit<HTMLAttributes<HTMLDListElement>, "class"> {
  /** The pairs, as data. Rendered before any children. */
  items?: DescriptionListEntry[];
  /** `DescriptionListItem`s, for details that need markup. */
  children?: Snippet;
  /** `inline` puts each term beside its details; `stacked` puts them under it. Defaults to 'inline'. */
  layout?: "inline" | "stacked";
  /** Defaults to 'md'. */
  size?: "sm" | "md";
  /** A rule between rows. */
  divided?: boolean;
  class?: string;
}

export interface DescriptionListItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** What the details describe: "Plan", "Renews". */
  term: string;
  /** The details. */
  children?: Snippet;
  class?: string;
}
