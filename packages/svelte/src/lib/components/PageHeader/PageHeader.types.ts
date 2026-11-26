import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> {
  /** The page's name. */
  title: string;
  /** One sentence on what the page is for. */
  description?: string;
  /** A Breadcrumb trail above the title. */
  breadcrumbs?: Snippet;
  /** The page's actions, beside the title; they wrap below it when the page is narrow. */
  actions?: Snippet;
  /** A row of Tabs under the title, whose panels hold the page body. */
  tabs?: Snippet;
  /** `md` for an app page, `lg` for a docs or landing page. Defaults to 'md'. */
  size?: "md" | "lg";
  /** The title's heading level. Defaults to 1. */
  headingLevel?: HeadingLevel;
  /** A rule under the header. Ignored with `tabs`. */
  divided?: boolean;
  class?: string;
}

export interface SectionHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "class" | "title"
> {
  /** The section's name. */
  title: string;
  /** One sentence on what the section holds. */
  description?: string;
  /** The section's actions, beside the title. */
  actions?: Snippet;
  /** `sm` for a card or panel, `md` for a page section. Defaults to 'md'. */
  size?: "sm" | "md";
  /** `center` stacks and centres everything. Defaults to 'start'. */
  align?: "start" | "center";
  /** The title's heading level. Defaults to 2. */
  headingLevel?: HeadingLevel;
  /** A rule under the header. */
  divided?: boolean;
  class?: string;
}

export interface SectionFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** The status line at the start, such as "Showing 1 to 10 of 48". */
  children?: Snippet;
  /** The section's closing actions, at the end. */
  actions?: Snippet;
  /** A rule above the footer. */
  divided?: boolean;
  class?: string;
}
