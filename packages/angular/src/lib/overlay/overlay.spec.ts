import { describe, it, expect, afterEach } from "vitest";
import { anchoredPositions, sideOf, toPlacement } from "./anchor.js";
import { hideOthersFrom } from "./aria-hidden.js";
import { openLayerCount, pushLayer, removeLayer, type DismissibleLayer } from "./dismiss.js";
import { firstEnabled, inDomOrder, moveHighlight } from "./roving.js";

/**
 * The parts of an overlay that have no DOM to compare.
 *
 * The browser parity gate checks that four libraries render the same tree. What
 * it cannot check is *why* — which placement was asked for, which layer an
 * Escape belongs to, which option an arrow key lands on. Each of those is a pure
 * function here, and each of them is a silent failure when it is wrong: a menu
 * that highlights a disabled item looks perfect and does nothing.
 */

describe("placement", () => {
  it("spells a centred placement as the bare side, the way zag does", () => {
    // `bottom-center` is not a placement floating-ui knows, and Ark reflects
    // whatever it resolved onto `data-placement` — so an invented spelling would
    // reach the stylesheet.
    expect(toPlacement("bottom", "center")).toBe("bottom");
    expect(toPlacement("bottom", "start")).toBe("bottom-start");
    expect(sideOf("bottom-start")).toBe("bottom");
    expect(sideOf("left")).toBe("left");
  });

  it("offers the opposite side before the perpendicular ones", () => {
    // floating-ui flips before it falls back to another axis, and the parity
    // harness renders its trigger at the top of the viewport — so a tooltip
    // asking for `top` has to arrive at `bottom` rather than at `right`.
    const placements = anchoredPositions("top", "center", 6).map((p) => p.placement);
    expect(placements).toEqual(["top", "bottom", "right", "left"]);
  });

  it("flips the gap with the side, and puts the alignment on the cross axis", () => {
    const below = anchoredPositions("bottom", "start", 8, 4)[0]!;
    expect(below.position).toMatchObject({
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
      offsetY: 8,
      offsetX: 4,
    });

    // The same 8px, in the other direction. A shared sign would put a `top`
    // popover 8px *over* its trigger instead of 8px above it.
    const above = anchoredPositions("top", "start", 8, 4)[0]!;
    expect(above.position).toMatchObject({ originY: "top", overlayY: "bottom", offsetY: -8 });

    const right = anchoredPositions("right", "end", 8, 4)[0]!;
    expect(right.position).toMatchObject({
      originX: "end",
      originY: "bottom",
      overlayX: "start",
      overlayY: "bottom",
      offsetX: 8,
      offsetY: 4,
    });
  });
});

describe("highlight navigation", () => {
  const list = (...disabled: boolean[]) => disabled.map((value) => ({ disabled: value }));

  it("opens onto the first option going down and the last going up", () => {
    // -1 is "nothing highlighted", which is how every menu here opens.
    expect(moveHighlight(list(false, false, false), -1, 1)).toBe(0);
    expect(moveHighlight(list(false, false, false), -1, -1)).toBe(2);
  });

  it("steps over a disabled option instead of landing on it", () => {
    // The failure this prevents renders perfectly and does nothing on Enter.
    expect(moveHighlight(list(false, true, false), 0, 1)).toBe(2);
    expect(moveHighlight(list(false, true, false), 2, -1)).toBe(0);
  });

  it("wraps at both ends", () => {
    expect(moveHighlight(list(false, false), 1, 1)).toBe(0);
    expect(moveHighlight(list(false, false), 0, -1)).toBe(1);
  });

  it("stays put when there is nowhere to go", () => {
    // A menu whose actions are all unavailable is a real state, and -1 leaves
    // the highlight where it was rather than on something unchoosable.
    expect(moveHighlight(list(true, true), -1, 1)).toBe(-1);
    expect(moveHighlight([], -1, 1)).toBe(-1);
    expect(firstEnabled(list(true, true), 0, 1)).toBe(-1);
  });

  it("orders items by where they are, not by when they registered", () => {
    const parent = document.createElement("div");
    const first = document.createElement("div");
    const second = document.createElement("div");
    parent.append(first, second);
    // Registered backwards, as a conditional item above them would cause.
    const sorted = inDomOrder([{ element: second }, { element: first }]);
    expect(sorted.map((item) => item.element)).toEqual([first, second]);
  });
});

