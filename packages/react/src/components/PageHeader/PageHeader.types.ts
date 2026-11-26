import type * as React from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** The page's name. */
  title: React.ReactNode;
  /** One sentence on what the page is for. */
  description?: React.ReactNode;
  /** A Breadcrumb trail above the title. */
  breadcrumbs?: React.ReactNode;
  /** The page's actions, beside the title; they wrap below it when the page is narrow. */
  actions?: React.ReactNode;
  /**
   * A row of Tabs under the title. The Tabs' panels hold the page body, so the
   * tab list and its content stay one widget.
   */
  tabs?: React.ReactNode;
  /** `md` for an app page, `lg` for a docs or landing page. Defaults to 'md'. */
  size?: "md" | "lg";
  /**
   * The title's heading level. Defaults to 1: a page has one. Pass a lower
   * level for the header of a page within a page, such as a settings pane.
   */
  headingLevel?: HeadingLevel;
  /** A rule under the header. Ignored with `tabs`, whose list draws its own. */
  divided?: boolean;
}

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** The section's name. */
  title: React.ReactNode;
  /** One sentence on what the section holds. */
  description?: React.ReactNode;
  /** The section's actions, beside the title. */
  actions?: React.ReactNode;
  /** `sm` for a card or panel, `md` for a page section. Defaults to 'md'. */
  size?: "sm" | "md";
  /** `center` stacks and centres everything, for a marketing section. Defaults to 'start'. */
  align?: "start" | "center";
  /** The title's heading level. Defaults to 2; step it down for a section within a section. */
  headingLevel?: HeadingLevel;
  /** A rule under the header. */
  divided?: boolean;
}

export interface SectionFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The status line at the start, such as "Showing 1 to 10 of 48". */
  children?: React.ReactNode;
  /** The section's closing actions, at the end. */
  actions?: React.ReactNode;
  /** A rule above the footer. */
  divided?: boolean;
}
