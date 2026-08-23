import { Directive, signal, type Signal } from "@angular/core";

/**
 * The base every Angular part extends, and the reason the Angular library can
 * share a stylesheet with three libraries that do not exist in Angular.
 *
 * ── What it is for ──────────────────────────────────────────────────────────
 *
 * Almost all of the interactive styling in `@ui-organized/core` keys off
 * attributes a Zag state machine writes — `[data-state="open"]`,
 * `[data-highlighted]`, `[data-disabled]`, `[data-invalid]`. React, Svelte and
 * Vue get them free: Zag emits them and the component spreads its props. Angular
 * has no Zag, so every one of them is hand-written, and a missed attribute is
 * not an error. It is a control that renders perfectly and never shows that it
 * is disabled.
 *
 * So the whole vocabulary is declared once, here, and bound on every part. A
 * part that never reports `hover` emits nothing — `null` removes the attribute —
 * but the binding exists, which turns "nobody thought about hover" into a
 * visible omission rather than an absence with no shape.
 *
 * The names and the *shape* of the values are Zag's, not ours: a boolean is
 * written as presence (`data-disabled=""`), never `="true"`, because the
 * stylesheet selects on `[data-disabled]`. `stateFlag` is the only correct way
 * to produce one. See `state-contract.json` in `@ui-organized/core` for the
 * derived list of what the CSS actually reads.
 *
 * ── How a part uses it ──────────────────────────────────────────────────────
 *
 * Subclasses declare `scope` and `part`, and *replace* whichever signals they
 * can report — usually with an `input()` or a `computed()`:
 *
 * ```ts
 * @Component({ selector: "uio-switch", ... })
 * export class UioSwitch extends UioPart {
 *   readonly scope = "switch";
 *   readonly part = "root";
 *   override readonly disabled = input(false);
 *   override readonly state = computed(() => (this.checked() ? "checked" : "unchecked"));
 * }
 * ```
 *
 * Replacing a base field only works because this package compiles with
 * `useDefineForClassFields: false`. With the flag on, a subclass field
 * initialiser runs *after* the base constructor and overwrites the base's value
 * with `undefined` at the moment the host binding reads it.
 */

/**
 * A boolean state attribute, in Zag's spelling: present and empty when true,
 * absent when false.
 *
 * `="true"`/`="false"` would be the natural Angular thing to write and is wrong
 * both ways round — `[data-disabled]` matches `="false"` too, so a disabled
 * style would apply to every enabled control.
 */
export function stateFlag(value: boolean | undefined | null): "" | null {
  return value ? "" : null;
}

/**
 * Every attribute `UioPart` can emit.
 *
 * Exported so `part.spec.ts` can hold it against what the base actually renders,
 * and against the state contract derived from the stylesheets — an attribute
 * bound here that no CSS reads is dead weight, and one the CSS reads that is not
 * bound here is a gap with a name.
 */
export const UIO_PART_ATTRIBUTES = [
  "data-scope",
  "data-part",
  "data-state",
  "data-disabled",
  "data-invalid",
  "data-readonly",
  "data-focus",
  "data-focus-visible",
  "data-hover",
  "data-highlighted",
  "data-selected",
  "data-orientation",
] as const;

@Directive({
  host: {
    "[attr.data-scope]": "scope",
    "[attr.data-part]": "part",
    "[attr.data-state]": "state()",
    "[attr.data-disabled]": "flag(disabled())",
    "[attr.data-invalid]": "flag(invalid())",
    "[attr.data-readonly]": "flag(readOnly())",
    "[attr.data-focus]": "flag(focus())",
    "[attr.data-focus-visible]": "flag(focusVisible())",
    "[attr.data-hover]": "flag(hover())",
    "[attr.data-highlighted]": "flag(highlighted())",
    "[attr.data-selected]": "flag(selected())",
    "[attr.data-orientation]": "orientation()",
  },
})
export abstract class UioPart {
  /** Zag's machine name — `"dialog"`, `"select"`. Fixed per component. */
  abstract readonly scope: string;
  /** Zag's part name — `"root"`, `"trigger"`, `"content"`. Fixed per element. */
  abstract readonly part: string;

  /** The machine's own state word: `"open"`, `"closed"`, `"checked"`, … */
  readonly state: Signal<string | null> = signal(null);
  readonly disabled: Signal<boolean> = signal(false);
  readonly invalid: Signal<boolean> = signal(false);
  readonly readOnly: Signal<boolean> = signal(false);
  readonly focus: Signal<boolean> = signal(false);
  readonly focusVisible: Signal<boolean> = signal(false);
  readonly hover: Signal<boolean> = signal(false);
  readonly highlighted: Signal<boolean> = signal(false);
  readonly selected: Signal<boolean> = signal(false);
  readonly orientation: Signal<"horizontal" | "vertical" | null> = signal(null);

  /** Template-visible so the host bindings above can use it. */
  protected readonly flag = stateFlag;
}
