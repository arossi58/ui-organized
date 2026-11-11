import { useEffect } from "react";
import { trackFocusModality } from "@ui-organized/core/focus-modality";

/**
 * Starts core's pointer-vs-keyboard tracker on mount. The text fields' focus
 * styles read it to show a quiet border after a click and the full ring after
 * Tab. Idempotent, so every field can call it.
 */
export function useFocusModality(): void {
  useEffect(() => trackFocusModality(), []);
}
