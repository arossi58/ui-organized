/**
 * Foundations → Quality.
 *
 * Every component against every gate, on one page. The Quality section on a
 * component's own docs page answers "is this one verified?"; this answers the
 * question you can only ask across the whole system — where is coverage thin,
 * and what is the open accessibility debt?
 *
 * Data is `manifest/test-status.json`, written by `scripts/quality/aggregate.mjs`
 * from the five gates. CI regenerates it before building this app, so a deployed
 * page shows the results of the run that built it.
 */
import { Fragment, useId, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Icon } from "@ui-organized/react";
import { DocsPageHeader, DocsProse, DocsSection, StatusIcon } from "../components";
import {
  GATE_LABELS,
  GATE_ORDER,
  allTestStatuses,
  gateSummaries,
  relativeTime,
  testStatusMeta,
  type ComponentTestStatus,
  type GateKey,
  type GateResult,
  type GateStatus,
} from "../testStatus";
import styles from "../components/testStatus.module.css";

/** Spelled out for assistive tech — the glyph alone is decoration. */
const STATUS_LABEL: Record<GateStatus, string> = {
  pass: "passing",
  warn: "passing with known issues",
  fail: "failing",
  none: "not covered",
  skip: "not applicable",
  "not-run": "not run",
};

/**
 * How many individual checks to name before collapsing to a count.
 *
 * ColorPicker alone carries 45 — its OKLCH parsing suite is thorough — and
 * listing every one turns a table row into a page. The first dozen say what the
 * gate covers, which is the question being asked.
 */
const CHECKS_SHOWN = 12;

