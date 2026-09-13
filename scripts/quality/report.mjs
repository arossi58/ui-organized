/**
 * Reading Playwright's JSON report.
 *
 * All four browser gates emit the same shape, so the walking and status
 * bookkeeping live here rather than four times over in the aggregator.
 */
import { readFileSync, existsSync } from "node:fs";

/**
 * Flatten a Playwright JSON report into one row per (spec × project).
 *
 * `status` is normalised to pass / fail / skip. Playwright reports a test that
 * passed on retry as "flaky"; that counts as a pass for reporting but is
 * surfaced separately, because a gate quietly carrying flakes is a gate on its
 * way to being ignored.
 */
export function readPlaywrightReport(path) {
  if (!existsSync(path)) return null;

  let report;
  try {
    report = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    // A truncated report means the run died mid-write. Say so rather than
    // reporting the gate as having no results, which reads as "nothing to test".
    throw new Error(`${path} is not valid JSON (run interrupted?): ${error.message}`);
  }

  const rows = [];
  const walk = (suite) => {
    (suite.suites ?? []).forEach(walk);
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const result = test.results?.at(-1);

        // `test.status` — NOT `spec.ok`. When one spec runs under several
        // projects, Playwright's `spec.ok` does not go false for a failure in
        // just one of them: a story that rendered cleanly on Firefox and threw
        // on WebKit came back `ok: true`, and the aggregator counted the WebKit
        // failure as a pass. A quality feed that under-reports failures is worse
        // than no feed at all, so the per-test verdict is the one to trust.
        //
        //   expected → passed · unexpected → failed · flaky → passed on retry
        const raw = test.status ?? result?.status;
        const status =
          raw === "skipped" || result?.status === "skipped"
            ? "skip"
            : raw === "unexpected" || result?.status === "failed" || result?.status === "timedOut"
              ? "fail"
              : "pass";
        rows.push({
          title: spec.title,
          file: spec.file ?? suite.file,
          project: test.projectName ?? "",
          status,
          flaky: raw === "flaky",
          error: result?.error?.message,
          attachments: result?.attachments ?? [],
          // A screenshot with no committed baseline is not a regression — it is
          // an un-bootstrapped platform. Conflating the two would report the
          // whole gate as broken the first time it runs on a new OS.
          missingBaseline: Boolean(
            result?.error?.message &&
            /snapshot .*(doesn't exist|is missing)|A snapshot doesn't exist/i.test(
              result.error.message,
            ),
          ),
        });
      }
    }
  };
  (report.suites ?? []).forEach(walk);
  return rows;
}

/** Decode a JSON attachment written with `testInfo.attach`. */
export function readAttachment(attachments, name) {
  const found = attachments.find((a) => a.name === name);
  if (!found?.body) return undefined;
  try {
    return JSON.parse(Buffer.from(found.body, "base64").toString("utf8"));
  } catch {
    return undefined;
  }
}

/**
 * Roll a set of result rows into one status.
 *
 * `none` (no tests at all) is deliberately distinct from `pass`. Most components
 * start with no interaction spec, and a dashboard that paints "untested" green
 * is worse than no dashboard — it answers the question people are actually
 * asking ("is this covered?") with a confident lie.
 */
export function rollUp(rows, { blocking }) {
  if (!rows.length) return { status: "none" };

  const failed = rows.filter((r) => r.status === "fail" && !r.missingBaseline);
  const missing = rows.filter((r) => r.missingBaseline);
  const skipped = rows.filter((r) => r.status === "skip");
  const passed = rows.filter((r) => r.status === "pass");

  let status = "pass";
  if (failed.length) status = blocking ? "fail" : "warn";
  else if (missing.length && missing.length === rows.length - skipped.length) status = "none";
  else if (missing.length) status = "warn";

  return {
    status,
    total: rows.length,
    passed: passed.length,
    failed: failed.length,
    skipped: skipped.length,
    ...(missing.length ? { missingBaselines: missing.length } : {}),
    ...(rows.some((r) => r.flaky) ? { flaky: rows.filter((r) => r.flaky).length } : {}),
  };
}
