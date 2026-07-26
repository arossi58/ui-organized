/**
 * Clipboard write with a fallback.
 *
 * The fallback is not optional: the manager runs inside Storybook's chrome,
 * which is frequently served over plain http on a LAN address during review, and
 * `navigator.clipboard` simply doesn't exist outside a secure context. Without
 * this, the copy button would silently do nothing and report success.
 *
 * `apps/marketing/src/lib/clipboard.ts` is the same routine for the docs site.
 * Not shared through a package: this is ~30 lines of DOM code, and the only
 * candidate home (`@ui-organized/utils`) is published — widening its public API
 * for two internal callers is the worse trade. Promote it if a third appears.
 */

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  try {
    area.select();
    area.setSelectionRange(0, area.value.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context — fall through.
  }
  return legacyCopy(text);
}
