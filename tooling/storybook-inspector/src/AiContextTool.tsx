/**
 * The toolbar button: one click copies the current component's AI context.
 *
 * Lives in the toolbar rather than only in the panel so it's reachable in a
 * single click from any story — including from a Docs page, where the Inspector
 * panel isn't shown at all (its `match` is story-view only).
 */
import { useState } from "react";
import { useAiContext } from "./hooks/useAiContext.js";
import { copyText } from "./copy.js";

export function AiContextTool() {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const { result, reason } = useAiContext("markdown");

  const disabled = !result;
  const label = state === "ok" ? "Copied ✓" : state === "fail" ? "Press ⌘C" : "Copy for AI";

  return (
    <button
      type="button"
      className="fcp-tool"
      disabled={disabled}
      title={
        result
          ? `Copy a verified context block (~${result.approxTokens} tokens) for this component`
          : (reason ?? "No verified manifest entry for this story")
      }
      onClick={async () => {
        if (!result) return;
        const ok = await copyText(result.text);
        setState(ok ? "ok" : "fail");
        setTimeout(() => setState("idle"), 1600);
      }}
    >
      ⧉ {label}
    </button>
  );
}
