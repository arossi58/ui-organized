import { clsx } from "clsx";
import { SECTION_FOOTER_TEXT_CLASS, sectionFooterStyles } from "@ui-organized/core";
import type { SectionFooterProps } from "./PageHeader.types.js";
import "@ui-organized/core/components/PageHeader/PageHeader.css";

/** The row that closes a section: a status line at the start, its actions at the end. */
export function SectionFooter({
  children,
  actions,
  divided,
  className,
  ...props
}: SectionFooterProps) {
  return (
    <div className={clsx(sectionFooterStyles({ divided }), className)} {...props}>
      {children != null && (
        <div className={clsx("section-footer__content", SECTION_FOOTER_TEXT_CLASS)}>{children}</div>
      )}
      {actions != null && <div className="section-footer__actions">{actions}</div>}
    </div>
  );
}
