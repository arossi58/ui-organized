import { useEffect, useState } from "react";

/**
 * Whether the primary input is a coarse pointer (touch).
 *
 * The date pickers show the DS-styled calendar popover on fine pointers
 * (mouse/trackpad) but defer to the OS-native picker on touch devices, where
 * the native wheel/calendar is the better experience. Starts `false` so SSR and
 * the first paint render the desktop (popover) path, then corrects on mount.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return coarse;
}
