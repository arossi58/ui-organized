/**
 * One release, as the Changelog page presents it.
 *
 * The three things Changesets leaves for a reader to do — work out how big the
 * release was, work out when it happened, and read past the dependency bumps —
 * are what this component does instead: a bump badge derived from the version
 * delta, the date from the git tag, and the `Updated dependencies` bullets moved
 * out of the prose and into a footnote.
 */
import { Tag } from "@ui-organized/react";
import type { ChangelogRelease } from "../../changelog";
import { MarkdownBlocks } from "../MarkdownBlocks";
import styles from "./changelog.module.css";
import { BUMP_LABEL, BUMP_VARIANT, GROUP_LABEL, formatReleaseDate } from "./releaseMeta";

export function ReleaseCard({ release }: { release: ChangelogRelease }) {
  // With one group the badge above has already named the kind of change, and a
  // heading repeating it is noise between the version and the first sentence.
  const showGroupLabels = release.groups.length > 1;

  return (
    <article className={styles.release} id={release.id} aria-labelledby={`${release.id}-version`}>
      <div className={styles.releaseHead}>
        <h2 className={styles.version} id={`${release.id}-version`}>
          {release.version}
        </h2>
        {/* `emphasized={false}`: the subdued Tag reads at the same weight the
            hand-rolled badge did, and the solid fills carry the palette's known
            AA gap on a 12px light label (see Tag.css). */}
        <Tag variant={BUMP_VARIANT[release.bump]} size="sm" emphasized={false}>
          {BUMP_LABEL[release.bump]}
        </Tag>
        {/* Absent for any version that was never tagged — see
            scripts/sync-release-dates.mjs. Nothing is rendered in its place;
            an "unknown date" label would be worse than no date. */}
        {release.date && (
          <time className={styles.date} dateTime={release.date}>
            {formatReleaseDate(release.date)}
          </time>
        )}
      </div>

      {release.groups.map((group) => (
        <div className={styles.group} key={group.level}>
          {showGroupLabels && <h3 className={styles.groupLabel}>{GROUP_LABEL[group.level]}</h3>}
          {/* Keyed by position, not by hash: one commit can carry two changesets,
              so two entries in the same group can share a hash. */}
          {group.entries.map((entry, index) => (
            <div className={styles.entry} key={index}>
              <MarkdownBlocks markdown={entry.body} />
            </div>
          ))}
        </div>
      ))}

      {release.dependencies.length > 0 && (
        <p className={styles.dependencies}>
          Dependency updates:{" "}
          {release.dependencies.map((dependency, index) => (
            <span key={dependency}>
              {index > 0 && ", "}
              <span className={styles.dependencyName}>{dependency}</span>
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
