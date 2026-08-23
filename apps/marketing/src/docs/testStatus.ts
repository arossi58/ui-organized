/**
 * Per-component test results, for the docs pages and the /quality dashboard.
 *
 * Reads `manifest/test-status.json`, which `scripts/quality/aggregate.mjs`
 * writes from the five gates. Imported the same way the docs already read the
 * Code Connect manifest and the release dates — through Rollup's module graph,
 * so dev and build behave identically.
 *
 * The committed copy is a snapshot, so a local `vite build` renders something
 * real. CI regenerates it *before* building the marketing app, so a deployed
 * page always shows that run's own results rather than whatever was last
 * committed.
 */
import statusJson from "../../../../manifest/test-status.json";

/**
 * `none` and `not-run` are deliberately distinct, and neither is `pass`.
 *
 *   pass     ran, clean
 *   warn     ran, found something that does not block a merge
 *   fail     ran, found something that does
 *   none     no tests exist for this component in this gate
 *   skip     tests exist but did not apply here
 *   not-run  the gate did not run at all in this session
 *
 * Collapsing any of these into "pass" would answer "is this covered?" with a
 * confident lie, which is the one thing a quality dashboard must never do.
 */
export type GateStatus = "pass" | "warn" | "fail" | "none" | "skip" | "not-run";

export interface A11yViolation {
  id: string;
  impact?: string;
  help?: string;
  helpUrl?: string;
  nodes?: number;
}

export interface GateCheck {
  /** What was checked, in words — a story name or a behaviour. */
  name: string;
  status: GateStatus;
  /** Only present when the same check genuinely ran on more than one engine. */
  engines?: string[];
}

export interface GateResult {
  status: GateStatus;
  /** What this gate actually looked at — shown when a dashboard row expands. */
  checks?: GateCheck[];
  total?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
  missingBaselines?: number;
  flaky?: number;
  violations?: A11yViolation[];
  browsers?: Record<string, string>;
  errors?: number;
  warnings?: number;
  messages?: { source: string; rule?: string; line?: number; text: string }[];
  note?: string;
}

export interface ComponentTestStatus {
  name: string;
  category: string;
  visual: GateResult;
  interaction: GateResult;
  a11y: GateResult;
  tokens: GateResult;
  crossBrowser: GateResult;
}

/**
 * The repo-wide roll-up for one gate.
 *
 * Deliberately NOT `extends GateResult`. Both carry a `checks` field and they
 * mean different things: on a component it is the individual assertions that
 * ran, on the tokens gate it is the six sub-checks (eslint, stylelint, …) that
 * make it up. Sharing the name is fine; pretending they share a type is not.
 */
export interface GateSummary {
  status: GateStatus;
  label: string;
  blocking: boolean;
  total?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
  checks?: { name: string; status: string; detail?: string }[];
}

export interface TestStatus {
  generatedAt: string;
  commit?: string;
  branch?: string;
  runUrl?: string | null;
  gates: Record<GateKey, GateSummary>;
  components: Record<string, ComponentTestStatus>;
}

export type GateKey = "visual" | "interaction" | "a11y" | "tokens" | "crossBrowser";

/** Display order on the docs panel and the dashboard — cheapest signal first. */
export const GATE_ORDER: GateKey[] = ["visual", "interaction", "a11y", "tokens", "crossBrowser"];

export const GATE_LABELS: Record<GateKey, string> = {
  visual: "Visual",
  interaction: "Interaction",
  a11y: "Accessibility",
  tokens: "Tokens & lint",
  crossBrowser: "Cross-browser",
};

const status = statusJson as unknown as TestStatus;

export function testStatusFor(slug: string | undefined): ComponentTestStatus | undefined {
  if (!slug) return undefined;
  return status.components[slug];
}

/** Run provenance — which commit produced these numbers, and when. */
export function testStatusMeta() {
  return {
    generatedAt: status.generatedAt,
    commit: status.commit,
    branch: status.branch,
    runUrl: status.runUrl ?? undefined,
  };
}

export function allTestStatuses(): [string, ComponentTestStatus][] {
  return Object.entries(status.components);
}

export function gateSummaries(): [GateKey, GateSummary][] {
  return GATE_ORDER.map((key) => [key, status.gates[key]]);
}

/** The worst status across a component's gates — what the header chip shows. */
export function overallStatus(component: ComponentTestStatus): GateStatus {
  const order: GateStatus[] = ["fail", "warn", "not-run", "none", "skip", "pass"];
  for (const candidate of order) {
    if (GATE_ORDER.some((gate) => component[gate].status === candidate)) return candidate;
  }
  return "pass";
}

/** How long ago the run happened, for the panel footer. */
export function relativeTime(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 90) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
