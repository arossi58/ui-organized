/**
 * Hand-authored usage guidance for one component — everything the docs site's
 * Usage tab renders, and the "when not to use" the AI context can't derive.
 *
 * Structured fields rather than a markdown blob, for two reasons. The docs site
 * renders these strings through `InlineMarkdown`, a deliberate non-parser
 * (inline code, bold, emphasis — nothing else), so a blob carrying its own
 * headings or bullets would print its own syntax. And structure is what makes
 * guidance checkable: a test can assert every component has a guide, that every
 * cross-reference resolves to a real component, and that no sentence names an
 * industry. None of that is possible against prose.
 *
 * Lives here rather than in the manifest because the manifest is machine-owned
 * — the scanner rewrites it from the type signatures on every run. It lives
 * here rather than in the Storybook CSF because `generate-ai-docs.ts` runs in
 * Node and cannot execute a CSF module, and this content has to reach the
 * static `/ai/<Component>.md` files. Nothing in this directory may import React
 * or anything with a DOM dependency.
 *
 * The editorial standard, which the shape can only half enforce: guidance is
 * about *decisions*, not about the API — the prop table is already generated,
 * complete and one tab away. And it must hold for any product in any industry,
 * because that is who the system is for. Name the job ("a destructive action"),
 * never the domain.
 */
import type { ComponentSlug } from "./slugs.js";

export interface UsageGuide {
  /** Docs-site slug, and this guide's key in `USAGE_GUIDES`. */
  slug: ComponentSlug;
  /**
   * The manifest `codeName` this guide describes.
   *
   * The bridge for `generate-ai-docs.ts`, which walks manifest entries and only
   * knows them by `codeName`. Slugs are derived from story titles, so the two
   * genuinely differ for some components — `navigation` is `NavItem`, `toast`
   * is `ToastProvider` — and deriving one from the other would silently drop
   * exactly those pages.
   */
  codeName: string;
  /**
   * What the component *is*, in terms of the job it does. 20–50 words.
   *
   * Not a restatement of the story description, which says what the API is
   * ("use `intent` to convey emphasis"). This says what the thing is for, so
   * someone choosing between two components can decide from this line alone.
   */
  summary: string;
  /** When to reach for it. Two to five entries, one decision each. */
  useWhen: string[];
  /**
   * When not to. Two to five entries — the half of the page that does the most
   * work in a system with this many confusable neighbours.
   */
  avoid: UsageAvoid[];
  /**
   * Best practices, stated as pairs. Two to five.
   *
   * The pair is the point: a "do" on its own reads as a platitude ("write clear
   * labels"), and it is the specific failure beside it that makes the rule
   * legible.
   */
  guidance: UsageContrast[];
  /**
   * What the component already handles, and what the consumer still owes it.
   * Both halves — one alone reads as either boasting or nagging.
   */
  accessibility: string[];
  /** Labelling and voice. Omitted for components that carry no copy. */
  content?: string[];
  /**
   * Neighbours worth knowing about, even where neither choice is wrong.
   * Distinct from `avoid`: that says "not this, that"; this says "these exist,
   * and here is the line between them".
   */
  related?: UsageAlternative[];
}

/** A case the component is wrong for, and — where one exists — what is right. */
export interface UsageAvoid {
  /** The case, phrased as a situation rather than as a scolding. */
  text: string;
  /**
   * Components to use instead, by slug. Resolved to names and links at render
   * time so a rename can't leave dead prose behind.
   *
   * Omit it when there is no component answer — then `text` has to say why the
   * pattern itself is wrong.
   */
  instead?: ComponentSlug[];
}

/** One rule, stated twice. */
export interface UsageContrast {
  /** The version that works. Imperative: "Give a surface one primary action". */
  do: string;
  /** The specific failure it prevents — not the negation of `do`. */
  dont: string;
  /**
   * Id of the live example pair that stages this rule, when the difference is
   * visible. The pairs live in the docs app (they are JSX; this file can't
   * hold them) keyed by component slug and this id.
   */
  example?: string;
}

/** "Reach for X when …" — the disambiguation line for a confusable neighbour. */
export interface UsageAlternative {
  slug: ComponentSlug;
  /** The condition that picks it over this component. */
  when: string;
}