describe("the dismissible layer stack", () => {
  const layers: DismissibleLayer[] = [];
  afterEach(() => {
    for (const layer of layers.splice(0)) removeLayer(layer);
    document.body.innerHTML = "";
  });

  function layerOn(element: HTMLElement, dismissed: string[], name: string): DismissibleLayer {
    const layer: DismissibleLayer = {
      surface: () => element,
      trigger: () => null,
      dismiss: () => dismissed.push(name),
    };
    layers.push(layer);
    pushLayer(document, layer);
    return layer;
  }

  it("sends Escape to the surface opened last, and only to that one", () => {
    // The whole reason this exists: a select opened inside a dialog has to close
    // itself and leave the dialog standing, and the CDK's own keyboard
    // dispatcher routes by *attach* order — which here is page order, because
    // every surface is attached while closed.
    const dismissed: string[] = [];
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    document.body.append(outer, inner);
    const dialog = layerOn(outer, dismissed, "dialog");
    layerOn(inner, dismissed, "select");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(dismissed).toEqual(["select"]);

    // With the select gone, the next Escape reaches the dialog.
    removeLayer(layers.pop()!);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(dismissed).toEqual(["select", "dialog"]);
    expect(dialog).toBeDefined();
  });

  it("ignores an Escape something else has already handled", () => {
    const dismissed: string[] = [];
    layerOn(document.createElement("div"), dismissed, "popover");
    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    event.preventDefault();
    document.dispatchEvent(event);
    expect(dismissed).toEqual([]);
  });

  it("dismisses on a pointer outside the surface and not inside it", () => {
    const dismissed: string[] = [];
    const surface = document.createElement("div");
    const inside = document.createElement("button");
    surface.append(inside);
    const elsewhere = document.createElement("button");
    document.body.append(surface, elsewhere);
    layerOn(surface, dismissed, "menu");

    inside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(dismissed).toEqual([]);

    elsewhere.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(dismissed).toEqual(["menu"]);
  });

  it("stops listening once nothing is open", () => {
    const dismissed: string[] = [];
    const layer = layerOn(document.createElement("div"), dismissed, "menu");
    expect(openLayerCount()).toBe(1);
    removeLayer(layer);
    layers.length = 0;
    expect(openLayerCount()).toBe(0);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dismissed).toEqual([]);
  });
});

describe("hiding the page from assistive technology", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("marks the page and the dialog's own backdrop, and not the dialog", () => {
    document.body.innerHTML = `
      <div id="mount">app</div>
      <div class="cdk-overlay-container">
        <div class="cdk-overlay-pane">
          <div data-part="backdrop"></div>
          <div data-part="positioner"><div data-part="content"></div></div>
        </div>
      </div>`;
    const positioner = document.querySelector<HTMLElement>('[data-part="positioner"]')!;
    const restore = hideOthersFrom(positioner);

    const mount = document.getElementById("mount")!;
    const backdrop = document.querySelector<HTMLElement>('[data-part="backdrop"]')!;
    // Both attributes, because both are part of the rendered contract: zag
    // leaves `data-aria-hidden` beside the ARIA one and the gate compares it.
    expect(mount.getAttribute("aria-hidden")).toBe("true");
    expect(mount.hasAttribute("data-aria-hidden")).toBe(true);
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(positioner.hasAttribute("aria-hidden")).toBe(false);
    // The container is never marked as a whole — the dialog is inside it.
    expect(document.querySelector(".cdk-overlay-container")!.hasAttribute("aria-hidden")).toBe(
      false,
    );

    restore();
    expect(mount.hasAttribute("aria-hidden")).toBe(false);
    expect(mount.hasAttribute("data-aria-hidden")).toBe(false);
    expect(backdrop.hasAttribute("aria-hidden")).toBe(false);
  });

  it("marks another overlay's positioner rather than the pane around it", () => {
    // The CDK puts two scaffolding elements between the container and the
    // surface. Marking the pane would hide the same subtree and render a
    // different tree — and the gate compares a Select-inside-a-Dialog *with* the
    // marks the dialog left on it.
    document.body.innerHTML = `
      <div id="mount">app</div>
      <div class="cdk-overlay-container">
        <div class="cdk-overlay-pane">
          <div data-part="positioner" id="dialog"></div>
        </div>
        <div class="cdk-overlay-pane">
          <div data-part="positioner" id="select"></div>
        </div>
      </div>`;
    const restore = hideOthersFrom(document.getElementById("dialog")!);
    const select = document.getElementById("select")!;
    expect(select.getAttribute("aria-hidden")).toBe("true");
    expect(select.parentElement!.hasAttribute("aria-hidden")).toBe(false);
    restore();
    expect(select.hasAttribute("aria-hidden")).toBe(false);
  });

  it("gives back an aria-hidden the page already had", () => {
    document.body.innerHTML = `
      <div id="mount" aria-hidden="true">app</div>
      <div class="cdk-overlay-container">
        <div class="cdk-overlay-pane"><div data-part="positioner" id="dialog"></div></div>
      </div>`;
    const restore = hideOthersFrom(document.getElementById("dialog")!);
    restore();
    // Not removed: something else was hiding it before the dialog opened, and
    // that is not the dialog's to undo.
    expect(document.getElementById("mount")!.getAttribute("aria-hidden")).toBe("true");
  });
});
