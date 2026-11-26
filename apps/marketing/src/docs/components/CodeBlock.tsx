/**
 * Every code snippet on the docs site: the library's CodeBlock, highlighted by
 * the site's Shiki. One place, so every snippet looks and copies alike,
 * including reporting a failed copy rather than claiming success.
 */
import { CodeBlock as LibraryCodeBlock } from "@ui-organized/react";
import styles from "./content.module.css";
import { useHighlighter } from "./useHighlighter";

interface CodeBlockProps {
  code: string;
  /** What the snippet is for, e.g. "Install the data table", shown at the start of the header. */
  title?: string;
  /** The language: highlights the code and is shown in the header, e.g. `tsx`. */
  language?: string;
  /** No header and no copy button: the code alone, still highlighted. */
  bare?: boolean;
  /** Inside a `PreviewSurface` footer — drop the frame the surface supplies. */
  attached?: boolean;
}

export function CodeBlock({
  code,
  title,
  language = "tsx",
  bare = false,
  attached = false,
}: CodeBlockProps) {
  const highlight = useHighlighter(language);
  return (
    <LibraryCodeBlock
      className={styles.code}
      data-attached={attached || undefined}
      code={code}
      title={bare ? undefined : title}
      language={bare ? undefined : language}
      copyable={!bare}
      highlight={highlight}
    />
  );
}
