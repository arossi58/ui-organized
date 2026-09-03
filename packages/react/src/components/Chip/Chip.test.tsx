// @vitest-environment jsdom
/**
 * The chip's structure is its accessibility contract, and none of it is visible
 * by reading the component:
 *
 * - the dismiss control must be a *sibling* of the body, never inside it
 *   (axe `nested-interactive`, and invalid HTML);
 * - a chip that opens nothing must not be a button, or every static token in a
 *   list becomes an empty stop in the tab order;
 * - and every prop but `className` has to land on the body, because that is
 *   what lets `<PopoverTrigger render={<Chip />} />` attach its `id`,
 *   `onClick` and `aria-expanded` to the element that actually opens the
 *   popover.
 *
 * The last one is the load-bearing oddity: put the spread on the wrapper and
 * the chip still renders perfectly and silently stops opening anything.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { Chip } from "./Chip.js";
import { registerIconSet } from "../../icons/registry.js";

let container: HTMLDivElement;
let root: Root;

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  // The dismiss control and the caret are icons; without a registered set the
  // component warns on every render and the real failures get lost in it.
  // lucide-react is not needed for that — a stub set answers the same question.
  registerIconSet({
    library: "lucide",
    outline: new Proxy({}, { get: () => () => null }),
    svgProps: () => ({}),
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function mount(node: ReactNode): HTMLDivElement {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(node));
  return container;
}

describe("Chip", () => {
  it("renders the three parts of its sentence", () => {
    const dom = mount(
      <Chip label="Role" detail="is any of">
        Admin, Owner
      </Chip>,
    );
    expect(dom.querySelector(".chip__label")?.textContent).toBe("Role");
    expect(dom.querySelector(".chip__detail")?.textContent).toBe("is any of");
    expect(dom.querySelector(".chip__value")?.textContent).toBe("Admin, Owner");
  });

  it("is not a button when it opens nothing", () => {
    const dom = mount(<Chip label="Role">Admin</Chip>);
    expect(dom.querySelectorAll("button")).toHaveLength(0);
    expect(dom.querySelector("span.chip__body")).not.toBeNull();
  });

  it("becomes a button once it has something to do", () => {
    const dom = mount(
      <Chip label="Role" dropdown>
        Admin
      </Chip>,
    );
    expect(dom.querySelector("button.chip__body")).not.toBeNull();
  });

  it("keeps the dismiss control a sibling of the body", () => {
    const dom = mount(
      <Chip label="Role" onClick={() => {}} onRemove={() => {}} removeLabel="Remove filter: Role">
        Admin
      </Chip>,
    );
    expect(dom.querySelectorAll("button button")).toHaveLength(0);
    expect(dom.querySelectorAll(".chip button")).toHaveLength(2);
    expect(dom.querySelector(".chip__remove")?.getAttribute("aria-label")).toBe(
      "Remove filter: Role",
    );
  });

  it("puts every prop but className on the body", () => {
    const dom = mount(
      <Chip
        className="my-chip"
        id="chip-1"
        aria-expanded="true"
        data-filter-id="f1"
        onClick={() => {}}
        label="Role"
      >
        Admin
      </Chip>,
    );
    const chip = dom.querySelector(".chip");
    const body = dom.querySelector(".chip__body");
    expect(chip?.classList.contains("my-chip")).toBe(true);
    expect(chip?.id).toBe("");
    expect(body?.id).toBe("chip-1");
    expect(body?.getAttribute("aria-expanded")).toBe("true");
    expect(body?.getAttribute("data-filter-id")).toBe("f1");
  });

  /**
   * The glyph replaces the words on screen, so it has to carry them for anyone
   * who cannot see it. A decorative `aria-hidden` glyph would leave the chip
   * reading "Name Value" — the relation gone entirely, and nothing on the page
   * to show it had been.
   */
  it("draws a comparison glyph and keeps the relation in its name", () => {
    const dom = mount(
      <Chip label="Name" operator="contains" operatorLabel="contains">
        ada
      </Chip>,
    );
    const glyph = dom.querySelector(".chip__operator");
    expect(glyph?.querySelector("svg")).not.toBeNull();
    expect(glyph?.getAttribute("role")).toBe("img");
    expect(glyph?.getAttribute("aria-label")).toBe("contains");
    // Drawn or spelled, never both.
    expect(dom.querySelector(".chip__detail")).toBeNull();
  });

  it("hides an unnamed glyph from assistive tech", () => {
    const dom = mount(
      <Chip label="Name" operator="equals">
        Ada
      </Chip>,
    );
    const glyph = dom.querySelector(".chip__operator");
    expect(glyph?.getAttribute("aria-hidden")).toBe("true");
    expect(glyph?.hasAttribute("role")).toBe(false);
  });

  it("takes the glyph's colour from the text beside it", () => {
    const dom = mount(
      <Chip label="Name" operator="starts-with">
        Ada
      </Chip>,
    );
    // A hard-coded ink is invisible in the dark theme and wrong inside a
    // selected chip. Asserted on the rendered DOM, not just on the table.
    expect(dom.querySelector(".chip__operator")?.innerHTML).toContain("currentColor");
  });

  it("warns when a dismissible chip would ship unnamed", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(
      <Chip label="Role" onRemove={() => {}}>
        Admin
      </Chip>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("removeLabel"));
    warn.mockRestore();
  });
});
