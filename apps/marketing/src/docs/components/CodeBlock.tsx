/**
 * A code snippet with a copy button — the single place clipboard writes happen
 * for docs content, so every snippet on the site behaves identically (including
 * reporting a failed copy rather than claiming success).
 */
import styles from "./content.module.css";
import { copyLabel, useCopy } from "./useCopy";

/** Standalone copy button, for headers and toolbars that aren't a code block. */
export function CopyButton({
  text,
  label = "Copy",
  title,
}: {
  text: string;
  label?: string;
  title?: string;
}) {
  const { state, copy } = useCopy();
  return (
    <button
      type="button"
      className={styles.copy}
      data-state={state}
      title={title}
      onClick={() => void copy(text)}
    >
      {copyLabel(state, label)}
    </button>
  );
}

interface CodeBlockProps {
  code: string;
  /** Language tag shown at the left of the bar, e.g. `tsx`. */
  language?: string;
  /** Extra note on the bar, e.g. a line count or token estimate. */
  meta?: string;
  /** Drop the bar entirely for a bare, uncopyable snippet. */
  bare?: boolean;
  /** Inside a `PreviewSurface` footer — drop the frame the surface supplies. */
  attached?: boolean;
}

export function CodeBlock({
  code,
  language = "tsx",
  meta,
  bare = false,
  attached = false,
}: CodeBlockProps) {
  return (
    <div className={styles.code} data-attached={attached || undefined}>
      {!bare && (
        <div className={styles.codeBar}>
          <span className={styles.codeLabel}>{language}</span>
          <span className={styles.codeMeta}>{meta}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className={styles.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
