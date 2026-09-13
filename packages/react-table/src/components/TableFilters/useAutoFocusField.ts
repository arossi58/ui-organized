import { useEffect } from "react";

/**
 * Put focus in the first typeable field of a popover once it opens.
 *
 * The pattern analysis is explicit about this — "enable autofocus … it's
 * possible for the user to start typing right away" — and the obvious spelling,
 * `autoFocus`, does not work here: Ark moves focus into the popover content
 * *after* mount, so the attribute is overwritten and focus lands on a button.
 * (It is also a `jsx-a11y/no-autofocus` warning for a use that was doing
 * nothing.)
 *
 * **Two** frames, not one. A single frame is not enough: a focus trace shows
 * this landing correctly and then Ark's `Select` trigger taking focus one
 * millisecond later, because the operator picker is the first focusable child.
 * Waiting a second frame puts this last, which is the only thing that sticks.
 *
 * Deliberately only an `<input>`: a text, number, date or search field is
 * something you type into immediately. An enum list without a search box has
 * nothing to type into, so its focus is left exactly where Ark put it.
 */
export function useAutoFocusField(container: HTMLElement | null, open: boolean): void {
  useEffect(() => {
    if (!open || !container) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const field = container.querySelector<HTMLInputElement>(
          'input:not([type="hidden"]):not([disabled])',
        );
        field?.focus();
        field?.select();
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [container, open]);
}
