/**
 * Hiding the rest of the page from assistive technology while a modal dialog is
 * open, and putting it back.
 *
 * ── What has to be reproduced ───────────────────────────────────────────────
 *
 * `aria-modal="true"` on the dialog is not enough on its own — support for it is
 * uneven, and every headless library still marks the siblings. Zag does it with
 * `@zag-js/aria-hidden`, which walks up from the dialog and marks the siblings
 * at every level, leaving `aria-hidden="true"` and its own `data-aria-hidden`
 * marker on each. Both attributes are part of the rendered contract: the parity
 * gate compares `#mount` itself, and a Select rendered inside a dialog is
 * compared *with* the marks a dialog left on its positioner.
 *
 * ── Why it is not a straight port of that walk ──────────────────────────────
 *
 * In the other three libraries a portalled surface is a child of `document.body`,
 * so walking up from the dialog reaches its siblings directly. The CDK puts two
 * elements in between — one `.cdk-overlay-container` for every overlay on the
 * page, and inside it a `popover` host and a `.cdk-overlay-pane` per surface —
 * so the same walk would mark a *pane*, and the positioner inside it would carry
 * no marks at all. The subtree would be hidden either way; the rendered contract
 * would not match, and the gate compares the positioner.
 *
 * So the set is named directly instead: everything in the body except the
 * overlay container, plus every surface inside the container that is not this
 * dialog's own. That is exactly the set zag's walk produces, addressed by what
 * the elements *are* rather than by where the CDK happened to put them.
 */

const MARKER = "data-aria-hidden";

/** What an element's `aria-hidden` was before, so it can be given back. */
interface Mark {
  element: HTMLElement;
  previous: string | null;
}

function markable(element: Element): element is HTMLElement {
  return element instanceof element.ownerDocument.defaultView!.HTMLElement;
}

function hide(element: HTMLElement, marks: Mark[]): void {
  // Already marked by an outer dialog: leave it, and leave its saved value
  // alone. Restoring the inner dialog first would otherwise un-hide the page
  // while the outer one is still open.
  if (element.hasAttribute(MARKER)) return;
  marks.push({ element, previous: element.getAttribute("aria-hidden") });
  element.setAttribute("aria-hidden", "true");
  element.setAttribute(MARKER, "");
}

/**
 * Hide everything that is not `keep` — the dialog's own positioner — and return
 * the undo.
 *
 * The dialog's backdrop is deliberately *not* excluded: it is a sibling of the
 * positioner inside the same pane, it is decoration, and Ark marks it too.
 */
export function hideOthersFrom(keep: HTMLElement): () => void {
  const document = keep.ownerDocument;
  const marks: Mark[] = [];

  for (const child of Array.from(document.body.children)) {
    // The overlay container holds the dialog itself; it is handled surface by
    // surface below. Scripts and styles are not in the accessibility tree.
    if (!markable(child) || child.contains(keep)) continue;
    if (child.tagName === "SCRIPT" || child.tagName === "STYLE") continue;
    hide(child, marks);
  }

  /**
   * The elements that *are* body children in the other three libraries: the
   * positioner of every other overlay, and this dialog's own backdrop. Named by
   * their part rather than by depth, because the CDK's scaffolding is not always
   * the same depth — a surface rendered from a component portal has its own host
   * element between the pane and the positioner.
   */
  const SURFACES = '[data-part="positioner"], [data-part="backdrop"]';
  for (const surface of Array.from(
    document.querySelectorAll(`.cdk-overlay-container ${SURFACES}`),
  )) {
    if (!markable(surface) || surface === keep || surface.contains(keep)) continue;
    hide(surface, marks);
  }

  return () => {
    for (const { element, previous } of marks) {
      element.removeAttribute(MARKER);
      if (previous === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", previous);
    }
    marks.length = 0;
  };
}
