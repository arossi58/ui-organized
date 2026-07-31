/**
 * Opening the overlay an inspected element belongs to.
 *
 * Half the interesting DOM in a component library only exists while something is
 * open — a dialog's body, a select's listbox, a menu's items. The inspector
 * lists those elements whether or not they're showing, so selecting one has to
 * be able to bring it into view; otherwise the panel describes a box the reader
 * cannot see.
 *
 * The link between the two is ARIA, which every Ark trigger already publishes:
 * the trigger's `aria-controls` names the content's `id`. So walk up from the
 * element to the first ancestor some trigger points at, and click that trigger
 * if it reports itself closed. No component-specific knowledge, and it works the
 * same whether the overlay was portalled to `<body>` (Storybook's preview) or
 * rendered in place (the docs site's contained preview).
 */

/**
 * Find the trigger that opens the overlay a given part belongs to.
 *
 * ARIA alone isn't enough. A combobox points `aria-controls` at its *input*, and
 * clicking an input opens nothing; a closed tooltip publishes no relationship at
 * all, because `aria-describedby` is only wired up while it's showing.
 *
 * What is reliable is the id scheme every zag-backed component shares:
 * `<scope>::<uid>::<part>`. Two parts of the same instance share everything up
 * to the last segment, so the trigger for `dialog::r4::content` is the element
 * with id `dialog::r4::trigger`. That's exact, needs no per-component knowledge,
 * and it finds triggers ARIA doesn't name.
 */
const SCOPE_ID = /^(.*::)[^:]+$/;

/** Overlays that open on pointer/focus, not on click — clicking toggles them shut. */
const HOVER_SCOPES = new Set(["tooltip", "hover-card"]);

type How = "click" | "hover" | "contextmenu";

function howToOpen(id: string, el: HTMLElement): How {
  // A context menu has no ordinary trigger — it opens on right-click, and the
  // pointer position is also what anchors it. Nothing else can place it.
  if (el.getAttribute("data-part") === "context-trigger") return "contextmenu";
  return HOVER_SCOPES.has(id.split(":")[0] ?? "") ? "hover" : "click";
}

function triggerFor(doc: Document, id: string): { el: HTMLElement; how: How } | null {
  const scope = SCOPE_ID.exec(id)?.[1];

  if (scope) {
    const escaped = scope.replace(/"/g, '\\"');
    const el =
      doc.querySelector<HTMLElement>(`[id="${escaped}trigger"]`) ??
      doc.querySelector<HTMLElement>(`[id^="${escaped}"][data-part$="trigger"]`);
    if (el) return { el, how: howToOpen(id, el) };
  }

  // Anything not following the scheme: fall back to what ARIA does say.
  const escapedId = id.replace(/"/g, '\\"');
  const controls = Array.from(doc.querySelectorAll<HTMLElement>(`[aria-controls="${escapedId}"]`));
  const viaAria =
    controls.find((el) => el.getAttribute("data-part")?.endsWith("trigger")) ??
    controls.find((el) => el.tagName === "BUTTON") ??
    controls[0] ??
    doc.querySelector<HTMLElement>(`[aria-describedby="${escapedId}"]`);
  return viaAria ? { el: viaAria, how: howToOpen(id, viaAria) } : null;
}

/** Right-click at the trigger's centre, which both opens and anchors the menu. */
function rightClick(el: HTMLElement): void {
  const r = el.getBoundingClientRect();
  el.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: Math.round(r.x + r.width / 2),
      clientY: Math.round(r.y + r.height / 2),
    }),
  );
}

/** Drive a hover-opened overlay the way a pointer would. */
function hover(el: HTMLElement): void {
  for (const type of ["pointerover", "pointerenter", "pointermove", "mouseover", "mouseenter"]) {
    el.dispatchEvent(new Event(type, { bubbles: type.startsWith("pointero") || type === "mouseover" }));
  }
  el.focus();
}

/** Is this part of an overlay currently shut? */
function isShut(el: Element): boolean {
  return el.getAttribute("data-state") === "closed" || el.hasAttribute("hidden");
}

/**
 * Press a trigger the way a person does.
 *
 * `el.click()` alone is not equivalent: some controls act on `pointerdown` and
 * others on `click`, and an accordion's trigger ignores a bare synthetic click
 * entirely. So send the pointer sequence first, then check whether that was
 * enough — clicking a control that already opened on `pointerdown` would toggle
 * it straight back shut.
 */
function press(el: HTMLElement, part: Element): void {
  el.focus?.();
  const init = { bubbles: true, cancelable: true, composed: true, detail: 1 } as const;
  const Pointer = typeof PointerEvent === "function" ? PointerEvent : MouseEvent;
  el.dispatchEvent(new Pointer("pointerdown", init));
  el.dispatchEvent(new MouseEvent("mousedown", init));
  el.dispatchEvent(new Pointer("pointerup", init));
  el.dispatchEvent(new MouseEvent("mouseup", init));
  if (isShut(part)) el.click();
}

/** Opens the overlay containing `el`. Returns whether it acted. */
export function openOverlayFor(doc: Document, el: Element | null): boolean {
  if (!el) return false;
  let node: Element | null = el;
  while (node && node !== doc.body) {
    // Only a part that reports itself shut is worth opening. Walking past an
    // open one matters for nesting — a menu item inside an open menu inside a
    // closed dialog should still open the dialog.
    const shut = node.getAttribute("data-state") === "closed" || node.hasAttribute("hidden");
    if (node.id && shut) {
      const trigger = triggerFor(doc, node.id);
      if (trigger) {
        if (trigger.how === "click") press(trigger.el, node);
        else if (trigger.how === "contextmenu") rightClick(trigger.el);
        else hover(trigger.el);
        return true;
      }
    }
    node = node.parentElement;
  }

  // Nothing shut above it. A wrapper can sit *outside* the part that carries the
  // closed state — a date picker's positioner holds the closed calendar rather
  // than being closed itself — so look down too before giving up.
  const inner = el.querySelector<HTMLElement>('[id][data-state="closed"], [id][hidden]');
  if (inner) {
    const trigger = triggerFor(doc, inner.id);
    if (trigger) {
      if (trigger.how === "click") press(trigger.el, inner);
      else if (trigger.how === "contextmenu") rightClick(trigger.el);
      else hover(trigger.el);
      return true;
    }
  }
  return false;
}

/** Whether an element is currently rendered — a closed overlay part is not. */
export function isRendered(el: Element): boolean {
  return !!(el as HTMLElement).offsetParent || el.getClientRects().length > 0;
}
