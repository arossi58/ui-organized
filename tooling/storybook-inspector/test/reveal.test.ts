// @vitest-environment jsdom
/**
 * Finding the trigger that opens a given overlay part.
 *
 * The markup here is copied from what Ark actually renders — the id scheme, the
 * ARIA wiring, and the cases that broke a naive implementation: a combobox that
 * points `aria-controls` at its input, a closed tooltip that publishes no
 * relationship at all, and an accordion whose ids carry an item value after the
 * part name.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { openOverlayFor } from "../src/inspect/reveal.js";

function html(markup: string): Document {
  document.body.innerHTML = markup;
  return document;
}

let clicks: string[];

beforeEach(() => {
  clicks = [];
  document.body.innerHTML = "";
  document.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    if (el?.id) clicks.push(el.id);
  });
});

describe("openOverlayFor", () => {
  it("presses the trigger sharing the content's id scope", () => {
    const doc = html(`
      <button id="dialog::r4::trigger" data-part="trigger" aria-controls="dialog::r4::content"></button>
      <div id="dialog::r4::content" data-part="content" data-state="closed" hidden>
        <h2 id="title">Delete project</h2>
      </div>`);

    expect(openOverlayFor(doc, doc.getElementById("title"))).toBe(true);
    expect(clicks).toContain("dialog::r4::trigger");
  });

  it("prefers the trigger over an input that also claims aria-controls", () => {
    // A combobox wires `aria-controls` onto its input, which comes first in the
    // DOM — but clicking an input opens nothing.
    const doc = html(`
      <input id="combobox::r4::input" data-part="input" aria-controls="combobox::r4::content" />
      <button id="combobox::r4::trigger" data-part="trigger" aria-controls="combobox::r4::content"></button>
      <div id="combobox::r4::content" data-part="content" data-state="closed" hidden>
        <div id="option">Apple</div>
      </div>`);

    expect(openOverlayFor(doc, doc.getElementById("option"))).toBe(true);
    expect(clicks).toContain("combobox::r4::trigger");
    expect(clicks).not.toContain("combobox::r4::input");
  });

  it("finds an accordion trigger through ARIA when the id carries an item value", () => {
    // `accordion::r4::content:how` doesn't end at the part, so the scope rule
    // can't derive `…::trigger` — ARIA is what resolves it.
    const doc = html(`
      <button id="accordion::r4::trigger:how" data-part="item-trigger"
              aria-controls="accordion::r4::content:how"></button>
      <div id="accordion::r4::content:how" data-part="item-content" data-state="closed" hidden>
        <p id="panel-text">…</p>
      </div>`);

    expect(openOverlayFor(doc, doc.getElementById("panel-text"))).toBe(true);
    expect(clicks).toContain("accordion::r4::trigger:how");
  });

  it("does not click a tooltip trigger — that would toggle it shut", () => {
    const doc = html(`
      <button id="tooltip::r4::trigger" data-part="trigger"></button>
      <div id="tooltip::r4::content" data-part="content" data-state="closed" hidden>
        <span id="tip">Copy</span>
      </div>`);

    expect(openOverlayFor(doc, doc.getElementById("tip"))).toBe(true);
    expect(clicks).toEqual([]);
    expect(doc.activeElement?.id).toBe("tooltip::r4::trigger");
  });

  it("leaves an already-open overlay alone", () => {
    const doc = html(`
      <button id="dialog::r4::trigger" data-part="trigger" aria-controls="dialog::r4::content"></button>
      <div id="dialog::r4::content" data-part="content" data-state="open">
        <h2 id="title">Delete project</h2>
      </div>`);

    expect(openOverlayFor(doc, doc.getElementById("title"))).toBe(false);
    expect(clicks).toEqual([]);
  });

  it("looks inside a wrapper that isn't itself shut", () => {
    // A date picker's positioner holds the closed calendar rather than being
    // closed itself, so selecting the positioner has to look down.
    const doc = html(`
      <button id="popover::r4::trigger" data-part="trigger" aria-controls="popover::r4::content"></button>
      <div id="popover::r4::popper" data-part="positioner">
        <div id="popover::r4::content" data-part="content" data-state="closed" hidden></div>
      </div>`);

    expect(openOverlayFor(doc, doc.getElementById("popover::r4::popper"))).toBe(true);
    expect(clicks).toContain("popover::r4::trigger");
  });

  it("reports nothing to open for an ordinary element", () => {
    const doc = html(`<input id="field" class="field__control" />`);
    expect(openOverlayFor(doc, doc.getElementById("field"))).toBe(false);
  });
});
