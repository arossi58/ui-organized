/**
 * Turn every gate's report into the one file the docs site reads.
 *
 * Inputs  — `.quality/{visual,interaction,a11y,browsers,lint,unit}.json`
 * Output  — `manifest/test-status.json`, keyed by docs slug
 *
 * Deliberately reads REPORTS, not exit codes. The warn-only gates run under
 * `continue-on-error` in CI, so their failures never reach an exit status —
 * reading the reports is what keeps a warn-only failure visible on the docs page
 * instead of silently vanishing.
 *
 * A gate whose report is missing is recorded as `not-run`, never as passing.
 * Every way a check can fail to happen has to look different from the check
 * succeeding, or the dashboard becomes decorative.
 *
 *   node scripts/quality/aggregate.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { knownComponents, slugForTestTitle, slugForFilePath, storyNameForTitle } from "./slug.mjs";
import { readPlaywrightReport, readAttachment, rollUp } from "./report.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const Q = (name) => resolve(root, ".quality", `${name}.json`);
const OUT = resolve(root, "manifest/test-status.json");

/**
 * Which gates block a merge.
 *
 * Visual and cross-browser are advisory: a pixel diff is usually an intended
 * redesign, and engine-specific console noise is often third-party. They still
 * report, and still show on the docs page — they just don't stop the queue.
 */
const GATES = {
  visual: { blocking: false, label: "Visual regression" },
  interaction: { blocking: true, label: "Interaction" },
  a11y: { blocking: true, label: "Accessibility" },
  tokens: { blocking: true, label: "Tokens & lint" },
  crossBrowser: { blocking: false, label: "Cross-browser" },
};

const git = (...args) => {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return undefined;
  }
};

// ── Collect ──────────────────────────────────────────────────────────────────
const components = knownComponents();
const byGate = {};
const blank = () => ({ visual: [], interaction: [], a11y: [], crossBrowser: [] });
const perComponent = new Map([...components.keys()].map((slug) => [slug, blank()]));

/** File a Playwright row under the component its story belongs to. */
function fileRow(gate, row) {
  const slug = slugForTestTitle(row.title);
  byGate[gate].push(row);
  if (slug && perComponent.has(slug)) perComponent.get(slug)[gate].push(row);
}

for (const [gate, file] of [
  ["visual", "visual"],
  ["interaction", "interaction"],
  ["a11y", "a11y"],
  ["crossBrowser", "browsers"],
]) {
  const rows = readPlaywrightReport(Q(file));
  byGate[gate] = [];
  if (rows === null) {
    byGate[gate] = null; // not run
    continue;
  }
  for (const row of rows) fileRow(gate, row);
}

// Vitest results for component tests join the interaction gate: a unit test that
// mounts ColorPicker and a Playwright spec that clicks it are answering the same
// question, and splitting them across two cells on the docs page would suggest
// they aren't.
const unit = existsSync(Q("unit")) ? JSON.parse(readFileSync(Q("unit"), "utf8")) : null;
if (unit?.tests) {
  for (const test of unit.tests) {
    const slug = slugForFilePath(test.file ?? "");
    const row = { title: test.name, status: test.status, project: "vitest", attachments: [] };
    if (byGate.interaction) byGate.interaction.push(row);
    if (slug && perComponent.has(slug)) perComponent.get(slug).interaction.push(row);
  }
}

const lint = existsSync(Q("lint")) ? JSON.parse(readFileSync(Q("lint"), "utf8")) : null;

// ── Per-check detail ─────────────────────────────────────────────────────────
/**
 * What a gate actually checked, for a component, in words.
 *
 * The counts alone ("7 of 9 checks") tell you a gate ran but not what it looked
 * at, which is the first thing anyone asks when a cell is amber. These are the
 * names, deduplicated across browsers — the same assertion run on three engines
 * is one check that ran on three engines, not three checks.
 */
function describeChecks(gate, rows) {
  const byName = new Map();

  for (const row of rows) {
    // Interaction titles are `<storyId> › what it does`; the rest are bare
    // story ids. Either way the readable half is what belongs on the page.
    const behaviour = row.title.includes("›")
      ? row.title.split("›").slice(1).join("›").trim()
      : undefined;
    const name = behaviour ?? storyNameForTitle(row.title) ?? row.title;

    const entry = byName.get(name) ?? { name, status: "skip", engines: new Set() };
    // fail > pass > skip. A failure anywhere means the check has not passed; a
    // pass anywhere means it did run, so a check that passes on two engines and
    // is deliberately skipped on the third is a pass, not a skip.
    const RANK = { skip: 0, pass: 1, fail: 2 };
    if (RANK[row.status] > RANK[entry.status]) entry.status = row.status;
    if (row.project) entry.engines.add(row.project.replace(/^(smoke|a11y|interaction)-/, ""));
    byName.set(name, entry);
  }

  return [...byName.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, status, engines }) => ({
      name,
      status,
      // Only worth listing when a check genuinely spans engines; one entry
      // saying "chromium" on every visual row is noise.
      ...(engines.size > 1 ? { engines: [...engines].sort() } : {}),
    }));
}

// ── a11y detail ──────────────────────────────────────────────────────────────
// The axe attachment carries the violations themselves, so the docs page can
// name what is wrong rather than just colouring a chip red.
function a11yDetail(rows) {
  const open = new Map();
  for (const row of rows) {
    const payload = readAttachment(row.attachments, "axe");
    if (!payload) continue;
    for (const v of [...(payload.violations ?? []), ...(payload.known ?? [])]) {
      const existing = open.get(v.id);
      if (existing) existing.nodes += v.nodes ?? 0;
      else
        open.set(v.id, {
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes ?? 0,
        });
    }
  }
  return [...open.values()].sort((a, b) => a.id.localeCompare(b.id));
}

