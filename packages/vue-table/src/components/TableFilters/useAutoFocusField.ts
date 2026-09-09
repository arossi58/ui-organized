import { watch, type Ref } from "vue";

/**
 * Put focus in the first typeable field of a popover once it opens.
 *
 * The pattern analysis is explicit about this — "enable autofocus … it's
 * possible for the user to start typing right away" — and the obvious spelling,
 * an `autofocus` attribute, does not work here: Ark moves focus into the popover
 * content *after* mount, so the attribute is overwritten and focus lands on a
 * button.
 *
 * **Two** frames, not one. A single frame is not enough: a focus trace in the
 * React adapter showed this landing correctly and then Ark's `Select` trigger
 * taking focus one millisecond later, because the operator picker is the first
 * focusable child. Waiting a second frame puts this last, which is the only
 * thing that sticks — and it is Ark's behaviour, not React's, so it is the same
 * here.
 *
 * Deliberately only an `<input>`: a text, number, date or search field is
 * something you type into immediately. An enum list without a search box has
 * nothing to type into, so its focus is left exactly where Ark put it.
 */
export function useAutoFocusField(container: Ref<HTMLElement | null>, open: Ref<boolean>): void {
  watch(
    [container, open],
    ([element, isOpen], _old, onCleanup) => {
      if (!isOpen || !element || typeof requestAnimationFrame !== "function") return;
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          const field = element.querySelector<HTMLInputElement>(
            'input:not([type="hidden"]):not([disabled])',
          );
          field?.focus();
          field?.select();
        });
      });
      onCleanup(() => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      });
    },
    { immediate: true },
  );
}

/**
 * Focus has to land somewhere deliberate when a chip disappears, or it falls to
 * `<body>` and a keyboard user loses their place entirely.
 */
export function focusAfterRemoval(removedId: string): void {
  if (typeof requestAnimationFrame !== "function") return;
  requestAnimationFrame(() => {
    const bar = document.querySelector(".data-table__filters");
    if (!bar) return;
    const triggers = [...bar.querySelectorAll<HTMLElement>("[data-filter-id]")];
    const next = triggers.find((element) => element.dataset.filterId !== removedId);
    (next ?? bar.querySelector<HTMLElement>("button"))?.focus();
  });
}
