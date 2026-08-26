/**
 * Which open surface an Escape or a click outside belongs to.
 *
 * ── Why the CDK's own answer is the wrong one here ──────────────────────────
 *
 * `OverlayRef.keydownEvents()` routes a keypress to the **most recently
 * attached** overlay, and `outsidePointerEvents()` fires for every attached
 * overlay at once. Both are correct for the CDK's model, where an overlay is
 * attached when it opens. This library's overlays are attached when their
 * component initialises and stay attached while closed, because that is what Ark
 * does and what the shared stylesheet's exit transitions need — so "most
 * recently attached" is page order, and Escape inside a select that was declared
 * before its dialog would close the dialog.
 *
 * So openness is tracked here instead, as a stack, which is also how zag does it
 * (`--layer-index` / `--nested-layer-count` are that stack, rendered). The top of
 * the stack — the surface opened last — is the only one an Escape or an outside
 * click can reach. A select opened inside a dialog therefore closes itself and
 * leaves the dialog alone, and a second Escape closes the dialog.
 */
export interface DismissibleLayer {
  /** The surface a pointer may land in without dismissing it. */
  surface(): HTMLElement | null;
  /**
   * The element that opens it, which is *also* not "outside".
   *
   * Without this a click on an open surface's trigger dismisses it here and
   * re-opens it in the trigger's own click handler, so the surface never closes.
   */
  trigger(): HTMLElement | null;
  dismiss(reason: "escape" | "interact-outside"): void;
}

const stack: DismissibleLayer[] = [];
let listening: Document | null = null;

function top(): DismissibleLayer | undefined {
  return stack[stack.length - 1];
}

function contains(element: HTMLElement | null, target: EventTarget | null): boolean {
  return !!element && target instanceof Node && element.contains(target);
}

function onKeydown(event: KeyboardEvent): void {
  // Not `event.key === "Esc"`: that is IE's spelling and nothing this library
  // supports emits it. `defaultPrevented` lets a surface handle its own Escape
  // first — a combobox clearing its query, say — without also closing.
  if (event.key !== "Escape" || event.defaultPrevented) return;
  const layer = top();
  if (!layer) return;
  event.preventDefault();
  layer.dismiss("escape");
}

/**
 * Capture phase, unlike the keydown above.
 *
 * A pointer that lands outside has to be recognised before whatever it landed
 * on gets to stop the event — a `pointerdown` handler on a card that calls
 * `stopPropagation()` would otherwise leave every menu on the page open.
 */
function onPointerDown(event: PointerEvent): void {
  const layer = top();
  if (!layer) return;
  const target = event.target;
  if (contains(layer.surface(), target) || contains(layer.trigger(), target)) return;
  layer.dismiss("interact-outside");
}

function listen(document: Document): void {
  if (listening) return;
  listening = document;
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onPointerDown, true);
}

function stopListening(): void {
  if (!listening) return;
  listening.removeEventListener("keydown", onKeydown);
  listening.removeEventListener("pointerdown", onPointerDown, true);
  listening = null;
}

/** Called when a surface opens. Idempotent, so a re-open cannot stack twice. */
export function pushLayer(document: Document, layer: DismissibleLayer): void {
  removeLayer(layer);
  stack.push(layer);
  listen(document);
}

/** Called when a surface closes *or is destroyed*, so a leak cannot outlive it. */
export function removeLayer(layer: DismissibleLayer): void {
  const index = stack.indexOf(layer);
  if (index !== -1) stack.splice(index, 1);
  if (!stack.length) stopListening();
}

/** Exported for `overlay.spec.ts`: nothing else should need to know the depth. */
export function openLayerCount(): number {
  return stack.length;
}
