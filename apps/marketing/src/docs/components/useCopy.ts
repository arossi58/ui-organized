/**
 * "Copy" button state: fires the copy, flips the label, resets itself.
 *
 * Shared by every copy affordance in the docs kit (code blocks, the import line,
 * the AI context button) so they all report success and failure the same way —
 * including the failure case, which the app's older ad-hoc copy buttons swallow
 * and report as success.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { copyText } from "../../lib/clipboard";

export type CopyState = "idle" | "copied" | "failed";

export function useCopy(resetAfterMs = 1600): {
  state: CopyState;
  copy: (text: string) => Promise<void>;
} {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Clear on unmount so a copy right before navigating doesn't setState on a
  // gone component.
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      setState(ok ? "copied" : "failed");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { state, copy };
}

/** The label a copy button should show for a given state. */
export function copyLabel(state: CopyState, idle = "Copy"): string {
  if (state === "copied") return "Copied";
  if (state === "failed") return "Press ⌘C";
  return idle;
}
