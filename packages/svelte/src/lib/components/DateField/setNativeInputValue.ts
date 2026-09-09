/**
 * Set an input's value through the native value setter and dispatch an input
 * event, so a consumer's `oninput` fires whether they bound the value or not.
 * Used when the calendar popover writes a date back to the field.
 *
 * The native setter is used rather than a plain `input.value = …` for the same
 * reason React needs it: a framework that owns the value has already installed
 * its own `value` descriptor on the element, and assigning through that
 * descriptor is what the framework treats as "the value changed by itself"
 * rather than "a user typed". Going through the prototype's setter writes the
 * DOM value without telling the framework, and the dispatched event is then the
 * only notification — which is exactly one notification, not two.
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
