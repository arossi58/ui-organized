/**
 * "Copy for AI" — the button this whole feature exists for.
 *
 * Three ghost buttons, one per format, each copying straight to the clipboard.
 * There used to be a split button with a format picker and a live preview of the
 * payload; the preview is gone because it answered a question nobody is asking
 * at this point in the page — the reader already knows what the component is,
 * they just want its spec on the clipboard. The preview still exists where it
 * earns its place: the Storybook Inspector panel, where you're inspecting rather
 * than reading.
 *
 * Formats, shortest to longest:
 *   Prompt + URL — one line pointing at the published spec, for agents that fetch
 *   JSX          — just the snippet for what's on screen
 *   AI spec      — the full block: rules, import, every prop and allowed value
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@ui-organized/react";
import type { AiContextFormat, Staleness } from "@ui-organized/code-connect/browser";
import { copyText } from "../../lib/clipboard";
import type { DocsComponent } from "../registry";
import { aiContextFor } from "./aiContextInput";
import styles from "./ai.module.css";

const FORMATS: Array<{ id: AiContextFormat; label: string; title: string }> = [
  {
    id: "markdown",
    label: "AI spec",
    title:
      "Copy the complete verified context: rules, exact import, every prop with its allowed values, and real examples. Paste into Cursor, Claude Code, or any chat.",
  },
  {
    id: "jsx",
    label: "JSX",
    title: "Copy just the snippet for what's currently on screen.",
  },
  {
    id: "prompt-url",
    label: "Prompt + URL",
    title:
      "Copy a one-line prompt pointing at the published spec. It is the smallest form, and it can never go stale.",
  },
];

interface CopyAiContextProps {
  component: DocsComponent;
  staleness?: Staleness;
  /** Current control values, when rendered on the Inspect view. */
  liveArgs?: Record<string, unknown>;
  storybookUrl?: string;
}

export function CopyAiContext({
  component,
  staleness,
  liveArgs,
  storybookUrl,
}: CopyAiContextProps) {
  const [copied, setCopied] = useState<AiContextFormat | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleCopy(format: AiContextFormat) {
    const result = aiContextFor(component, format, { staleness, liveArgs, storybookUrl });
    if (!result) return;
    await copyText(result.text);
    setCopied(format);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1600);
  }

  // No verified manifest entry means no verified prop list — and a context block
  // built on a guess is worse than none at all.
  if (!component.entry) {
    return (
      <span className={styles.unavailable} title="No verified manifest entry matched this story.">
        AI context unavailable
      </span>
    );
  }

  return (
    <span className={styles.group}>
      {FORMATS.map((format) => (
        <Button
          key={format.id}
          intent="ghost"
          size="sm"
          icon={copied === format.id ? "check" : "copy"}
          title={format.title}
          onClick={() => void handleCopy(format.id)}
        >
          {copied === format.id ? "Copied" : format.label}
        </Button>
      ))}
    </span>
  );
}
