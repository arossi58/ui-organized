/**
 * Open the browser's native date/time picker for an input.
 *
 * `showPicker()` must run inside a user gesture and throws if it is unsupported
 * or blocked — both cases are swallowed, so this stays a pure enhancement: the
 * input remains fully typeable and the native on-focus picker keeps working.
 */
export function openDatePicker(input: HTMLInputElement | null): void {
  if (!input || input.disabled) return;
  try {
    input.showPicker();
  } catch {
    /* no-op — unsupported or blocked; typed entry still works. */
  }
}
