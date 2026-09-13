import { onMounted, onUnmounted, ref, type Ref } from "vue";

/**
 * Whether the primary input is a coarse pointer (touch).
 *
 * The date pickers show the DS-styled calendar popover on fine pointers
 * (mouse/trackpad) but defer to the OS-native picker on touch devices, where the
 * native wheel/calendar is the better experience. Starts `false` so SSR and the
 * first paint render the desktop (popover) path, then corrects on mount — which
 * is also what keeps this library's server-rendered markup identical to React's.
 *
 * The media query is created in `onMounted` rather than in setup: setup runs on
 * the server too, where there is no `window` to ask.
 */
export function useCoarsePointer(): Ref<boolean> {
  const coarse = ref(false);
  let mq: MediaQueryList | null = null;
  const update = () => {
    if (mq) coarse.value = mq.matches;
  };
  onMounted(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    mq = window.matchMedia("(pointer: coarse)");
    update();
    mq.addEventListener?.("change", update);
  });
  onUnmounted(() => mq?.removeEventListener?.("change", update));
  return coarse;
}
