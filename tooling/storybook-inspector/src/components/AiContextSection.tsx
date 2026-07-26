/**
 * "Copy for AI" inside the Inspector panel — format picker, size hint, and a
 * preview of exactly what will land on the clipboard.
 *
 * The preview is the point. This text goes straight into someone's coding agent,
 * and the same principle applies as the Figma plugin's "Preview Payload": a
 * human should be able to see what the agent will see before handing it over.
 */
import { useState } from "react";
import type { AiContextFormat } from "@ui-organized/code-connect/browser";
import { useAiContext } from "../hooks/useAiContext.js";
import { copyText } from "../copy.js";

const FORMATS: Array<{ id: AiContextFormat; label: string }> = [
  { id: "markdown", label: "Markdown" },
  { id: "jsx", label: "JSX" },
  { id: "prompt-url", label: "Prompt + URL" },
];

export function AiContextSection() {
  const [format, setFormat] = useState<AiContextFormat>("markdown");
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const { result, reason, loading } = useAiContext(format);

  if (loading) return <p className="fcp-empty">Loading manifest…</p>;
  if (!result) {
    return (
      <p className="fcp-empty">
        {reason ?? "No AI context available."} A context block built on a guess would be
        worse than none.
      </p>
    );
  }

  async function handleCopy() {
    const ok = await copyText(result!.text);
    setCopied(ok ? "ok" : "fail");
    setTimeout(() => setCopied("idle"), 1600);
  }

  return (
    <>
      <div className="fcp-args-head">
        <span className="fcp-ai-formats">
          {FORMATS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="fcp-link"
              data-active={String(format === option.id)}
              onClick={() => setFormat(option.id)}
            >
              {option.label}
            </button>
          ))}
        </span>
        <button type="button" className="fcp-link" onClick={() => void handleCopy()}>
          {copied === "ok" ? "Copied ✓" : copied === "fail" ? "Press ⌘C" : "⧉ Copy"}
        </button>
      </div>

      <p className="fcp-ai-meta">
        ≈{result.approxTokens.toLocaleString()} tokens · generated from the Code Connect
        manifest
      </p>

      <pre className="fcp-code fcp-ai-preview">{result.text}</pre>
    </>
  );
}
