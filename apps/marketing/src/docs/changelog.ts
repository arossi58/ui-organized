/**
 * The release history the Foundations → Changelog page renders.
 *
 * Changesets already records every change to the library, in each package's
 * `CHANGELOG.md`. Reading those files directly is the whole point: a hand-kept
 * list on the site would drift from what was actually published the first time
 * someone released without updating it — the same argument `ThemingPage` makes
 * for importing `token-contract.json` rather than listing tokens by hand.
 *
 * What Changesets emits is close to readable but not quite: entries carry a bare
 * commit hash, dependency bumps sit in the prose as bullets, and there are no
 * dates. This module turns the markdown into a shape the page can lay out —
 * releases, grouped entries, dependency bumps pulled aside, dates joined in from
 * `manifest/release-dates.json` (see `scripts/sync-release-dates.mjs`).
 */
import reactMarkdown from "../../../../packages/react/CHANGELOG.md?raw";
import tokensMarkdown from "../../../../packages/tokens/CHANGELOG.md?raw";
import releaseDates from "../../../../manifest/release-dates.json";

export type BumpLevel = "major" | "minor" | "patch";

export interface ChangelogEntry {
  /**
   * The changeset's commit hash. Parsed so it can't leak into the body, but not
   * rendered — it's a Changesets artifact, not something a reader needs.
   */
  hash?: string;
  /** Entry markdown, dedented: summary line plus any continuation blocks. */
  body: string;
}

export interface ChangelogGroup {
  level: BumpLevel;
  entries: ChangelogEntry[];
}

export interface ChangelogRelease {
  version: string;
  /** Anchor id, namespaced by package — two packages both have a `3.0.0`. */
  id: string;
  bump: BumpLevel;
  /** ISO date from the git tag. Absent when the version was never tagged. */
  date?: string;
  groups: ChangelogGroup[];
  /** `@scope/pkg@version` strings from the `Updated dependencies` bullets. */
  dependencies: string[];
}

export interface PackageChangelog {
  /** Full package name, e.g. `@ui-organized/react`. */
  name: string;
  /** Last path segment, used for anchors and the tab label: `react`. */
  slug: string;
  releases: ChangelogRelease[];
}

const HEADING_1 = /^# (.+?)\s*$/;
const HEADING_2 = /^## (.+?)\s*$/;
const HEADING_3 = /^### (Major|Minor|Patch) Changes\s*$/;
/** `- a013962: summary`. The hash is optional — older entries have none. */
const ENTRY_HASH = /^([0-9a-f]{7,40}): /;
/** A bullet in an `Updated dependencies` body: `- @ui-organized/schema@3.1.0`. */
const DEPENDENCY = /^-\s+(\S+@\d[^\s]*)\s*$/;

/**
 * Continuation lines are indented two spaces by Changesets; stripping exactly
 * that turns an entry's sub-bullets and fenced blocks back into ordinary
 * top-level markdown. Blank lines have no indent to strip.
 */
function dedent(lines: string[]): string {
  return lines
    .map((line) => (line.startsWith("  ") ? line.slice(2) : line))
    .join("\n")
    .replace(/\s+$/, "");
}

function slugifyVersion(version: string): string {
  return version.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Which part of the version moved, by comparing against the next-older release.
 * Exact, and cheaper than trusting the `### … Changes` headings — a release can
 * carry a `Patch Changes` block of dependency bumps while itself being a minor.
 */
function bumpBetween(
  version: string,
  previous: string | undefined,
  groups: ChangelogGroup[],
): BumpLevel {
  if (previous) {
    const now = version.split(".").map(Number);
    const before = previous.split(".").map(Number);
    if (now[0] !== before[0]) return "major";
    if (now[1] !== before[1]) return "minor";
    return "patch";
  }
  // The oldest release in the file has nothing to compare against.
  if (groups.some((group) => group.level === "major")) return "major";
  if (groups.some((group) => group.level === "minor")) return "minor";
  return "patch";
}

export function parseChangelog(
  markdown: string,
  dates: Record<string, string> = {},
): PackageChangelog {
  let name = "";
  const releases: ChangelogRelease[] = [];

  let release: ChangelogRelease | null = null;
  let group: ChangelogGroup | null = null;
  let entry: string[] | null = null;

  const closeEntry = () => {
    if (!entry || !release) {
      entry = null;
      return;
    }

    const body = dedent(entry);
    entry = null;
    if (!body) return;

    // Dependency bumps are noise in the prose: several `Updated dependencies`
    // bullets in a row, then one indented list of the packages they moved. The
    // hashes in `Updated dependencies [abc1234]` don't pair up 1:1 with that
    // list, so they're dropped and only the packages are kept.
    if (body.startsWith("Updated dependencies")) {
      for (const line of body.split("\n")) {
        const match = DEPENDENCY.exec(line.trim());
        if (match) release.dependencies.push(match[1]);
      }
      return;
    }

    const hashed = ENTRY_HASH.exec(body);
    (group?.entries ?? []).push({
      hash: hashed?.[1],
      body: hashed ? body.slice(hashed[0].length) : body,
    });
  };

  for (const line of markdown.split("\n")) {
    // Everything structural sits at column 0, and every continuation line is
    // indented — so an unindented line always ends the entry being collected.
    const structural = !line.startsWith(" ") && line.trim() !== "";

    if (structural) {
      const heading3 = HEADING_3.exec(line);
      if (heading3) {
        closeEntry();
        group = { level: heading3[1].toLowerCase() as BumpLevel, entries: [] };
        release?.groups.push(group);
        continue;
      }

      const heading2 = HEADING_2.exec(line);
      if (heading2) {
        closeEntry();
        group = null;
        release = {
          version: heading2[1],
          id: "",
          bump: "patch",
          date: dates[heading2[1]],
          groups: [],
          dependencies: [],
        };
        releases.push(release);
        continue;
      }

      const heading1 = HEADING_1.exec(line);
      if (heading1) {
        closeEntry();
        name = heading1[1];
        continue;
      }

      if (line.startsWith("- ")) {
        closeEntry();
        entry = [line.slice(2)];
        continue;
      }
    }

    // Not structural: either part of the entry being collected, or filler
    // between blocks that no entry is open to claim.
    if (entry) entry.push(line);
  }

  closeEntry();

  const slug = name.split("/").pop() ?? name;
  for (const [index, item] of releases.entries()) {
    item.id = `${slug}-${slugifyVersion(item.version)}`;
    item.bump = bumpBetween(item.version, releases[index + 1]?.version, item.groups);
    // A release whose only content was dependency bumps has empty groups left
    // behind; dropping them keeps the card from rendering a bare heading.
    item.groups = item.groups.filter((entryGroup) => entryGroup.entries.length > 0);
  }

  return { name, slug, releases };
}

const dates = releaseDates as Record<string, Record<string, string>>;

let cache: PackageChangelog[] | null = null;

/**
 * The packages the page documents, in tab order. Deliberately just these two:
 * they're what a consumer of the design system installs and themes with.
 */
export function getChangelogs(): PackageChangelog[] {
  cache ??= [
    parseChangelog(reactMarkdown, dates["@ui-organized/react"] ?? {}),
    parseChangelog(tokensMarkdown, dates["@ui-organized/tokens"] ?? {}),
  ];
  return cache;
}
