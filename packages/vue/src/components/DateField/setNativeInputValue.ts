/**
 * Set an input's value through the native value setter and dispatch an input
 * event, so a consumer's `@input` (or `v-model`) fires whether the field is
 * bound or not. Used when the calendar popover writes a date back to the field.
 *
 * The native setter is used rather than a plain `input.value = …` for the reason
 * React needs it: a framework that owns the value may have installed its own
 * `value` descriptor on the element, and writing through that descriptor is what
 * it treats as "the value changed by itself" rather than "a user typed". Going
 * through the prototype's setter writes the DOM value without telling the
 * framework, leaving the dispatched event as the one and only notification.
 */
export function setNativeInputValue(input: HTMLInputElement | null, value: string): void {
  if (!input) return;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
