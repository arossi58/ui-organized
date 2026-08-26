import { DOCUMENT, DestroyRef, inject, signal, type Signal } from "@angular/core";

/**
 * Whether the primary pointer is coarse (touch).
 *
 * The date fields show the DS-styled calendar popover on fine pointers
 * (mouse/trackpad) and defer to the OS-native picker on touch devices, where the
 * native wheel/calendar is the better experience — and where a popover the size
 * of a month grid is not.
 *
 * Starts `false`, so the first render is the desktop path and corrects itself if
 * the query says otherwise. That matches the other three libraries, whose hook
 * starts `false` for SSR and updates on mount, and it is the safer default: the
 * popover path is the one that works on every device.
 *
 * `matchMedia` is guarded rather than assumed. It is missing in jsdom unless a
 * test provides it, and an unguarded call would make every field that uses this
 * un-instantiable in a spec.
 */
export function coarsePointer(): Signal<boolean> {
  const view = inject(DOCUMENT).defaultView;
  const coarse = signal(false);
  if (typeof view?.matchMedia !== "function") return coarse.asReadonly();

  const query = view.matchMedia("(pointer: coarse)");
  const update = () => coarse.set(query.matches);
  update();
  query.addEventListener?.("change", update);
  inject(DestroyRef).onDestroy(() => query.removeEventListener?.("change", update));
  return coarse.asReadonly();
}
