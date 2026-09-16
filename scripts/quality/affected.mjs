/**
 * What this change actually needs tested.
 *
 * Every gate ran on every push for as long as there was one component, and the
 * suite is now 1,921 interaction assertions, 471 axe scans, 335 screenshots and
 * three framework gates on top — a full quarter-hour to be told that a typo in
 * the marketing copy did not break the Combobox. This classifies a diff into the
 * component set it can possibly have affected, and CI narrows the browser gates
 * to that set.
 *
 * ── The one rule that keeps this honest ─────────────────────────────────────
 *
 * An unrecognised path means a FULL run, never an empty one. Every classifier
 * like this fails the same way: someone adds a directory, nothing matches it,
 * the diff narrows to nothing, and the gates go quiet while reporting green.
 * Unknown input is the common case over a repository's life, not the edge case,
 * so it gets the safe answer rather than the fast one. `mode: "full"` with a
 * reason naming the path is a bad afternoon; a silent empty set is a bad
 * release.
 *
 * The same reasoning drives FANOUT below. One stylesheet backs all four
 * libraries and `@ui-organized/core` is its source of truth, so a change there
 * cannot be attributed to the component whose file it happens to sit in — the
 * only correct answer for shared code is everything. Per-component CSS under
 * `core/src/components/<Name>/` is the exception, and it is an exception because
 * the directory layout already says which component it belongs to.
 *
 * ── What it emits ───────────────────────────────────────────────────────────
 *
 * Component *slugs*, not names. A slug is what the docs registry, the story
 * index and the aggregator already agree on, and it is the one spelling all six
 * source layouts converge on: `packages/react/src/components/ColorPicker/`,
 * `packages/angular/src/lib/color-picker/` and
 * `tooling/parity/browser/fixtures/vue/color-picker.fixture.ts` are the same
 * component, and only `kebab()` makes that obvious. It also means the filter can
 * be computed before Storybook is built, which matters because this runs as the
 * first step of the job and the story index does not exist yet.
 *
 * Writes GitHub Actions outputs when $GITHUB_OUTPUT is set, and always prints a
 * human summary — reading *why* a run was narrowed should not require checking
 * out the repository.
 *
 * Usage:
 *   node scripts/quality/affected.mjs               # diff against the merge base
 *   node scripts/quality/affected.mjs --full        # force a full run
 *   node scripts/quality/affected.mjs --base <ref>  # diff against something else
 *   node scripts/quality/affected.mjs --paths a,b   # classify these paths, no git
 *
 * `--paths` exists because the interesting question about a run is usually "why
 * did it decide that?", and answering it by constructing a branch is absurd. It
 * is also how the mapping is checked: every layout in COMPONENT below can be
 * fed in directly and the answer read off.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { kebab } from "./slug.mjs";

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  // Distinguishing "git failed" from "git found nothing" matters here for the
  // same reason it does in lint.mjs: a git that cannot read the repository must
  // not read as a diff with no files in it, which is indistinguishable from a
  // change that needs no testing.
  if (result.status !== 0) return undefined;
  return result.stdout ?? "";
}

/**
 * Paths whose blast radius is the whole component set.
 *
 * Shared runtime (`core` minus its per-component directories, `tokens`,
 * `utils`), the harnesses that produce the results, the CI definition itself,
 * and anything that can move a dependency version. A change to the gate code is
 * in here deliberately: the gate is the measuring instrument, and a narrowed run
 * cannot tell you whether you just broke it.
 */
