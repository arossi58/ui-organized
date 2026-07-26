/**
 * Runs axe-core against the live preview.
 *
 * Split out from the results UI so the trigger can sit in the preview's toolbar,
 * beside the vision filter, while the findings render under the component —
 * the control next to what it acts on, the output next to what it describes.
 *
 * axe-core is ~170 KB gzipped, so it is imported dynamically on the first run
 * and must never land in the docs route chunk: most visitors are reading prop
 * tables, not auditing contrast.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { AxeResults } from "axe-core";

export type A11yStatus = "idle" | "running" | "done" | "error";

export interface A11yScan {
  status: A11yStatus;
  results: AxeResults | null;
  error: string | null;
  run: () => Promise<void>;
  /** Close the readout and stop re-scanning until it's run again. */
  dismiss: () => void;
}

export function useA11yScan(
  target: RefObject<HTMLElement | null>,
  /** Bump to re-run after the preview changes. */
  revision: unknown,
): A11yScan {
  const [status, setStatus] = useState<A11yStatus>("idle");
  const [results, setResults] = useState<AxeResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const run = useCallback(async () => {
    const element = target.current;
    if (!element) return;

    const id = ++runId.current;
    setStatus("running");
    setError(null);
    try {
      const axe = (await import("axe-core")).default;
      const outcome = await axe.run(element, { resultTypes: ["violations", "incomplete"] });
      // A control can move while axe is still loading; only the newest run wins.
      if (id !== runId.current) return;
      setResults(outcome);
      setStatus("done");
    } catch (cause) {
      if (id !== runId.current) return;
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus("error");
    }
  }, [target]);

  const dismiss = useCallback(() => {
    // Bumping the run id discards any in-flight scan, so a result that lands
    // after the user closed the panel can't reopen it.
    runId.current++;
    setStatus("idle");
    setResults(null);
    setError(null);
  }, []);

  // Re-run when the preview changes, but only once it's been run at least
  // once — `idle` means axe has never been loaded, and we keep it that way.
  // Dismissing returns to `idle`, so it also stops the re-scanning.
  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => void run(), 150);
    return () => clearTimeout(timer);
    // `status` is deliberately omitted: including it would re-run on every
    // status transition, including the ones this effect itself causes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, run]);

  return { status, results, error, run, dismiss };
}
