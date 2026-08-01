/**
 * The docs shell — category nav beside the content column.
 *
 * Every docs route renders through this: the Introduction, the two Foundations
 * pages, and both component views. Keeping the chrome in one place is what makes
 * a new docs page a matter of composing sections rather than rebuilding a page.
 *
 * Below `DOCS_COMPACT_QUERY` the nav loses its column and moves into a sheet,
 * fronted by a sticky bar (`DocsNavSheet`). One or the other is mounted, never
 * both — see `DocsNav` for why.
 */
import type { ReactNode, RefObject } from "react";
import { ScrollArea } from "@ui-organized/react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DocsNav, DOCS_COMPACT_QUERY } from "./DocsNav";
import { DocsNavSheet } from "./DocsNavSheet";
import styles from "./layout.module.css";

interface DocsLayoutProps {
  children: ReactNode;
  /** Portal target for the compact nav sheet. See `DocsNavSheet`. */
  overlayHost?: RefObject<HTMLElement | null>;
}

export function DocsLayout({ children, overlayHost }: DocsLayoutProps) {
  const compact = useMediaQuery(DOCS_COMPACT_QUERY);

  const content = (
    <main className={styles.mainInner} id="main">
      {children}
    </main>
  );

  return (
    <div className={styles.root}>
      {compact ? (
        <DocsNavSheet container={overlayHost} />
      ) : (
        // A plain box, not an `<aside>`: the `<nav>` inside `DocsNav` is the
        // landmark, and labelling both left two same-named landmarks in the tree.
        <div className={styles.sidebar}>
          <DocsNav />
        </div>
      )}

      {/* Below the compact breakpoint the frame itself is the scroller, so the
          column doesn't need one of its own — and dropping it is a fix, not just
          tidiness. Ark's `ScrollArea` sets `min-width: fit-content` inline on its
          content part, which sized the column to the widest thing anywhere in
          it; a single wide preview then laid every paragraph on the page out at
          787px inside a 375px frame and scrolled the lot sideways. Being inline,
          it can't be overridden from a stylesheet. */}
      {compact ? content : <ScrollArea className={styles.main}>{content}</ScrollArea>}
    </div>
  );
}
