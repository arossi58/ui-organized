/**
 * Gate 4 — linting and token validation.
 *
 * Six checks, run as one gate. They are orchestrated here rather than chained
 * with `&&` in package.json for two reasons: every check runs even when an
 * earlier one fails (so one broken thing doesn't hide five others), and the
 * results are written as structured JSON that the aggregator attributes back to
 * individual components.
 *
 * Writes `.quality/lint.json`. Exits non-zero if any check failed — this gate
 * blocks a merge.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { slugForFilePath } from "./slug.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const QUALITY = resolve(root, ".quality");
mkdirSync(QUALITY, { recursive: true });

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: root, encoding: "utf8", shell: false, ...opts });

const checks = [];
// `detail` is the failure explanation, so it is only recorded on failure —
// otherwise a passing token-contract check ships "token-contract.json is out of
// date" in the feed, which reads as a problem on a page whose whole job is
// telling you whether there is one.
const record = (name, ok, detail) => {
  checks.push({ name, status: ok ? "pass" : "fail", ...(ok ? {} : { detail }) });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail && !ok ? ` — ${detail}` : ""}`);
  return ok;
};

/** Reported, counted, and shown on /quality — but does not fail the gate. */
const advise = (name, ok, detail) => {
  checks.push({ name, status: ok ? "pass" : "warn", ...(ok ? {} : { detail }) });
  console.log(`  ${ok ? "✓" : "!"} ${name}${detail && !ok ? ` — ${detail}` : ""}`);
  return ok;
};

console.log("\nLint & token validation\n");

// ── 1. ESLint ────────────────────────────────────────────────────────────────
// JSON to a file for the aggregator, and the human-readable form to the console,
// because a gate you can't read the output of is a gate you disable.
const eslintJson = resolve(QUALITY, "eslint.json");
run("pnpm", ["exec", "eslint", ".", "-f", "json", "-o", eslintJson]);
let eslintResults = [];
try {
  eslintResults = JSON.parse(readFileSync(eslintJson, "utf8"));
} catch {
  /* No parseable output; treated as no results below. */
}
const eslintErrors = eslintResults.reduce((n, f) => n + f.errorCount, 0);
const eslintWarnings = eslintResults.reduce((n, f) => n + f.warningCount, 0);
if (eslintErrors) {
  const pretty = run("pnpm", ["exec", "eslint", "."]);
  console.log(pretty.stdout ?? "");
}
record("eslint", eslintErrors === 0, `${eslintErrors} error(s), ${eslintWarnings} warning(s)`);

// ── 2. Stylelint ─────────────────────────────────────────────────────────────
const stylelintJson = resolve(QUALITY, "stylelint.json");
const stylelint = run("pnpm", [
  "exec",
  "stylelint",
  "packages/react/src/**/*.css",
  // The data table owns its own stylesheet, in its own package — held to the
  // same rule, because a hard-coded colour there breaks a theme just as
  // thoroughly.
  "packages/table-core/src/**/*.css",
  "-f",
  "json",
  "-o",
  stylelintJson,
]);
let stylelintResults = [];
try {
  stylelintResults = JSON.parse(readFileSync(stylelintJson, "utf8"));
} catch {
  /* no output */
}
const styleErrors = stylelintResults.reduce(
  (n, f) => n + f.warnings.filter((w) => w.severity === "error").length,
  0,
);
if (styleErrors) console.log(stylelint.stdout || stylelint.stderr || "");
record("stylelint", styleErrors === 0, `${styleErrors} error(s)`);

// ── 3. Prettier — advisory, on changed files only ────────────────────────────
// `prettier --check .` reports 530 files: this repo has a .prettierrc but has
// never been formatted against it. Reformatting everything is a legitimate
// change, but it is its own commit — bundled into a feature branch it buries the
// actual diff and collides with everything in flight.
//
// So the gate only looks at files this branch touched — and only ADVISES, never
// blocks. A blocking formatter over a codebase that predates it pushes people
// into exactly that mass reformat just to get a green build: running
// `prettier --write` over this branch's changed files produced a 12,000-line
// diff across 162 files, which is the argument for this rule in one number.
//
// Fix them deliberately: `pnpm exec prettier --write <files>`. Once the repo has
// had its one-time format pass, this can become blocking.
const PRETTIER_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|json|jsonc|md|yml|yaml)$/;
const base =
  run("git", ["merge-base", "HEAD", "origin/main"]).stdout?.trim() ||
  run("git", ["merge-base", "HEAD", "main"]).stdout?.trim();

