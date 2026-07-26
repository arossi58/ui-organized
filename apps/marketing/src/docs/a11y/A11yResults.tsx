/**
 * axe-core findings for the live preview, rendered directly under the component
 * they describe.
 *
 * Renders nothing until a scan has been run — the trigger lives in the preview
 * toolbar ({@link A11yRunButton}), so an untouched page stays quiet and axe-core
 * stays unloaded.
 */
import { Button } from "@ui-organized/react";
import type { ImpactValue, Result } from "axe-core";
import type { A11yScan } from "./useA11yScan";
import styles from "./a11y.module.css";

const IMPACT_ORDER: ImpactValue[] = ["critical", "serious", "moderate", "minor"];

function severity(result: Result): number {
  const index = IMPACT_ORDER.indexOf(result.impact ?? "minor");
  return index === -1 ? IMPACT_ORDER.length : index;
}

/** The trigger, for the preview's toolbar. */
export function A11yRunButton({ scan }: { scan: A11yScan }) {
  const running = scan.status === "running";
  return (
    <Button
      intent="ghost"
      size="sm"
      icon={running ? "loader" : "check-circle"}
      disabled={running}
      title="Run axe-core against the live preview"
      onClick={() => void scan.run()}
    >
      {running ? "Checking…" : scan.status === "idle" ? "Check accessibility" : "Re-check"}
    </Button>
  );
}

export function A11yResults({ scan }: { scan: A11yScan }) {
  const { status, results, error, dismiss } = scan;
  const open = status !== "idle";

  const violations = [...(results?.violations ?? [])].sort((a, b) => severity(a) - severity(b));
  const incomplete = results?.incomplete ?? [];

  const dismissButton = (
    <Button
      className={styles.dismiss}
      intent="ghost"
      size="sm"
      icon="close"
      aria-label="Close accessibility results"
      onClick={dismiss}
    />
  );

  // The wrapper stays mounted so the reveal has something to transition FROM —
  // a node that appears and disappears can't animate its own height. The
  // `0fr → 1fr` grid row is what gives a real height transition without
  // measuring the content.
  return (
    <div className={styles.reveal} data-open={open || undefined} aria-hidden={!open}>
      <div className={styles.revealInner}>
        {open && (
          <div className={styles.root}>
            {status === "error" ? (
              <div className={styles.summary}>
                <p className={styles.error}>Couldn't run the accessibility check: {error}</p>
                {dismissButton}
              </div>
            ) : (
              <>
                <div className={styles.summary}>
                  <span className={styles.count} data-tone={violations.length ? "bad" : "good"}>
                    {violations.length} {violations.length === 1 ? "violation" : "violations"}
                  </span>
                  {incomplete.length > 0 && (
                    <span className={styles.count} data-tone="warn">
                      {incomplete.length} needs review
                    </span>
                  )}
                  {dismissButton}
                </div>

                {status === "done" && violations.length === 0 && incomplete.length === 0 && (
                  <p className={styles.pass}>
                    No accessibility violations detected in this preview.
                  </p>
                )}

                <ResultList results={violations} tone="bad" />
                <ResultList results={incomplete} tone="warn" heading="Needs manual review" />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultList({
  results,
  tone,
  heading,
}: {
  results: Result[];
  tone: "bad" | "warn";
  heading?: string;
}) {
  if (results.length === 0) return null;
  return (
    <>
      {heading && <h4 className={styles.listHeading}>{heading}</h4>}
      <ul className={styles.list}>
        {results.map((result) => (
          <li className={styles.item} key={result.id} data-tone={tone}>
            <div className={styles.itemHead}>
              <span className={styles.impact} data-impact={result.impact ?? "minor"}>
                {result.impact ?? "minor"}
              </span>
              <span className={styles.itemTitle}>{result.help}</span>
              <span className={styles.itemCount}>
                {result.nodes.length} {result.nodes.length === 1 ? "element" : "elements"}
              </span>
            </div>
            <p className={styles.itemBody}>{result.description}</p>
            {result.nodes.slice(0, 3).map((node, i) => (
              <pre className={styles.selector} key={i}>
                {node.target.join(" ")}
              </pre>
            ))}
            <a href={result.helpUrl} target="_blank" rel="noreferrer" className={styles.itemLink}>
              How to fix ({result.id}) ↗
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
