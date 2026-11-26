import { cva, type VariantProps } from "class-variance-authority";

/**
 * The top of a page: an optional breadcrumb trail, the title and a line of
 * description, the page's actions, and an optional row of tabs. `md` suits an
 * app page; `lg` a docs or landing page.
 *
 * The root is a plain block, not `<header>`: a `<header>` outside `<main>` is a
 * banner landmark, and the app's own header is already the one banner.
 */
export const pageHeaderStyles = cva("page-header", {
  variants: {
    size: {
      md: "page-header--md",
      lg: "page-header--lg",
    },
    divided: {
      true: "page-header--divided",
    },
    tabs: {
      true: "page-header--tabs",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type PageHeaderVariants = VariantProps<typeof pageHeaderStyles>;
export type PageHeaderSize = "md" | "lg";

/**
 * A section's title row, one level down from PageHeader: the title, a line of
 * description and the section's actions. `align: "center"` is for marketing
 * sections, which reuse it.
 */
export const sectionHeaderStyles = cva("section-header", {
  variants: {
    size: {
      sm: "section-header--sm",
      md: "section-header--md",
    },
    align: {
      start: "",
      center: "section-header--center",
    },
    divided: {
      true: "section-header--divided",
    },
  },
  defaultVariants: {
    size: "md",
    align: "start",
  },
});

export type SectionHeaderVariants = VariantProps<typeof sectionHeaderStyles>;
export type SectionHeaderSize = "sm" | "md";

/** The row that closes a section: a status line ("Showing 1 to 10") and its actions. */
export const sectionFooterStyles = cva("section-footer", {
  variants: {
    divided: {
      true: "section-footer--divided",
    },
  },
});

export type SectionFooterVariants = VariantProps<typeof sectionFooterStyles>;

/** The type class each part takes, per size. */
export const PAGE_HEADER_TEXT_CLASS: Record<
  PageHeaderSize,
  { title: string; description: string }
> = {
  md: { title: "text-strong-heading-medium", description: "text-default-body-medium" },
  lg: { title: "text-strong-heading-large", description: "text-default-body-large" },
};

export const SECTION_HEADER_TEXT_CLASS: Record<
  SectionHeaderSize,
  { title: string; description: string }
> = {
  sm: { title: "text-strong-body-large", description: "text-default-body-medium" },
  md: { title: "text-strong-heading-small", description: "text-default-body-medium" },
};

/** The type class of a SectionFooter's status line. */
export const SECTION_FOOTER_TEXT_CLASS = "text-default-body-medium";