if (!base) {
  checks.push({ name: "prettier", status: "skip", detail: "no merge base to diff against" });
  console.log("  · prettier — skipped (no merge base)");
} else {
  const changed = [
    ...(run("git", ["diff", "--name-only", "--diff-filter=ACMR", base, "HEAD"]).stdout ?? "").split(
      "\n",
    ),
    ...(run("git", ["diff", "--name-only", "--diff-filter=ACMR"]).stdout ?? "").split("\n"),
    ...(run("git", ["ls-files", "--others", "--exclude-standard"]).stdout ?? "").split("\n"),
  ]
    .map((f) => f.trim())
    .filter((f) => f && PRETTIER_EXT.test(f) && existsSync(resolve(root, f)));
  const unique = [...new Set(changed)];

  if (!unique.length) {
    checks.push({ name: "prettier", status: "pass", detail: "no changed files to check" });
    console.log("  · prettier — no changed files");
  } else {
    const prettier = run("pnpm", ["exec", "prettier", "--check", ...unique]);
    // Prettier writes its `[warn] <file>` lines to stderr, not stdout — reading
    // only stdout reported "0 of 245 unformatted" while six files were.
    const unformatted = `${prettier.stdout ?? ""}\n${prettier.stderr ?? ""}`
      .split("\n")
      .filter((line) => line.startsWith("[warn]") && !line.includes("Code style issues")).length;
    advise(
      "prettier",
      prettier.status === 0,
      `${unformatted} of ${unique.length} changed file(s) unformatted — ` +
        `\`pnpm exec prettier --write\` them`,
    );
  }
}

// ── 4. Token contract ────────────────────────────────────────────────────────
// The contract is DERIVED from the component CSS, so regenerating it and finding
// the checked-in file unchanged is the assertion: any new `var(--token)` a theme
// would have to supply shows up here as a diff. This is the check that would
// have caught the Theme Builder export that silently omitted `--dimension-*`.
//
// Two contracts, because there are two stylesheets: the component library's
// (generated by `@ui-organized/core`, which owns the CSS and mirrors the file
// into `packages/react`) and the data table's.
//
// The generator used to be invoked as `--filter @ui-organized/react
// gen:contract`. That script moved to `@ui-organized/core` when the CSS did, so
// the call had been failing silently and the diff below was comparing a file
// nothing had regenerated — a check that could not fail.
run("pnpm", ["--filter", "@ui-organized/core", "gen:contract"]);
run("pnpm", ["--filter", "@ui-organized/table-core", "gen:contract"]);
const contractDiff = run("git", [
  "diff",
  "--exit-code",
  "--",
  "packages/core/token-contract.json",
  "packages/react/token-contract.json",
  "packages/table-core/token-contract.json",
]);
if (contractDiff.status !== 0) console.log(contractDiff.stdout ?? "");
record(
  "token-contract",
  contractDiff.status === 0,
  "token-contract.json is out of date — commit the regenerated file",
);

// ── 5. Typecheck (packages only) ─────────────────────────────────────────────
// Scoped to packages and tooling on purpose: the apps have pre-existing type
// errors, which .github/actions/build-site works around by calling `vite build`
// directly. Gating on those here would make this red for reasons that have
// nothing to do with component quality.
const typecheck = run("pnpm", ["run", "typecheck:packages"]);
if (typecheck.status !== 0) console.log(typecheck.stdout ?? "");
record("typecheck", typecheck.status === 0, "packages/* and tooling/* must typecheck");

// ── 6. Orphaned visual baselines ─────────────────────────────────────────────
// Only meaningful once Storybook has been built; skipped rather than failed
// otherwise, so `pnpm quality:lint` works standalone.
if (existsSync(resolve(root, "apps/storybook/storybook-static/index.json"))) {
  const prune = run("node", ["scripts/quality/prune-baselines.mjs", "--check"]);
  if (prune.status !== 0) console.log(prune.stderr ?? "");
  record("visual-baselines", prune.status === 0, "orphaned baselines — run prune-baselines.mjs");
} else {
  checks.push({ name: "visual-baselines", status: "skip", detail: "no Storybook build" });
  console.log("  · visual-baselines — skipped (no Storybook build)");
}

// ── Attribute findings to components ─────────────────────────────────────────
const byComponent = {};
const attribute = (filePath, messages, source) => {
  const slug = slugForFilePath(filePath);
  if (!slug) return;
  const entry = (byComponent[slug] ??= { errors: 0, warnings: 0, messages: [] });
  for (const m of messages) {
    const isError = m.severity === 2 || m.severity === "error";
    if (isError) entry.errors++;
    else entry.warnings++;
    if (isError && entry.messages.length < 5) {
      entry.messages.push({
        source,
        rule: m.ruleId ?? m.rule,
        line: m.line,
        text: m.message ?? m.text,
      });
    }
  }
};
for (const file of eslintResults) attribute(file.filePath, file.messages, "eslint");
for (const file of stylelintResults) attribute(file.source, file.warnings, "stylelint");
// Only components with actual errors belong in the map — warnings alone must not
// paint a component's Tokens cell red.
for (const [slug, entry] of Object.entries(byComponent)) {
  if (!entry.errors) delete byComponent[slug];
}

const failed = checks.filter((c) => c.status === "fail");
const warned = checks.filter((c) => c.status === "warn");
writeFileSync(
  resolve(QUALITY, "lint.json"),
  JSON.stringify(
    { status: failed.length ? "fail" : warned.length ? "warn" : "pass", checks, byComponent },
    null,
    2,
  ) + "\n",
);

console.log(
  failed.length
    ? `\n✗ ${failed.length} of ${checks.length} checks failed: ${failed.map((c) => c.name).join(", ")}\n`
    : warned.length
      ? `\n✓ no blocking failures (advisory: ${warned.map((c) => c.name).join(", ")})\n`
      : `\n✓ all ${checks.length} checks passed\n`,
);
process.exit(failed.length ? 1 : 0);
