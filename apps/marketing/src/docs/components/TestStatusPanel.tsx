/**
 * What automated testing knows about this component.
 *
 * Five gates, one row: visual regression, interaction, accessibility, tokens &
 * lint, and cross-browser rendering. Data comes from `manifest/test-status.json`
 * via `testStatusFor` — see `../testStatus`.
 *
 * This is deliberately NOT an extension of `StatusBadge`. That component is a
 * provenance *warning* and documents why it renders nothing when healthy: a
 * badge that is always there stops being read. This is the opposite kind of
 * surface — a named section a reader scrolls to in order to ask "is this
 * tested?", where the answer "yes, and here is how much" is the useful one. The
 * two are different questions and stay different components.
 *
 * It still renders nothing at all when there is no data for the component, for
 * the same reason: an empty section is better than a row of "unknown".
 */
import { Link } from "react-router-dom";
import { Alert, Tag } from "@ui-organized/react";
import {
  GATE_LABELS,
  GATE_ORDER,
  overallStatus,
  relativeTime,
  testStatusFor,
  testStatusMeta,
  type GateKey,
  type GateResult,
  type GateStatus,
} from "../testStatus";
import { StatusIcon } from "./StatusIcon";
import styles from "./testStatus.module.css";

const TAG_VARIANT = {
  pass: "success",
  warn: "caution",
  fail: "error",
  none: "info-secondary",
  skip: "info-secondary",
  "not-run": "info-secondary",
} as const;

const OVERALL_LABEL: Record<GateStatus, string> = {
  pass: "All checks passing",
  warn: "Passing with known issues",
  fail: "Checks failing",
  none: "Not covered",
  skip: "Not covered",
  "not-run": "Not run",
};

/**
 * One line of detail per gate. Says what actually happened rather than
 * restating the colour — "24 of 24 stories" is information; "passed" is not.
 */
function detail(gate: GateKey, result: GateResult): string {
  if (result.status === "not-run") return "gate did not run";
  if (result.status === "none") {
    return gate === "interaction" ? "no interaction tests yet" : "no results";
  }

  if (gate === "tokens") {
    if (result.status === "fail") {
      return `${result.errors ?? 0} lint error${result.errors === 1 ? "" : "s"}`;
    }
    return result.note ?? "clean";
  }

  if (gate === "crossBrowser" && result.browsers) {
    const engines = Object.entries(result.browsers);
    const bad = engines.filter(([, s]) => s !== "pass").map(([name]) => name);
    return bad.length ? `fails on ${bad.join(", ")}` : `${engines.map(([n]) => n).join(" · ")}`;
  }

  if (gate === "a11y" && result.violations?.length) {
    const nodes = result.violations.reduce((n, v) => n + (v.nodes ?? 0), 0);
    return `${result.violations.length} open issue${result.violations.length === 1 ? "" : "s"} (${nodes} node${nodes === 1 ? "" : "s"})`;
  }

  const total = result.total ?? 0;
  const passed = result.passed ?? 0;
  if (result.failed) return `${result.failed} of ${total} failing`;
  if (result.missingBaselines) return `${result.missingBaselines} baselines not yet recorded`;
  const skipped = result.skipped ? `, ${result.skipped} n/a` : "";
  return `${passed} of ${total} checks${skipped}`;
}

export function TestStatusPanel({ slug }: { slug: string }) {
  const component = testStatusFor(slug);
  // No data for this component: say nothing rather than five "unknown" chips.
  if (!component) return null;

  const meta = testStatusMeta();
  const openIssues = component.a11y.violations ?? [];

  return (
    <>
      <div className={styles.grid}>
        {GATE_ORDER.map((gate) => {
          const result = component[gate];
          return (
            <div key={gate} className={styles.cell} data-status={result.status}>
              <div className={styles.cellHead}>
                <span className={styles.cellLabel}>{GATE_LABELS[gate]}</span>
                <StatusIcon status={result.status} />
              </div>
              <span className={styles.cellValue}>{detail(gate, result)}</span>
            </div>
          );
        })}
      </div>

      {openIssues.length > 0 && (
        <Alert variant="warning" title="Known accessibility issues — recorded, not accepted">
          <ul className={styles.issueList}>
            {openIssues.map((violation) => (
              <li key={violation.id}>
                <code className={styles.issueRule}>{violation.id}</code>
                {violation.impact ? ` (${violation.impact})` : ""} — {violation.help}
                {violation.helpUrl && (
                  <>
                    {" "}
                    <a href={violation.helpUrl} target="_blank" rel="noreferrer">
                      how to fix
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* `Link`, not `<a href>`: the router is mounted with
          `basename={import.meta.env.BASE_URL}`, so a raw absolute href bypasses
          the deploy base and 404s anywhere the site is not served from the
          domain root — and forces a full document reload even when it works. */}
      <p className={styles.meta}>
        {meta.commit && (
          <>
            Run on <code>{meta.commit.slice(0, 7)}</code>
            {meta.branch ? ` (${meta.branch})` : ""} · {relativeTime(meta.generatedAt)}
          </>
        )}
        {meta.runUrl && (
          <>
            {" · "}
            <a href={meta.runUrl} target="_blank" rel="noreferrer">
              view the CI run
            </a>
          </>
        )}
        {" · "}
        <Link to="/docs/foundations/quality">all components</Link>
      </p>
    </>
  );
}

/** The overall verdict chip, for the section heading's `aside`. */
export function TestStatusChip({ slug }: { slug: string }) {
  const component = testStatusFor(slug);
  if (!component) return null;
  const overall = overallStatus(component);
  // `emphasized={false}` deliberately: the solid Tag style is the one with the
  // known AA contrast shortfall on its label (a palette decision recorded in the
  // a11y gate's ACCEPTED list). A quality badge that fails the contrast check is
  // not a good look on a page about quality checks.
  return (
    <Tag variant={TAG_VARIANT[overall]} size="sm" emphasized={false}>
      {OVERALL_LABEL[overall]}
    </Tag>
  );
}
