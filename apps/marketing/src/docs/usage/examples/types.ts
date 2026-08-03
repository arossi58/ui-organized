/**
 * Live do/don't pairs for the Usage tab.
 *
 * The guidance prose lives in `@ui-organized/code-connect/usage` and is
 * deliberately free of React so the AI-docs generator can read it from Node.
 * These are the halves that can only be JSX: the real component, rendered twice,
 * once right and once wrong. A `UsageContrast.example` id joins the two, and
 * `usage.test.ts` asserts the ids match in both directions — a rule that claims
 * an example it doesn't have, or an example no rule points at, fails the build.
 *
 * Keep each side to the smallest arrangement that makes the difference visible.
 * Both halves sit in a card roughly 340px wide on a laptop and narrower on a
 * phone; if the point needs more room than that, it belongs in a text-only pair.
 */
import type { ReactNode } from "react";
import type { PreviewLayout } from "../../registry";

export interface UsageExamplePair {
  /** The arrangement the rule asks for. */
  Do: () => ReactNode;
  /** The failure it prevents — rendered inert, see `UsageGuidanceGrid`. */
  Dont: () => ReactNode;
  /** Defaults to `centered`, the right frame for a small control or two. */
  layout?: PreviewLayout;
  /**
   * Render overlays inside the card instead of over the window — for anything
   * that portals (Dialog, Sheet, Menu, Select's listbox, Toast).
   */
  containOverlays?: boolean;
  /**
   * Leave the "don't" side focusable and clickable.
   *
   * Off by default: a deliberately-wrong pattern shouldn't sit in the tab order,
   * and its known violations shouldn't become this page's accessibility
   * findings. Set it only where the failure is invisible until you interact with
   * it, and make sure the arrangement is not itself an accessibility defect.
   */
  interactiveDont?: boolean;
}

/** One component's pairs, keyed by `UsageContrast.example`. */
export type UsageExampleSet = Record<string, UsageExamplePair>;
