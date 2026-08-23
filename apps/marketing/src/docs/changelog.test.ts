/**
 * The changelog parser, checked against the real `CHANGELOG.md` files.
 *
 * Live data on purpose, for the same reason `registry.test.ts` uses it: the
 * thing most likely to break this page is Changesets emitting a shape the
 * parser didn't expect, and a fixture would keep passing right through that.
 * The assertions are anchored to releases that have already shipped, so they
 * stay true as new ones land on top.
 */
import { describe, it, expect } from "vitest";
import { getChangelogs, parseChangelog, type PackageChangelog } from "./changelog";

const [react, tokens] = getChangelogs();

/** Every release in a package, keyed by version, for direct lookups. */
function byVersion(pkg: PackageChangelog) {
  return new Map(pkg.releases.map((release) => [release.version, release]));
}

describe("changelog parser", () => {
  it("reads the package name and slug from the H1", () => {
    expect(react.name).toBe("@ui-organized/react");
    expect(react.slug).toBe("react");
    expect(tokens.name).toBe("@ui-organized/tokens");
    expect(tokens.slug).toBe("tokens");
  });

  it("finds every release, newest first", () => {
    // A floor rather than an equality so publishing doesn't fail CI.
    expect(react.releases.length).toBeGreaterThanOrEqual(9);
    expect(react.releases.map((release) => release.version)).toContain("5.0.0");
    expect(react.releases[0].version).not.toBe(react.releases.at(-1)?.version);
  });

  it("namespaces anchor ids by package, so shared versions don't collide", () => {
    expect(byVersion(react).get("3.0.0")?.id).toBe("react-3-0-0");
    expect(byVersion(tokens).get("3.0.0")?.id).toBe("tokens-3-0-0");
  });

  it("derives the bump level from the version delta", () => {
    const releases = byVersion(react);
    expect(releases.get("5.0.1")?.bump).toBe("patch");
    expect(releases.get("5.0.0")?.bump).toBe("major");
    expect(releases.get("4.2.0")?.bump).toBe("minor");
    expect(releases.get("3.0.0")?.bump).toBe("major");
    expect(releases.get("2.1.0")?.bump).toBe("minor");
  });

  it("joins release dates from the generated manifest", () => {
    expect(byVersion(react).get("5.0.1")?.date).toBe("2026-07-27");
    expect(byVersion(tokens).get("3.3.0")?.date).toBe("2026-07-26");
  });

  it("strips the commit hash out of the entry body", () => {
    const entry = byVersion(react).get("5.0.1")?.groups[0].entries[0];
    expect(entry?.hash).toBe("a013962");
    expect(entry?.body.startsWith("Fix: icon registration")).toBe(true);
    expect(entry?.body).not.toContain("a013962:");
  });

  it("keeps entries that carry no hash at all", () => {
    // react 2.0.0's major entry predates hashed changesets.
    const entries =
      byVersion(react)
        .get("2.0.0")
        ?.groups.flatMap((group) => group.entries) ?? [];
    expect(entries).toHaveLength(1);
    expect(entries[0].hash).toBeUndefined();
    expect(entries[0].body).toContain("Base UI to Ark UI");
  });

  it("pulls dependency bumps aside instead of leaving them in the prose", () => {
    const release = byVersion(react).get("4.0.0");
    expect(release?.dependencies).toContain("@ui-organized/tokens@3.1.0");
    const bodies = release?.groups.flatMap((group) => group.entries.map((e) => e.body)) ?? [];
    expect(bodies.some((body) => body.includes("Updated dependencies"))).toBe(false);
  });

  it("drops groups left empty once their dependency bullets are removed", () => {
    for (const release of [...react.releases, ...tokens.releases]) {
      for (const group of release.groups) {
        expect(group.entries.length).toBeGreaterThan(0);
      }
    }
  });

  it("dedents continuation blocks so fenced code survives intact", () => {
    const body = byVersion(react).get("5.0.1")?.groups[0].entries[0].body ?? "";
    expect(body).toContain('```ts\nimport "@ui-organized/react/icons/lucide";');
    expect(body).toContain("```jsonc");
    // The closing fence must be at column 0 too, or the renderer never ends it.
    expect(body.split("\n").filter((line) => line === "```").length).toBeGreaterThan(0);
  });

  it("keeps a release's own sub-bullets as markdown", () => {
    const body = byVersion(tokens).get("3.3.0")?.groups[0].entries[0].body ?? "";
    expect(body).toContain("**`@ui-organized/react`**");
    expect(body).toContain("- `@ui-organized/react/styles.css` now resolves.");
  });

  it("leaves a version with no tag undated rather than guessing", () => {
    const parsed = parseChangelog(
      "# @scope/thing\n\n## 9.9.9\n\n### Patch Changes\n\n- nope\n",
      {},
    );
    expect(parsed.releases[0].date).toBeUndefined();
    expect(parsed.releases[0].bump).toBe("patch");
    expect(parsed.releases[0].groups[0].entries[0].body).toBe("nope");
  });
});
