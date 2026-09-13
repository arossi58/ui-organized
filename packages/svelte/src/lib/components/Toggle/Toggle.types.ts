import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ControlSize } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ArkForwardable } from "../../types.js";

/**
 * `disabled` is narrowed for the same reason `ArkForwardable` narrows `id`:
 * Svelte types it `boolean | null | undefined` and zag's toggle machine accepts
 * only `boolean | undefined`. It is not in `ArkForwardable` itself because most
 * parts this package forwards into are plain elements with no `disabled` at all,
 * and adding it there would invent the prop on their public API.
 */
export interface ToggleProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value" | "disabled">> {
  /** Whether the toggle should ignore user interaction. */
  disabled?: boolean;
  /** Whether the toggle is on (standalone usage). Bindable: `bind:pressed`. */
  pressed?: boolean;
  /** Initial pressed state for uncontrolled standalone usage. */
  defaultPressed?: boolean;
  /** Fired when the pressed state changes (standalone usage). */
  onPressedChange?: (pressed: boolean) => void;
  /** Identifies this toggle within a `<ToggleGroup>`; turns it into a group item. */
  value?: string;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
  class?: string;
  children?: Snippet;
}

export interface ToggleGroupProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  /** Pressed values. Bindable: `bind:value`. */
  value?: string[];
  /** Initial pressed values for uncontrolled usage. */
  defaultValue?: string[];
  /** Fired when the set of pressed values changes. */
  onValueChange?: (value: string[]) => void;
  /** Allow more than one toggle pressed at once. Defaults to single-select. */
  multiple?: boolean;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  class?: string;
  children?: Snippet;
}
