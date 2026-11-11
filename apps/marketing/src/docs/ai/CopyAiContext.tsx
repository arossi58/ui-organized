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
 *
 * All three follow the framework switcher. On the Vue tab they copy the Vue
 * import, Vue markup and the Vue spec's URL; where a library doesn't ship the
 * component they say so instead of copying React under its name.
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@ui-organized/react";
import {
  FRAMEWORK_INFO,
  type AiContextFormat,
  type DocFramework,
  type Staleness,
} from "@ui-organized/code-connect/browser";
import { copyText } from "../../lib/clipboard";
import { useDocsFramework } from "../frameworks";
import { targetFor } from "../frameworks/surfaces";
import type { DocsComponent } from "../registry";
import { aiContextFor } from "./aiContextInput";
import { useFrameworkManifest } from "./frameworkManifests";
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
    // Relabelled per framework below: only React's snippet is JSX.
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
  const { framework } = useDocsFramework();
  // That library's own props, so the copy matches its published spec.
  const frameworkManifest = useFrameworkManifest(framework);
  const [copied, setCopied] = useState<AiContextFormat | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);
  // A "Copied" left over from the React tab would read as having copied Vue.
  useEffect(() => setCopied(null), [framework]);

  async function handleCopy(format: AiContextFormat) {
    const result = aiContextFor(component, format, {
      framework,
      staleness,
      liveArgs,
      storybookUrl,
      frameworkManifest,
    });
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

  const { label } = FRAMEWORK_INFO[framework];
  if (framework !== "react" && !targetFor(framework, component.entry.codeName)) {
    return (
      <span
        className={styles.unavailable}
        title={`${FRAMEWORK_INFO[framework].packageName} doesn't ship ${component.name}, so there is no ${label} spec to copy.`}
      >
        No {label} version
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
          {copied === format.id ? "Copied" : labelFor(format.id, format.label, framework)}
        </Button>
      ))}
    </span>
  );
}

function labelFor(id: AiContextFormat, label: string, framework: DocFramework): string {
  if (id !== "jsx" || framework === "react") return label;
  return framework === "angular" ? "Template" : FRAMEWORK_INFO[framework].label;
}
