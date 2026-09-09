/**
 * Written out in full rather than extending a shared base: `svelte-package`
 * emits no `.d.ts` for props whose type extends an interface it cannot see, and
 * it fails silently — the build succeeds and consumers get `any`.
 */

export interface TourStepAction {
  /** Button text. */
  label: string;
  /** What the button does. Defaults to 'next'. */
  action?: "next" | "prev" | "dismiss" | "skip";
}

export interface TourStep {
  /** Unique id across the tour. This is what `stepId` names. */
  id: string;
  /**
   * Step heading.
   *
   * A plain string rather than a snippet: the machine hands this straight to
   * Ark's Title part as its content, and a snippet would arrive there as a
   * function and render as nothing.
   */
  title: string;
  /** Step body copy. A plain string, for the same reason as `title`. */
  description: string;
  /**
   * Returns the element to highlight. Omit it for a centred step with no
   * target, which the machine treats as a modal `dialog` step.
   */
  target?: () => HTMLElement | null;
  /**
   * How the step is presented. `tooltip` anchors to the target, `dialog`
   * centres, `floating` sits unanchored, `wait` pauses for an app event.
   * Inferred from `target` when omitted.
   */
  type?: "tooltip" | "dialog" | "wait" | "floating";
  /** Where the card sits relative to its target. */
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Buttons in the card's action row. Defaults to Back and Next. */
  actions?: TourStepAction[];
  /** Dims the rest of the page behind this step. Defaults to true. */
  backdrop?: boolean;
  /** Points an arrow at the target. Defaults to true for anchored steps. */
  arrow?: boolean;
}

export interface TourProps {
  /** The steps, in order. */
  steps: TourStep[];
  /**
   * The step to show, by id. Set it to a step's id to open the tour there, and
   * to another id to jump.
   *
   * Opening and navigating are controlled; **closing is not**. The machine
   * exposes no programmatic close, so setting this back to `null` does not shut
   * the tour — people close it with the card's close button, Escape, or a
   * `dismiss` action, and that arrives as `onStepChange(null)`. Keep this prop
   * wired to that callback and the two stay in step.
   *
   * Open it *after* mount. The effect that drives the machine runs on the
   * client, so opening on an anchored step during the first render measures a
   * null target: the spotlight collapses and the card is parked off-screen.
   * Opening from a click is always safe.
   */
  stepId: string | null;
  /**
   * Called with the new step id whenever the tour advances, and with `null` when
   * it closes. Wire this to whatever state feeds `stepId`.
   */
  onStepChange?: (stepId: string | null) => void;
  /** Corner radius of the spotlight cutout, in pixels. Defaults to 4. */
  spotlightRadius?: number;
  /** Blocks interaction with the page behind the tour. Defaults to false. */
  preventInteraction?: boolean;
  /** Closes when clicking outside the card. Defaults to true. */
  closeOnInteractOutside?: boolean;
  /** Closes on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Card treatment. `compact` tightens the padding. Defaults to 'default'. */
  variant?: "default" | "compact";
  /** Shows the "step N of M" counter. Defaults to true. */
  showProgress?: boolean;
  class?: string;
}
