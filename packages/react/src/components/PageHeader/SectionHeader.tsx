import { clsx } from "clsx";
import { SECTION_HEADER_TEXT_CLASS, sectionHeaderStyles } from "@ui-organized/core";
import type { SectionHeaderProps } from "./PageHeader.types.js";
import "@ui-organized/core/components/PageHeader/PageHeader.css";

/** A section's title row, one level down from PageHeader. */
export function SectionHeader({
  title,
  description,
  actions,
  size = "md",
  align = "start",
  headingLevel = 2,
  divided,
  className,
  ...props
}: SectionHeaderProps) {
  const text = SECTION_HEADER_TEXT_CLASS[size];
  const Title = `h${headingLevel}` as const;
  return (
    <div className={clsx(sectionHeaderStyles({ size, align, divided }), className)} {...props}>
      <div className="section-header__heading">
        <Title className={clsx("section-header__title", text.title)}>{title}</Title>
        {description != null && (
          <p className={clsx("section-header__description", text.description)}>{description}</p>
        )}
      </div>
      {actions != null && <div className="section-header__actions">{actions}</div>}
    </div>
  );
}
