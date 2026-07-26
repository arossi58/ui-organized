/**
 * The anti-hallucination prose for `ai-context.ts` (Connect.md §6.4, §7.2).
 *
 * Split out from the renderer on purpose: this wording gets tuned by hand as we
 * observe real agents failing in real ways, and those diffs should be readable
 * without layout logic mixed in.
 *
 * Every rule here earns its place by preventing a specific, observed failure. If
 * you add one, name the failure it stops — context length is not free, and a rule
 * that stops nothing dilutes the ones that do.
 */

import type { ComponentManifestEntry } from "./schema.js";

/**
 * Design-token families a component may legitimately be positioned with. We list
 * the families rather than dumping every token: an agent that knows the shape
 * `var(--color-…)` will look one up, whereas 3,000 tokens of values crowd out the
 * prop table it actually needs.
 */
// Verified against packages/tokens/output/variables.css — note the spacing family
// is `--spacing-space-*`, NOT `--space-*`. Naming a family that doesn't exist
// would have an agent emit `var(--space-04)`, which resolves to nothing: exactly
// the confident-but-wrong output this document is here to prevent.
export const TOKEN_FAMILIES = [
  "var(--color-…)",
  "var(--spacing-space-…)",
  "var(--border-radius-…)",
  "var(--type-size-…)",
] as const;

/**
 * Derived, component-specific warnings. Nothing here is stored in the manifest —
 * it's all computed from the entry's own prop set, so it stays correct as the
 * code changes and costs no authoring.
 *
 * `customInstructions` is the place for guidance that genuinely cannot be derived.
 */
export function derivePropHints(entry: ComponentManifestEntry): string[] {
  const names = new Set(entry.props.map((p) => p.name));
  const hints: string[] = [];

  // The single most common miss: agents reach for shadcn/MUI's `variant` on
  // components whose emphasis axis is named `intent`, and vice versa.
  if (names.has("intent") && !names.has("variant")) {
    hints.push("`variant` is NOT a prop of this component — the emphasis axis is `intent`.");
  } else if (names.has("variant") && !names.has("intent")) {
    hints.push("`intent` is NOT a prop of this component — the emphasis axis is `variant`.");
  }

  // `icon` takes a canonical NAME, not an element. Agents habitually pass
  // `icon={<Trash />}` because that's the react-icons / lucide convention.
  const icon = entry.props.find((p) => p.name === "icon");
  if (icon && !/ReactNode|ReactElement|ComponentType|JSX\.Element/.test(icon.type)) {
    hints.push(
      "`icon` takes an icon NAME string from the list below, not a React element — " +
        "never `icon={<SomeIcon />}`.",
    );
  }

  return hints;
}

/**
 * The rules block, rendered before any data.
 *
 * Order matters: an agent that reads the prop table first is already anchored on
 * its priors about what a "Button" looks like, and a constraint arriving after
 * that anchor is much weaker than one arriving before it.
 */
export function globalRules(packageName: string, hints: string[]): string[] {
  const propRule =
    "The props table below is this component's COMPLETE own API. If a prop you want " +
    "is not listed, it does not exist — do not invent it and do not rename one." +
    (hints.length ? ` ${hints.join(" ")}` : "");

  return [
    `Import ONLY from \`${packageName}\`. Never from a relative path, \`shadcn/ui\`, ` +
      "`@/components/ui/*`, or any other library. Never re-declare or re-implement " +
      "this component.",
    propRule,
    "Union props are closed sets. A value not listed below is invalid.",
    "Do not style this component with utility classes, hex colors, or px literals. " +
      "Vary it with its props. If extra layout is genuinely required, use design " +
      `tokens only — ${TOKEN_FAMILIES.map((t) => `\`${t}\``).join(", ")}.`,
    "Do not wrap or fork this component to add a variant.",
    "If the design needs something this component cannot express, say so — do not " +
      "approximate it with custom markup.",
  ];
}

/**
 * Why this exists: the scanner reads a component's OWN declared members and
 * deliberately skips inherited DOM attributes (scan-react.ts), so `children`,
 * `onClick`, `disabled` and `className` are absent from `props` for most entries.
 * Without this note an agent reads the table as exhaustive and refuses to attach
 * a click handler — a failure mode that reads as the component being broken.
 *
 * Kept element-agnostic: the manifest doesn't record which HTML element a
 * component extends, and inventing one here would be exactly the kind of
 * confident-but-unverified claim this whole document exists to prevent.
 */
export const PASSTHROUGH_NOTE =
  "Beyond the props above, this component forwards the standard React props of its " +
  "underlying element — `children`, `className`, `id`, `style`, `ref`, its native " +
  "event handlers (`onClick`, `onChange`, …), and `aria-*` / `data-*` attributes. " +
  "Those are the ONLY additions; they do not extend the variant API above.";

/** Repeated at the very end — recency matters as much as primacy. */
export const CLOSING_RULE =
  "If you need a prop, a value, or a component that is not in this document, stop " +
  "and ask — do not invent one.";

/** Scoping note added to rule 2 for compound components. */
export const COMPOUND_SCOPE_NOTE =
  "The props table applies to the root component only. Its subcomponents are layout " +
  "containers that take `children` plus standard element attributes — do not pass " +
  "the root's variant props to them.";
