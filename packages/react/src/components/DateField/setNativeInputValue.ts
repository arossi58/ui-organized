/**
 * Set an input's value through the native value setter and dispatch an input
 * event, so React's `onChange` fires for both controlled and uncontrolled
 * inputs. Used when the calendar popover writes a date back to the field.
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