// ── Per-component ────────────────────────────────────────────────────────────
const out = {};
for (const [slug, meta] of [...components].sort(([a], [b]) => a.localeCompare(b))) {
  const rows = perComponent.get(slug);

  // `checks` is what the docs dashboard lists when a row is expanded.
  const withChecks = (gate, gateRows, config) => ({
    ...rollUp(gateRows, config),
    ...(gateRows.length ? { checks: describeChecks(gate, gateRows) } : {}),
  });

  const visual =
    byGate.visual === null
      ? { status: "not-run" }
      : withChecks("visual", rows.visual, GATES.visual);
  const interaction =
    byGate.interaction === null
      ? { status: "not-run" }
      : withChecks("interaction", rows.interaction, GATES.interaction);
  const crossBrowser =
    byGate.crossBrowser === null
      ? { status: "not-run" }
      : withChecks("crossBrowser", rows.crossBrowser, GATES.crossBrowser);

  let a11y;
  if (byGate.a11y === null) {
    a11y = { status: "not-run" };
  } else {
    a11y = withChecks("a11y", rows.a11y, GATES.a11y);
    const violations = a11yDetail(rows.a11y);
    if (violations.length) {
      // Baselined violations pass the gate but must not read as clean — they are
      // open bugs, and the docs page says so.
      if (a11y.status === "pass") a11y.status = "warn";
      a11y.violations = violations;
    }
  }

  // A component's Tokens cell reflects that component. A repo-wide *failure*
  // (a broken token contract, a typecheck error) genuinely affects all of them
  // and propagates; a repo-wide *advisory* (unformatted files somewhere in the
  // branch) does not, or all 66 components turn yellow for something none of
  // them did — and a dashboard where everything is warning is a dashboard where
  // nothing is.
  const perFile = lint?.byComponent?.[slug];
  const tokens = !lint
    ? { status: "not-run" }
    : perFile
      ? {
          status: "fail",
          errors: perFile.errors,
          warnings: perFile.warnings,
          messages: perFile.messages,
        }
      : lint.status === "fail"
        ? { status: "warn", note: "a repo-wide check failed" }
        : { status: "pass" };

  const browsers = {};
  for (const row of rows.crossBrowser) {
    const engine = row.project.replace(/^smoke-/, "");
    if (row.status === "skip") continue;
    browsers[engine] = row.status === "fail" ? "fail" : (browsers[engine] ?? "pass");
  }
  if (Object.keys(browsers).length) crossBrowser.browsers = browsers;

  out[slug] = {
    name: meta.name,
    category: meta.category,
    visual,
    interaction,
    a11y,
    tokens,
    crossBrowser,
  };
}

// ── Repo-wide gate summaries ─────────────────────────────────────────────────
const gates = {};
for (const [gate, config] of Object.entries(GATES)) {
  if (gate === "tokens") {
    gates.tokens = lint
      ? { ...config, status: lint.status, checks: lint.checks }
      : { ...config, status: "not-run" };
    continue;
  }
  gates[gate] =
    byGate[gate] === null
      ? { ...config, status: "not-run" }
      : { ...config, ...rollUp(byGate[gate], config) };
}

// A component carrying baselined a11y violations makes the repo-wide gate
// "warn" too — the summary must not look cleaner than the parts it summarises.
if (gates.a11y.status === "pass" && Object.values(out).some((c) => c.a11y.status === "warn")) {
  gates.a11y.status = "warn";
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      $comment:
        "GENERATED by scripts/quality/aggregate.mjs — do not edit. Regenerate with `pnpm quality`. " +
        "Committed so local builds of the docs site render something; CI regenerates it before " +
        "building the marketing app, so a deployed page always shows that run's real results.",
      generatedAt: new Date().toISOString(),
      commit: process.env.GITHUB_SHA ?? git("rev-parse", "HEAD"),
      branch:
        process.env.GITHUB_HEAD_REF ||
        process.env.GITHUB_REF_NAME ||
        git("rev-parse", "--abbrev-ref", "HEAD"),
      runUrl:
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
          : null,
      gates,
      components: out,
    },
    null,
    2,
  ) + "\n",
);

// ── Console summary ──────────────────────────────────────────────────────────
const ICON = { pass: "✓", warn: "▲", fail: "✗", "not-run": "·", none: "·", skip: "·" };
console.log(`\n✓ ${OUT.replace(root + "/", "")}\n`);
for (const [gate, result] of Object.entries(gates)) {
  const counts =
    result.total != null
      ? `${result.passed}/${result.total} passed` +
        (result.failed ? `, ${result.failed} failed` : "") +
        (result.skipped ? `, ${result.skipped} skipped` : "")
      : (result.checks ?? []).map((c) => `${c.name}:${c.status}`).join(" ");
  console.log(
    `  ${ICON[result.status] ?? "?"} ${result.label.padEnd(18)} ${String(result.status).padEnd(8)} ` +
      `${result.blocking ? "blocking" : "advisory"}  ${counts}`,
  );
}
const covered = Object.values(out).filter((c) => c.interaction.status !== "none").length;
console.log(`\n  ${Object.keys(out).length} components · ${covered} with interaction coverage`);
