/**
 * Whether the primary input is a coarse pointer (touch).
 *
 * The date pickers show the DS-styled calendar popover on fine pointers
 * (mouse/trackpad) but defer to the OS-native picker on touch devices, where the
 * native wheel/calendar is the better experience. Starts `false` so SSR and the
 * first paint render the desktop (popover) path, then corrects on mount — the
 * same starting point React uses, which is also what keeps the two libraries'
 * server-rendered markup identical.
 *
 * Returns an accessor rather than a value: a bare `boolean` would be read once
 * at initialisation and never see the media query resolve.
 */
export function useCoarsePointer(): () => boolean {
  let coarse = $state(false);
  $effect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => (coarse = mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  });
  return () => coarse;
}
