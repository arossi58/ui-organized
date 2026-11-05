// @vitest-environment jsdom
/**
 * The chip's structure is its accessibility contract, and none of it is visible
 * by reading the component:
 *
 * - every segment and the dismiss control are *siblings*, never nested
 *   (axe `nested-interactive`, and invalid HTML);
 * - a segment that opens nothing must not be a button, or every static token in
 *   a list becomes a row of empty stops in the tab order;
 * - and a segment passes every prop through, because that is what lets
 *   `<MenuTrigger render={<ChipSegment />} />` attach its `id`, `onClick` and
 *   `aria-expanded` to the one segment that opens that menu.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { Chip, ChipSegment } from "./Chip.js";
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
  it("renders the three parts of its sentence as segments, operator spelled", () => {
    const dom = mount(<Chip label="Role" operator="is any of" value="Admin, Owner" />);
    const segments = [...dom.querySelectorAll(".chip > .chip__segment")];
    expect(segments.map((segment) => segment.textContent)).toEqual([
      "Role",
      "is any of",
      "Admin, Owner",
    ]);
    expect(dom.querySelector(".chip__segment--label")?.textContent).toBe("Role");
    expect(dom.querySelector(".chip__segment--operator")?.textContent).toBe("is any of");
    expect(dom.querySelector(".chip__segment--value")?.textContent).toBe("Admin, Owner");
    expect(dom.querySelector("svg")).toBeNull();
  });

  it("has one look: no variant or size classes", () => {
    const dom = mount(<Chip label="Role" />);
    expect(dom.querySelector(".chip")?.className).toBe("chip");
  });

  it("is a group of segments, none of them buttons when it opens nothing", () => {
    const dom = mount(<Chip label="Role" value="Admin" />);
    expect(dom.querySelector(".chip")?.getAttribute("role")).toBe("group");
    expect(dom.querySelectorAll("button")).toHaveLength(0);
    expect(dom.querySelectorAll("span.chip__segment")).toHaveLength(2);
  });

  it("makes each composed segment its own control", () => {
    const dom = mount(
      <Chip selected>
        <ChipSegment part="label" onClick={() => {}}>
          Name
        </ChipSegment>
        <ChipSegment part="operator" onClick={() => {}} aria-expanded="true" id="op">
          is greater than
        </ChipSegment>
        <ChipSegment onClick={() => {}}>Value</ChipSegment>
      </Chip>,
    );
    const buttons = [...dom.querySelectorAll<HTMLButtonElement>(".chip > button.chip__segment")];
    expect(buttons).toHaveLength(3);
    expect(buttons[1]?.id).toBe("op");
    expect(buttons[1]?.getAttribute("aria-expanded")).toBe("true");
    expect(buttons[2]?.classList.contains("chip__segment--value")).toBe(true);
    expect(dom.querySelector(".chip")?.classList.contains("chip--selected")).toBe(true);
  });

  it("disables every segment it holds", () => {
    const dom = mount(
      <Chip disabled label="Role">
        <ChipSegment>Admin</ChipSegment>
      </Chip>,
    );
    const segments = [...dom.querySelectorAll<HTMLButtonElement>(".chip__segment")];
    expect(segments.map((segment) => segment.tagName)).toEqual(["BUTTON", "BUTTON"]);
    expect(segments.every((segment) => segment.disabled)).toBe(true);
  });

  it("keeps the dismiss control a sibling of the segments", () => {
    const dom = mount(
      <Chip label="Role" value="Admin" onRemove={() => {}} removeLabel="Remove filter: Role" />,
    );
    expect(dom.querySelectorAll("button button")).toHaveLength(0);
    expect(dom.querySelector(".chip > .chip__remove")?.getAttribute("aria-label")).toBe(
      "Remove filter: Role",
    );
  });

  it("puts wrapper props on the wrapper", () => {
    const dom = mount(<Chip className="my-chip" aria-label="Role is Admin" data-filter-id="f1" />);
    const chip = dom.querySelector(".chip");
    expect(chip?.classList.contains("my-chip")).toBe(true);
    expect(chip?.getAttribute("aria-label")).toBe("Role is Admin");
    expect(chip?.getAttribute("data-filter-id")).toBe("f1");
  });

  it("warns when a dismissible chip would ship unnamed", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(<Chip label="Role" onRemove={() => {}} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("removeLabel"));
    warn.mockRestore();
  });
});
