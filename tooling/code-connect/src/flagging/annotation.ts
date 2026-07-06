/**
 * Layer 2 — agent self-flagging in generated code (Connect.md §7.2).
 *
 * When an agent uses a component from a `get_component_context` result whose
 * confidence is below `exact`, or whose mapping is stale, it must annotate the
 * usage inline so the uncertainty survives into the diff — not just the chat. This
 * module is the single source of truth for (a) whether an annotation is required
 * and (b) exactly what it should say, so the emitter and the Layer 4 verifier agree
 * on the format. Pure — safe in the browser bundle too.
 */

import type { Confidence } from "./../schema.js";

/** Substring present in every Code Connect annotation — how Layer 4 detects one. */
export const ANNOTATION_MARKER = "CODE CONNECT";

export interface AnnotationInput {
  /** The code symbol used, e.g. `CardHeader`. */
  codeName: string;
  confidence: Confidence;
  isStale?: boolean;
  /** Figma node name, if known, for traceability. */
  figmaNodeName?: string;
  /** Prop names that drifted, when stale. */
  changedProps?: string[];
  /** Free-text reason, e.g. "matched by name similarity (0.78)". */
  reason?: string;
}

/**
 * Whether a usage MUST carry an annotation: anything below `exact` confidence, or a
 * stale mapping (§7.2). An exact, current mapping needs none.
 */
export function needsAnnotation(confidence: Confidence, isStale = false): boolean {
  return confidence !== "exact" || isStale;
}

/** The inline comment block to place immediately above the usage (§7.2). */
export function buildAnnotation(input: AnnotationInput): string {
  const { codeName, confidence, isStale, figmaNodeName, changedProps, reason } = input;
  const flags = [`confidence: ${confidence}`];
  if (isStale) flags.push("stale");

  const headline =
    confidence === "none"
      ? "NO VERIFIED MAPPING"
      : isStale
        ? "STALE COMPONENT MAPPING"
        : "UNVERIFIED COMPONENT MAPPING";

  const lines = [`⚠️ ${ANNOTATION_MARKER} — ${headline} (${flags.join(", ")})`];
  const node = figmaNodeName ? `Figma node "${figmaNodeName}" → ${codeName}` : codeName;
  if (confidence === "none") {
    lines.push(`${node}: no manifest match. Do not merge without confirming the component.`);
  } else if (isStale) {
    const changed = changedProps?.length ? ` (changed: ${changedProps.join(", ")})` : "";
    lines.push(`${node}: mapping has drifted from source${changed}. Verify props before merging.`);
  } else {
    lines.push(`${node}: ${reason ?? "matched by name similarity only"}. Prop mapping not confirmed — verify before merging.`);
  }

  return lines.map((l) => `// ${l}`).join("\n");
}

/** Does the given leading text already contain a Code Connect annotation? */
export function hasAnnotation(leadingText: string): boolean {
  return leadingText.includes(ANNOTATION_MARKER);
}
