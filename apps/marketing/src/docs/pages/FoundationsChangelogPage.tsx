/**
 * Foundations → Changelog.
 *
 * Rendered from the packages' own `CHANGELOG.md` files (see `docs/changelog.ts`)
 * rather than from a list kept here, so the page cannot claim a release that
 * never shipped or miss one that did.
 *
 * Two packages, on tabs: `@ui-organized/react` is the library and
 * `@ui-organized/tokens` is what themes it, and their versions move
 * independently. Anchors are namespaced by package (`#react-5-0-1`) because
 * both have shipped a `3.0.0` — which also means the hash alone says which tab
 * a link belongs to, so no query parameter is needed to make one shareable.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs } from "@ui-organized/react";
import { getChangelogs } from "../changelog";
import { DocsPageHeader, DocsProse } from "../components";
import { ReleaseCard } from "../components/changelog/ReleaseCard";
import { VersionRail } from "../components/changelog/VersionRail";
import styles from "../components/changelog/changelog.module.css";

export function FoundationsChangelogPage() {
  const changelogs = useMemo(() => getChangelogs(), []);
  const { hash } = useLocation();
  const target = hash.replace(/^#/, "");

  // Only the hash the page was opened with picks the tab. Reading it on every
  // change would fight the user: clicking a rail link sets the hash, and
  // re-deriving from it would be a second source of truth for the same state.
  const [active, setActive] = useState(
    () => changelogs.find((pkg) => target.startsWith(`${pkg.slug}-`))?.slug ?? changelogs[0].slug,
  );

  // A deep link lands before the panel it points into has rendered, so the
  // browser finds no `#react-5-0-1` to scroll to and stays at the top. One
  // frame later it exists.
  useEffect(() => {
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
    // Mount only: afterwards the browser handles fragment navigation itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DocsPageHeader
        title="Changelog"
        lede={
          <>
            Every release, newest first, straight from the packages&rsquo; own changelogs. Under{" "}
            <a href="https://semver.org">semver</a>: major asks something of your code, minor adds
            to the API, patch does neither.
          </>
        }
      />

      <Tabs
        size="small"
        value={active}
        onValueChange={(value) => setActive(String(value))}
        tabs={changelogs.map((pkg) => ({
          value: pkg.slug,
          label: pkg.name,
          content: (
            <div className={styles.layout}>
              {/* `DocsProse` supplies the measure, list and inline-code styling
                  that every entry body renders into. */}
              <DocsProse>
                {pkg.releases.map((release) => (
                  <ReleaseCard release={release} key={release.id} />
                ))}
              </DocsProse>
              <VersionRail releases={pkg.releases} />
            </div>
          ),
        }))}
      />
    </>
  );
}
