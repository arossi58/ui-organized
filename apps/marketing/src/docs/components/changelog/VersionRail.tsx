/**
 * The version index beside the release list.
 *
 * A changelog is read two ways — top down for "what's new", and jumped into for
 * "what changed in 4.2.0". The rail serves the second without making the first
 * pay for it, and marks where you are while you scroll.
 *
 * Plain `<a href="#…">` rows rather than click handlers: fragment navigation
 * already scrolls, already works from the keyboard, and leaves a shareable URL
 * in the address bar. React Router doesn't intercept a bare anchor, so nothing
 * here has to reimplement any of that.
 */
import { useEffect, useRef, useState } from "react";
import type { ChangelogRelease } from "../../changelog";
import styles from "./changelog.module.css";
import { formatReleaseDateShort } from "./releaseMeta";

/**
 * Ark's `ScrollArea` viewport, which is what actually scrolls on a wide
 * viewport — `DocsLayout` wraps the content column in one. An
 * `IntersectionObserver` left on the default `root: null` watches the browser
 * viewport instead and would never fire for content moving inside this box.
 * Below the compact breakpoint the frame itself scrolls, there is no viewport
 * to find, and `null` is then the right root.
 */
const SCROLL_VIEWPORT = ".scroll-area__viewport";

export function VersionRail({ releases }: { releases: ChangelogRelease[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(releases[0]?.id);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ids = releases.map((release) => release.id);
    const root = ref.current?.closest(SCROLL_VIEWPORT) ?? null;
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // The topmost release still in the band wins. When none is — a single
        // release taller than the band — the last answer stands rather than
        // the rail blanking out mid-scroll.
        const first = ids.find((id) => visible.has(id));
        if (first) setActiveId(first);
      },
      // Only the top quarter counts as "here", so the highlight changes as a
      // release reaches the top of the column rather than as it appears at the
      // bottom, where three of them can be on screen at once.
      { root, rootMargin: "0px 0px -75% 0px" },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [releases]);

  return (
    <nav className={styles.rail} ref={ref} aria-label="Versions">
      <h2 className={styles.railLabel}>Versions</h2>
      <ul className={styles.railList}>
        {releases.map((release) => (
          <li key={release.id}>
            <a
              className={styles.railLink}
              href={`#${release.id}`}
              aria-current={release.id === activeId ? "true" : undefined}
            >
              <span className={styles.dot} data-bump={release.bump} aria-hidden="true" />
              {release.version}
              {release.date && (
                <span className={styles.railDate}>{formatReleaseDateShort(release.date)}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
