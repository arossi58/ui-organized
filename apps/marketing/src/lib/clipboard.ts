/**
 * One clipboard helper for the whole app.
 *
 * There were five independent copy implementations before this (theme builder
 * export, palette swatches, palette export modal, the Figma plugin UI, the token
 * manager), and only two of them had the `execCommand` fallback. That fallback
 * is not optional here: the async Clipboard API is unavailable outside a secure
 * context, so a copy button that relies on it alone silently does nothing when
 * the site is opened over plain http on a LAN address — a failure with no error
 * and no visible symptom beyond "the button lied".
 */

/** Off-screen textarea + `execCommand`, for browsers without the async API. */
function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  // Off-screen rather than `display: none` — a hidden element can't be selected.
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.opacity = "0";
  document.body.appendChild(area);

  const selection = document.getSelection();
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  try {
    area.select();
    area.setSelectionRange(0, area.value.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
    // Restore whatever the user had selected before we hijacked it.
    if (previous && selection) {
      selection.removeAllRanges();
      selection.addRange(previous);
    }
  }
}

/** Copy `text`, resolving to whether it actually landed on the clipboard. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied, or no secure context — fall through rather than fail.
  }
  return legacyCopy(text);
}
