/**
 * What a push to main still needs testing, and against what.
 *
 * A PR is narrowed to the components its diff can reach (see affected.mjs), and
 * for a long time every push to main then ran the whole suite again, an hour
 * and three quarters spent re-proving what the PR had just proved. This answers
 * the two questions that decide whether main can do less:
 *
 *   base      the newest commit on main whose CI run passed. A push is narrowed
 *             to the diff from HERE, not from `github.event.before`. Diffing
 *             from the previous push lets a red commit hide behind the next one:
 *             A breaks the Combobox and goes red, B touches only the Tabs, B's
 *             narrowed run passes, and main reads green with a broken Combobox.
 *             From the last green commit, B's diff still contains A's change.
 *             It is also what makes `cancel-in-progress` safe on main: a run
 *             cancelled by a newer push is covered by that push's diff.
 *
 *   verified  this push is a PR merge whose own CI run already tested exactly
 *             this tree, so the gates have nothing left to say about it.
 *
 * ── When a merge counts as already tested ───────────────────────────────────
 *
 * All four, or it falls back to narrowing:
 *
 *   1. HEAD is a two-parent merge. Squash and rebase merges write a commit no
 *      PR run ever checked out, so they never verify.
 *   2. Its first parent is the last green commit: main was green right before
 *      the merge, so there is no earlier breakage for a skip to carry forward.
 *   3. The branch already contained that parent (it was up to date with main),
 *      so the tree that landed is the branch's own tree. A PR run checks out
 *      `refs/pull/N/merge`, the branch merged into main *as main was then*, and
 *      for an up-to-date branch that is the same tree again.
 *   4. The MOST RECENT PR run for the branch head passed. Most recent, not any:
 *      a draft's run skips every job, and an older green run must not vouch for
 *      a merge whose ready-for-review run failed.
 *
 * Any failure to ask GitHub reads as "no base", which the caller turns into a
 * full run. This decides what NOT to test, so every unknown gets the slow answer.
 *
 * Usage:
 *   node scripts/quality/last-green.mjs              # about HEAD
 *   node scripts/quality/last-green.mjs --sha <ref>  # about some other commit
 *
 * Needs GITHUB_REPOSITORY. GITHUB_TOKEN is optional for a public repository,
 * which is what lets the answer for any past merge be checked from a laptop.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) return undefined;
  return (result.stdout ?? "").trim();
}

const isAncestor = (ancestor, of) =>
  spawnSync("git", ["merge-base", "--is-ancestor", ancestor, of]).status === 0;

const tree = (ref) => git(["rev-parse", `${ref}^{tree}`]);

/** Runs on main that measured main itself. A fork PR from a branch called `main` is excluded by event. */
const MAIN_EVENTS = new Set(["push", "schedule", "workflow_dispatch"]);

async function api(path) {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${path}`,
    {
      headers: {
        accept: "application/vnd.github+json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!response.ok) throw new Error(`GET ${path} answered ${response.status}`);
  return response.json();
}

async function decide(head) {
  const { workflow_runs: green } = await api(
    "/actions/workflows/ci.yml/runs?branch=main&status=success&per_page=50",
  );
  // Strictly older: a re-run of this very commit must still answer the question
  // its first run answered, and asking about a past merge from a laptop must not
  // find that merge's own run.
  const baseRun = green.find(
    (run) => MAIN_EVENTS.has(run.event) && run.head_sha !== head && isAncestor(run.head_sha, head),
  );
  if (!baseRun) return { reason: "no passing run on main is an ancestor of this commit" };
  const base = baseRun.head_sha;

  const parents = git(["rev-list", "--parents", "-n", "1", head])?.split(" ").slice(1) ?? [];
  if (parents.length !== 2) return { base, reason: "not a merge commit" };

  const [main, branch] = parents;
  if (main !== base) {
    return {
      base,
      reason: `main was not green right before this merge (last green: ${base.slice(0, 8)})`,
    };
  }

  const { workflow_runs: prRuns } = await api(
    `/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${branch}&per_page=20`,
  );
  const latest = prRuns[0];
  if (!latest) return { base, reason: `no PR run tested the branch head ${branch.slice(0, 8)}` };
  if (latest.status !== "completed" || latest.conclusion !== "success") {
    return {
      base,
      reason: `the branch head's latest PR run is ${latest.conclusion ?? latest.status}`,
    };
  }

  // What that run tested: `refs/pull/N/merge`, the branch merged into main as
  // main stood when the run was created. That is this merge's tree in either of
  // two ways. The branch already held main, so every merge of it is its own
  // tree. Or main had not moved since: the run was created after main reached
  // this merge's first parent, so it merged the same two commits GitHub just
  // did. The second is the usual one here, because a long-lived branch that is
  // merged, then committed to, then merged again never contains main's merge
  // commits. `created_at` rather than `run_started_at` because a re-run keeps
  // its original merge ref: an old run re-run today still tested the old main.
  // `baseRun` may be a later dispatch of that commit rather than the push that
  // put it on main, which only ever makes this stricter.
  const upToDate = isAncestor(main, branch) && tree(head) === tree(branch);
  const mainUnmoved = new Date(latest.created_at) > new Date(baseRun.created_at);
  if (!upToDate && !mainUnmoved) {
    return {
      base,
      reason: "main moved after the PR's last run, so that run tested a different tree",
    };
  }

  return { base, verified: true, reason: `PR run ${latest.html_url} tested this exact tree` };
}

// ── Run ──────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const shaFlag = argv.indexOf("--sha");
const head = git(["rev-parse", (shaFlag !== -1 && argv[shaFlag + 1]) || "HEAD"]);

let result;
if (!head) {
  result = { reason: "git could not resolve the commit" };
} else if (!process.env.GITHUB_REPOSITORY) {
  result = { reason: "GITHUB_REPOSITORY is not set" };
} else {
  try {
    result = await decide(head);
  } catch (error) {
    result = { reason: `could not ask GitHub: ${error.message}` };
  }
}

const outputs = {
  base: result.base ?? "",
  verified: String(result.verified === true),
  reason: result.reason,
};

console.log(`Last green: ${outputs.base ? outputs.base.slice(0, 8) : "none"}`);
console.log(`  verified: ${outputs.verified}   why: ${outputs.reason}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n",
  );
}