const FANOUT = [
  [/^\.github\//, "the CI definition"],
  [/^scripts\//, "the quality scripts"],
  [/^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|turbo\.json)$/, "workspace configuration"],
  [/^packages\/tokens\//, "the design tokens"],
  [/^packages\/utils\//, "@ui-organized/utils"],
  // Not obvious from its name, and checked rather than assumed: `pnpm list
  // --filter "...@ui-organized/schema"` returns react, tokens, table-core, all
  // four table adapters, storybook and parity. It is upstream of everything the
  // gates measure.
  [/^packages\/schema\//, "@ui-organized/schema, which everything depends on"],
  [/^packages\/core\/src\/components\//, null], // handled as a component path below
  [/^packages\/core\//, "@ui-organized/core, the shared source of truth"],
  [/^apps\/storybook\/src\/stories\//, null], // handled as a component path below
  [/^apps\/storybook\//, "the Storybook harness"],
  [/^tooling\/parity\/browser\/(scenarios|fixtures)\//, null], // component paths below
  [/^tooling\/parity\//, "the parity harness"],
  [/^tooling\/(eslint-config|tsconfig)\//, "the shared lint/TS configuration"],
  [
    /^packages\/(react|svelte|vue|angular)\/src\/[^/]*\.(ts|tsx)$/,
    "a library barrel or root module",
  ],
  [/^packages\/(react|svelte|vue|angular)\/src\/lib\/[^/]*\.ts$/, "a library root module"],
  [
    /^packages\/(react|svelte|vue|angular)\/(?!src\/)/,
    "a library's build or package configuration",
  ],
];

/**
 * Paths that never need a component gate.
 *
 * The docs site consumes the libraries; it cannot change them. Its own vitest
 * suite still runs — it asserts against the real packages and has caught real
 * bugs — but that arrives through the unit gate's affected-package list rather
 * than through here.
 */
const DOCS_ONLY = [
  /^apps\/marketing\//,
  /^apps\/builder\//,
  /^apps\/figma-plugin\//,
  /^tooling\/(code-connect|storybook-inspector|figma-)/,
  /^examples\//,
  /^manifest\//,
  /\.md$/,
  // Nothing here is shipped, imported or executed by a gate: editor and agent
  // configuration, the licence, changeset entries. Listed rather than left to
  // the unknown-path rule only because they change often enough that a full
  // suite for each would be the thing people learn to work around.
  /^\.(claude|vscode|changeset|husky)\//,
  /^\.(gitignore|prettierignore|npmrc|editorconfig|nvmrc)$/,
  /^LICENSE/,
];

/**
 * A path inside one component's directory, in each of the six layouts that
 * exist. The captured group is the component, in whatever spelling that layout
 * uses; `kebab()` reconciles them.
 */
const COMPONENT = [
  /^packages\/react\/src\/components\/([^/]+)\//,
  /^packages\/vue\/src\/components\/([^/]+)\//,
  /^packages\/svelte\/src\/lib\/components\/([^/]+)\//,
  /^packages\/angular\/src\/lib\/([^/]+)\//,
  /^packages\/core\/src\/components\/([^/]+)\//,
  /^apps\/storybook\/src\/stories\/([^/.]+)\.stories\.tsx?$/,
  /^tooling\/parity\/browser\/scenarios\/([^/.]+)\.ts$/,
  /^tooling\/parity\/browser\/fixtures\/[^/]+\/([^/.]+)\.fixture\.ts$/,
  /^tooling\/parity\/src\/cases\/([^/.]+)\.tsx?$/,
];

/**
 * The data table is five packages and no `components/<Name>/` directory, so it
 * needs naming rather than parsing. It is one docs component — `DataTable` —
 * which is why this maps to a slug instead of to a package set.
 */
const TABLE = /^packages\/(table-core|react-table|svelte-table|vue-table|angular-table)\//;

/**
 * Publishable packages that back no component.
 *
 * They still need the smoke gate — it packs and runs the real tarball, which is
 * where the CLI once shipped as a silent no-op — but no story renders them, so
 * narrowing the browser gates to nothing is the correct answer rather than a
 * lucky one. Each was confirmed to have no dependent that a gate measures;
 * `schema` looked like it belonged here and does not, which is why it is in
 * FANOUT above.
 */
const NON_COMPONENT = /^packages\/(cli|export|token-io|resolver|react-vite)\//;

function classify(files) {
  const components = new Set();
  const reasons = [];

  for (const file of files) {
    if (TABLE.test(file)) {
      components.add("data-table");
      continue;
    }

    // Skipped for the component gates, but `touchedPackages` below still sees
    // it, so the smoke gate runs.
    if (NON_COMPONENT.test(file)) continue;

    const component = COMPONENT.map((re) => file.match(re)).find(Boolean);
    if (component) {
      components.add(kebab(component[1]));
      continue;
    }

    const fanout = FANOUT.find(([re]) => re.test(file));
    // A `null` reason is a pattern that exists only to stop a broader FANOUT
    // rule from swallowing a component path. Reaching one here means the path
    // matched the directory but not the file shape — a stray README in a
    // component folder, say — which is not a reason to test anything.
    if (fanout) {
      if (fanout[1] === null) continue;
      return { mode: "full", components: [], reason: `${file} — ${fanout[1]}` };
    }

    if (DOCS_ONLY.some((re) => re.test(file))) continue;

    // See the header: unknown means full, every time.
    return {
      mode: "full",
      components: [],
      reason: `${file} — unrecognised path, so nothing can rule out a component`,
    };
  }

  return {
    mode: components.size ? "targeted" : "no-components",
    components: [...components].sort(),
    reason: reasons.join("; "),
    // Whether any publishable package was touched at all. The smoke gate packs
    // and executes tarballs, so it keys off this rather than off the component
    // set: `packages/cli/` changes no component and still has to be smoked.
    touchedPackages: files.some((f) => /^packages\//.test(f)),
  };
}

// ── Run ──────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const baseFlag = argv.indexOf("--base");
const pathsFlag = argv.indexOf("--paths");
const forced = argv.includes("--full");

let result;
if (forced) {
  result = { mode: "full", components: [], reason: "--full was passed" };
} else if (pathsFlag !== -1) {
  const files = (argv[pathsFlag + 1] ?? "")
    .split(/[,\n]/)
    .map((f) => f.trim())
    .filter(Boolean);
  result = classify(files);
  result.files = files.length;
} else {
  // The same two-step the prettier check in lint.mjs uses: `origin/main` on a
  // fetched clone, bare `main` on a local one.
  const base =
    (baseFlag !== -1 && argv[baseFlag + 1]) ||
    git(["merge-base", "HEAD", "origin/main"])?.trim() ||
    git(["merge-base", "HEAD", "main"])?.trim();

  if (!base) {
    result = { mode: "full", components: [], reason: "no merge base to diff against" };
  } else {
    const diff = git(["diff", "--name-only", "--diff-filter=ACMRD", base, "HEAD"]);
    if (diff === undefined) {
      result = { mode: "full", components: [], reason: "git could not read the diff" };
    } else {
      const files = diff.split("\n").filter(Boolean);
      result = files.length
        ? classify(files)
        : { mode: "no-components", components: [], reason: "no files changed" };
      result.files = files.length;
      result.base = base;
    }
  }
}

/**
 * Which workspace packages to run unit tests for.
 *
 * Delegated to pnpm rather than derived from the paths above, because this one
 * needs *dependents*: a change to `table-core` has to run `react-table`'s suite,
 * and no path pattern knows that. `...[base]` is pnpm's own answer and it reads
 * the real dependency graph.
 */
function affectedPackages(base) {
  const result = spawnSync(
    "pnpm",
    ["list", "--filter", `...[${base}]`, "--depth", "-1", "--json"],
    { encoding: "utf8" },
  );
  if (result.status !== 0 || !result.stdout) return undefined;
  try {
    return JSON.parse(result.stdout)
      .map((p) => p.name)
      .filter(Boolean);
  } catch {
    return undefined;
  }
}

const packages = result.mode === "full" || !result.base ? undefined : affectedPackages(result.base);

const runGates = result.mode === "full" || result.components.length > 0;

/**
 * The tarball gates only mean something when a publishable package changed:
 * they pack, install and execute the built artifact, which no docs edit moves.
 *
 * pnpm's answer is preferred because it carries dependents — editing
 * `table-core` has to smoke `react-table` — and the path signal is the fallback
 * for when there is no base to ask about (`--paths`), where "a package was
 * touched" is the most that can be known.
 */
const publishable = packages?.filter(
  (name) => name.startsWith("@ui-organized/") && name !== "@ui-organized/marketing",
);
const runSmoke =
  result.mode === "full" ||
  (publishable ? publishable.length > 0 : (result.touchedPackages ?? false));

const outputs = {
  mode: result.mode,
  components: result.components.join(","),
  packages: packages ? packages.join(",") : "",
  "run-gates": String(runGates),
  "run-smoke": String(runSmoke),
  reason: result.reason || "",
};

console.log(`Affected: ${result.mode}${result.base ? ` (vs ${result.base.slice(0, 8)})` : ""}`);
if (result.reason) console.log(`  why: ${result.reason}`);
if (result.components.length) console.log(`  components: ${result.components.join(", ")}`);
if (packages?.length) console.log(`  packages: ${packages.join(", ")}`);
console.log(`  gates: ${runGates ? "run" : "skip"}   smoke: ${runSmoke ? "run" : "skip"}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n",
  );
}
