import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import type { BreadcrumbProps } from "./Breadcrumb.types.js";
import "./Breadcrumb.css";

/** A trail of links showing the current page's location in a hierarchy. */
export function Breadcrumb({ items, separator, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={clsx("breadcrumb", "text-default-body-medium", className)} {...props}>
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumb__item">
              {item.href && !isLast ? (
                <a href={item.href} className="breadcrumb__link">
                  {item.icon && <Icon name={item.icon} size={16} className="breadcrumb__icon" />}
                  {item.label}
                </a>
              ) : (
                <span
                  className="breadcrumb__current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && <Icon name={item.icon} size={16} className="breadcrumb__icon" />}
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumb__separator" aria-hidden="true">
                  {separator ?? <Icon name="chevron-right" size={16} />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