/** One gate's worth of detail inside an expanded row. */
function GateDetail({ gate, result }: { gate: GateKey; result: GateResult }) {
  const checks = result.checks ?? [];
  // Failures first: if something is wrong, it should not be below the fold of a
  // 12-item list sorted alphabetically.
  const ordered = [...checks].sort((a, b) => {
    const rank = (s: GateStatus) => (s === "fail" ? 0 : s === "warn" ? 1 : 2);
    return rank(a.status) - rank(b.status) || a.name.localeCompare(b.name);
  });
  const shown = ordered.slice(0, CHECKS_SHOWN);
  const hidden = ordered.length - shown.length;

  return (
    <div className={styles.detailGate}>
      <p className={styles.detailHead}>
        <StatusIcon status={result.status} />
        {GATE_LABELS[gate]}
      </p>

      <p className={styles.detailSummary}>{summarise(gate, result)}</p>

      {/* The open accessibility issues are the point of the panel for a11y —
          named, with the rule and a link to the fix, not just a count. */}
      {result.violations?.map((violation) => (
        <p key={violation.id} className={styles.detailIssue}>
          <code>{violation.id}</code>
          {violation.impact ? ` (${violation.impact})` : ""} — {violation.help}
          {violation.nodes
            ? ` · ${violation.nodes} element${violation.nodes === 1 ? "" : "s"}`
            : ""}
          {violation.helpUrl && (
            <>
              {" "}
              <a href={violation.helpUrl} target="_blank" rel="noreferrer">
                how to fix
              </a>
            </>
          )}
        </p>
      ))}

      {result.messages?.map((message, i) => (
        <p key={i} className={styles.detailIssue}>
          <code>{message.rule ?? message.source}</code> — {message.text}
          {message.line ? ` (line ${message.line})` : ""}
        </p>
      ))}

      {shown.length > 0 && (
        <ul className={styles.checkList}>
          {shown.map((check) => (
            <li key={check.name}>
              <StatusIcon status={check.status} size={13} />
              <span>
                {check.name}
                {check.engines && (
                  <span className={styles.checkEngines}> · {check.engines.join(", ")}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && <p className={styles.checkMore}>and {hidden} more</p>}
    </div>
  );
}

/** A plain-language line saying what this gate did for this component. */
function summarise(gate: GateKey, result: GateResult): string {
  if (result.status === "not-run") return "This gate did not run.";
  if (result.status === "none") {
    return gate === "interaction"
      ? "No interaction tests have been written for this component yet."
      : "No results for this component.";
  }

  const ran = (result.total ?? 0) - (result.skipped ?? 0);
  switch (gate) {
    case "visual":
      return `${ran} story screenshot${ran === 1 ? "" : "s"} compared against a committed baseline.`;
    case "interaction":
      return `${ran} behaviour check${ran === 1 ? "" : "s"} driven through a real browser.`;
    case "a11y":
      return `${ran} story scan${ran === 1 ? "" : "s"} with axe-core.`;
    case "frameworkA11y": {
      // The count is libraries, not scans: this gate audits each of Svelte, Vue
      // and Angular against React's own axe result at the same scenario, so what
      // a reader wants is how many libraries were checked and whether any of
      // them introduced something React does not have.
      const libraries = result.checks?.length ?? 0;
      const shared = result.shared
        ? ` ${result.shared} violation${result.shared === 1 ? "" : "s"} React has too are counted separately.`
        : "";
      return (
        `${libraries} librar${libraries === 1 ? "y" : "ies"} compared against React's ` +
        `accessibility at the same scenario.${shared}`
      );
    }
    case "frameworkVisual":
      return (
        `${ran} scenario${ran === 1 ? "" : "s"} screenshotted in each library and ` +
        `compared against React's in the same run.`
      );
    case "crossBrowser":
      return `${ran} story render${ran === 1 ? "" : "s"} checked for console errors on Firefox and WebKit.`;
    case "tokens":
      return result.status === "pass"
        ? "No lint, stylelint or token-contract problems in this component's source."
        : `${result.errors ?? 0} problem${result.errors === 1 ? "" : "s"} in this component's source.`;
  }
}

/** One table row, with its expandable detail panel. */
function ComponentRow({ slug, component }: { slug: string; component: ComponentTestStatus }) {
  const [open, setOpen] = useState(false);
  const panelId = `${useId()}-detail`;

  return (
    <Fragment>
      <tr>
        <td>
          <button
            type="button"
            className={styles.rowToggle}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name="chevron-down" size={16} className={styles.rowChevron} />
            <span>
              <span className={styles.componentLink}>{component.name}</span>
              <span className={styles.category}>{component.category}</span>
            </span>
          </button>
        </td>
        {GATE_ORDER.map((gate) => {
          const result = component[gate];
          return (
            <td key={gate}>
              <StatusIcon status={result.status} />{" "}
              <span className={styles.cellValue}>
                {STATUS_LABEL[result.status]}
                {gate === "a11y" && result.violations?.length
                  ? ` (${result.violations.length})`
                  : ""}
              </span>
            </td>
          );
        })}
      </tr>

      {open && (
        <tr className={styles.detailRow}>
          <td colSpan={GATE_ORDER.length + 1} id={panelId}>
            <div className={styles.detail}>
              {GATE_ORDER.map((gate) => (
                <GateDetail key={gate} gate={gate} result={component[gate]} />
              ))}
              <p className={styles.detailFoot}>
                <Link to={`/docs/${slug}`}>Open the {component.name} page</Link>
              </p>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export function FoundationsQualityPage() {
  const meta = testStatusMeta();
  const components = allTestStatuses();
  const gates = gateSummaries();

  const openIssues = components.reduce((n, [, c]) => n + (c.a11y.violations?.length ?? 0), 0);

  return (
    <>
      <DocsPageHeader
        title="Quality"
        lede="Every component is checked five ways on each pull request. Here is what those checks found."
      />

      <DocsProse>
        {/* Repo-wide totals first: the table below is for looking something up,
            this is for knowing whether anything is on fire. */}
        <DocsSection
          title="Gates"
          subtitle={
            <>
              Run the whole suite locally with <code>pnpm quality</code>, or any one gate with{" "}
              <code>pnpm quality:visual</code>, <code>:interaction</code>, <code>:a11y</code>,{" "}
              <code>:lint</code>, <code>:browsers</code>.
            </>
          }
        >
          <div className={styles.grid}>
            {gates.map(([key, summary]) => (
              <div key={key} className={styles.cell} data-status={summary.status}>
                <div className={styles.cellHead}>
                  <span className={styles.cellLabel}>{GATE_LABELS[key]}</span>
                  <StatusIcon status={summary.status} size={18} />
                </div>
                <span className={styles.cellValue}>
                  {summary.total != null
                    ? `${summary.passed ?? 0} of ${summary.total} checks`
                    : `${(summary.checks ?? []).filter((c) => c.status === "pass").length} of ${
                        (summary.checks ?? []).length
                      } checks`}
                </span>
              </div>
            ))}
          </div>

          {openIssues > 0 && (
            <Alert
              variant="warning"
              title={`${openIssues} open accessibility issue${openIssues === 1 ? "" : "s"} across the library`}
            >
              Recorded in <code>apps/storybook/a11y/known-violations.json</code> so the gate can
              block <em>new</em> regressions while the existing ones are worked down. They are open
              bugs, not accepted exceptions — the file should only ever shrink.
            </Alert>
          )}
        </DocsSection>

        <DocsSection title="Components">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                Automated test results for every component, by gate
              </caption>
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  {GATE_ORDER.map((gate) => (
                    <th key={gate} scope="col">
                      {GATE_LABELS[gate]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {components.map(([slug, component]) => (
                  <ComponentRow key={slug} slug={slug} component={component} />
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.meta} style={{ marginTop: "var(--spacing-space-05)" }}>
            {meta.commit && (
              <>
                Generated from <code>{meta.commit.slice(0, 7)}</code>
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
          </p>
        </DocsSection>
      </DocsProse>
    </>
  );
}
