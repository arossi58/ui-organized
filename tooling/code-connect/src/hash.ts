/**
 * Prop-signature hashing (Connect.md §3 critical rule, §8).
 *
 * The scanner (from real code) and the plugin (for staleness checks) MUST compute
 * this identically, so the canonical serialization is defined once, here, and
 * imported by both. Any divergence silently breaks staleness detection.
 *
 * Canonical form: the signature-bearing fields of each prop (name, type, required,
 * defaultValue) sorted by name, stable-stringified. `description` and
 * `figmaVariantMapping` are deliberately excluded — they're human/plugin
 * annotations, not part of the code signature, so re-documenting or re-mapping a
 * prop must not read as a code drift.
 */

import { createHash } from "node:crypto";
import type { PropDefinition } from "./schema.js";

/** The subset of a prop that defines its code signature. */
function signatureShape(p: PropDefinition): [string, string, boolean, string] {
  return [p.name, p.type, p.required, p.defaultValue ?? ""];
}

/** Deterministic, reproducible hash of a component's prop set. */
export function hashProps(props: PropDefinition[]): string {
  const canonical = [...props]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(signatureShape);
  const h = createHash("sha256");
  h.update(JSON.stringify(canonical));
  return `sha256:${h.digest("hex").slice(0, 16)}`;
}
