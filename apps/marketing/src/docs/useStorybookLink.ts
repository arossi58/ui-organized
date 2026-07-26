/**
 * Deep link from a docs page into the matching Storybook entry.
 *
 * Storybook emits `index.json` next to its static build on every run, so we read
 * the real story ids from it rather than reimplementing its title → id slug
 * rules (which are Storybook's to change, not ours). One fetch, memoised for the
 * session, and a null result simply hides the link — the docs page is complete
 * without it.
 */
import { useEffect, useState } from "react";
import { LINKS } from "../lib/links";

interface StorybookEntry {
  id: string;
  title: string;
  name: string;
  type?: "story" | "docs";
}

type StorybookIndex = { entries?: Record<string, StorybookEntry> };

let indexPromise: Promise<StorybookIndex | null> | undefined;

function loadIndex(): Promise<StorybookIndex | null> {
  // Not cached on failure: a dev who builds Storybook mid-session should get the
  // links on the next page view rather than having to reload the app.
  if (!indexPromise) {
    indexPromise = fetch(`${LINKS.storybook}index.json`)
      .then((res) => (res.ok ? (res.json() as Promise<StorybookIndex>) : null))
      .catch(() => null)
      .then((value) => {
        if (!value) indexPromise = undefined;
        return value;
      });
  }
  return indexPromise;
}

/**
 * A URL for `storyTitle`'s Storybook page, or null while loading / when
 * Storybook hasn't been built.
 */
export function useStorybookLink(storyTitle: string | undefined): string | null {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    if (!storyTitle) return;
    let cancelled = false;

    void loadIndex().then((index) => {
      if (cancelled || !index?.entries) return;
      const entries = Object.values(index.entries).filter((e) => e.title === storyTitle);
      // Prefer the autodocs page; fall back to the first story in the file.
      const target = entries.find((e) => e.type === "docs") ?? entries[0];
      if (!target) return;
      const view = target.type === "docs" ? "docs" : "story";
      setHref(`${LINKS.storybook}?path=/${view}/${target.id}`);
    });

    return () => {
      cancelled = true;
    };
  }, [storyTitle]);

  return href;
}
