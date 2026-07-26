/**
 * Provenance warnings for a component page — shown ONLY when something is wrong.
 *
 * A healthy page renders nothing at all. "verified · in sync" on all 45 pages is
 * noise: it's the default state, it says nothing a reader can act on, and badges
 * that are always present stop being read — which is exactly what would make the
 * rare "unverified" or "props changed" badge get skimmed past too.
 *
 * What it still guarantees is the thing that matters: a page whose prop table
 * and AI context block are built on an unresolved or drifted mapping says so,
 * loudly. Silence here means verified and in sync, and nothing else.
 */
import type { Staleness } from "@ui-organized/code-connect/browser";
import type { DocsComponent } from "../registry";
import styles from "./content.module.css";

type Tone = "ok" | "warn" | "info" | "error";

function Badge({ tone, children, title }: { tone: Tone; children: string; title?: string }) {
  return (
    <span className={styles.badge} data-tone={tone} title={title}>
      {children}
    </span>
  );
}

export function StatusBadge({
  component,
  staleness,
}: {
  component: DocsComponent;
  staleness?: Staleness;
}) {
  const { entry, codeName } = component;

  if (!entry) {
    return (
      <span className={styles.badges}>
        <Badge tone="warn" title="No manifest entry matched this story, so no verified prop list exists.">
          unverified
        </Badge>
      </span>
    );
  }

  const stale = staleness?.isStale ?? false;
  const deprecated = entry.status === "deprecated";

  // Verified, in sync, current — nothing worth a reader's attention.
  if (!stale && !deprecated) return null;

  return (
    <span className={styles.badges}>
      {stale && (
        <Badge
          tone="warn"
          title={
            staleness?.changedProps?.length
              ? `Changed since last sync: ${staleness.changedProps.join(", ")}`
              : `${codeName}'s props have changed in the code since this mapping was synced (${entry.lastSyncedAt}). Re-run the scanner.`
          }
        >
          props changed
        </Badge>
      )}

      {deprecated && (
        <Badge tone="error" title="This component is deprecated — prefer a current one.">
          deprecated
        </Badge>
      )}
    </span>
  );
}
