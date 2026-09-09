import { Injectable, computed, signal, type Signal } from "@angular/core";
import { nextMachineId } from "../part-ids.js";

/**
 * The two parts a field's control describes itself by, in the order Ark lists
 * them: the error first, because it is the thing a screen reader should reach
 * before the advice that is still on screen behind it.
 */
export type FieldDescribedPart = "error-text" | "helper-text";

/**
 * The identity and state every part of a field reads.
 *
 * ── Why this exists at all ──────────────────────────────────────────────────
 *
 * Ark's Field is a machine that several sibling elements read from: the label
 * points its `for` at the control, the control describes itself by whichever of
 * the helper text and the error text is on screen, and validity, disabled and
 * read-only spread from the root to every part. React gets that through
 * context. Angular's equivalent is a provider on the element injector, so the
 * component that *owns* the field provides one of these and every part below it
 * injects it.
 *
 * Three components own one: `UioField`, whose parts the caller writes; and
 * `UioInput` and `UioTextArea`, which write their own parts but are the same
 * field underneath and so get the same ids, the same `aria-describedby` and the
 * same error pill for free.
 *
 * ── The one invariant ───────────────────────────────────────────────────────
 *
 * `describedBy` reads whichever parts have called {@link describe}, and those
 * calls happen once, when the part is constructed. That is correct because a
 * field's parts *remove themselves* from the DOM when they have nothing to show
 * — `HostPresence`, the same mechanism `Icon` and `FieldError` use — rather than
 * being created and destroyed by a surrounding `@if`. Visibility is a signal;
 * existence is not. A part wrapped in an `@if` by a caller would register too
 * late to be described, which is why the parts that can vanish take a message
 * rather than projected content.
 */
@Injectable()
export class UioFieldContext {
  /**
   * Ark builds every field id as `field:<machine>:<part>`. The literal value is
   * not the contract — React 18 produces `field:::r0:::label` — but the shape
   * is, and so is every relationship built out of it.
   */
  private readonly machine = nextMachineId();

  /**
   * Replaced wholesale by the owning component in its constructor, via
   * {@link bind}. Plain properties rather than writable signals kept in sync,
   * because a `set()` driven by an effect lands one change-detection pass late
   * and the field would render valid before it rendered invalid.
   */
  invalid: Signal<boolean> = signal(false);
  disabled: Signal<boolean> = signal(false);
  required: Signal<boolean> = signal(false);
  readOnly: Signal<boolean> = signal(false);

  private readonly present: Partial<Record<FieldDescribedPart, Signal<boolean>>> = {};

  /** Ark's root id has no part suffix. */
  get rootId(): string {
    return `field:${this.machine}`;
  }

  partId(part: string): string {
    return `field:${this.machine}:${part}`;
  }

  /**
   * The control's id, whether it is rendered as an `input` or a `textarea`.
   *
   * One id for both, so the label's `for` does not have to know which. Ark does
   * the same thing — its control carries the bare field id whatever tag it is —
   * and it is what lets `UioFieldLabel` serve a text box and a text area alike.
   */
  get controlId(): string {
    return this.partId("control");
  }

  /** Called by the owning component before any part of the field exists. */
  bind(state: {
    invalid: Signal<boolean>;
    disabled: Signal<boolean>;
    required: Signal<boolean>;
    readOnly: Signal<boolean>;
  }): void {
    this.invalid = state.invalid;
    this.disabled = state.disabled;
    this.required = state.required;
    this.readOnly = state.readOnly;
  }

  /** Told once per part, at construction. See the invariant above. */
  describe(part: FieldDescribedPart, present: Signal<boolean>): void {
    this.present[part] = present;
  }

  /**
   * `null` rather than an empty string when nothing is on screen: an
   * `aria-describedby=""` is a reference to nothing, and the gate compares the
   * attribute's presence.
   */
  readonly describedBy = computed(() => {
    const ids = (["error-text", "helper-text"] as const)
      .filter((part) => this.present[part]?.())
      .map((part) => this.partId(part));
    return ids.length ? ids.join(" ") : null;
  });
}
