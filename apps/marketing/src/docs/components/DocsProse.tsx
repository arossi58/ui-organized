/**
 * Prose primitives. Every docs page — the Introduction, both Foundations pages,
 * and the component views — gets its heading rhythm, measure and link styling
 * from here, so nothing needs page-specific typography CSS.
 */
import type { ReactNode } from "react";
import styles from "./content.module.css";

/** Wraps long-form copy: measure, list styling, inline `code`, links. */
export function DocsProse({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}

interface DocsSectionProps {
  title: string;
  /** Anchor id — defaults to a slug of the title so headings are linkable. */
  id?: string;
  /** One-line explanation under the heading. */
  subtitle?: ReactNode;
  /** Right-aligned controls on the heading row (badges, toggles, copy). */
  aside?: ReactNode;
  children: ReactNode;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function DocsSection({ title, id, subtitle, aside, children }: DocsSectionProps) {
  return (
    <section className={styles.section} id={id ?? slugify(title)}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {aside}
      </div>
      {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
      {children}
    </section>
  );
}
