type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Slots: `breadcrumbs`, `actions` and `tabs` (whose Tabs' panels hold the page body). */
export interface PageHeaderProps {
  /** The page's name. */
  title: string;
  /** One sentence on what the page is for. */
  description?: string;
  /** `md` for an app page, `lg` for a docs or landing page. Defaults to 'md'. */
  size?: "md" | "lg";
  /** The title's heading level. Defaults to 1. */
  headingLevel?: HeadingLevel;
  /** A rule under the header. Ignored with the `tabs` slot. */
  divided?: boolean;
}

/** Slots: `actions`. */
export interface SectionHeaderProps {
  /** The section's name. */
  title: string;
  /** One sentence on what the section holds. */
  description?: string;
  /** `sm` for a card or panel, `md` for a page section. Defaults to 'md'. */
  size?: "sm" | "md";
  /** `center` stacks and centres everything. Defaults to 'start'. */
  align?: "start" | "center";
  /** The title's heading level. Defaults to 2. */
  headingLevel?: HeadingLevel;
  /** A rule under the header. */
  divided?: boolean;
}

/** Slots: the default slot is the status line; `actions` the closing actions. */
export interface SectionFooterProps {
  /** A rule above the footer. */
  divided?: boolean;
}
