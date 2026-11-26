import { clsx } from "clsx";
import { PAGE_HEADER_TEXT_CLASS, pageHeaderStyles } from "@ui-organized/core";
import type { PageHeaderProps } from "./PageHeader.types.js";
import "@ui-organized/core/components/PageHeader/PageHeader.css";

/**
 * The top of a page: a breadcrumb trail, the title and description, the
 * page's actions, and an optional row of tabs.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  tabs,
  size = "md",
  headingLevel = 1,
  divided,
  className,
  ...props
}: PageHeaderProps) {
  const text = PAGE_HEADER_TEXT_CLASS[size];
  const Title = `h${headingLevel}` as const;
  return (
    <div
      className={clsx(pageHeaderStyles({ size, divided, tabs: tabs != null }), className)}
      {...props}
    >
      {breadcrumbs != null && <div className="page-header__breadcrumbs">{breadcrumbs}</div>}
      <div className="page-header__row">
        <div className="page-header__heading">
          <Title className={clsx("page-header__title", text.title)}>{title}</Title>
          {description != null && (
            <p className={clsx("page-header__description", text.description)}>{description}</p>
          )}
        </div>
        {actions != null && <div className="page-header__actions">{actions}</div>}
      </div>
      {tabs != null && <div className="page-header__tabs">{tabs}</div>}
    </div>
  );
}
