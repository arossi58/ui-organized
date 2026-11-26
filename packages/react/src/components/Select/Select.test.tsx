// @vitest-environment jsdom
/**
 * Multiple mode, for what the parity gate cannot see: what a form submits, and
 * tags overflowing a narrow field. The gate compares attributes in a browser at
 * one width, so it never sees a "+N" or a form's data.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { Select } from "./Select.js";
import type { SelectOption } from "./Select.types.js";
import { registerIconSet } from "../../icons/registry.js";

const FRUIT: SelectOption[] = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry" },
];

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  registerIconSet({
    library: "lucide",
    outline: new Proxy({}, { get: () => () => null }),
    svgProps: () => ({}),
  });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const mounted: Array<{ root: Root; host: HTMLElement }> = [];
function mount(ui: ReactNode): HTMLElement {
  const host = document.createElement("form");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(ui));
  mounted.push({ root, host });
  return host;
}
afterEach(() => {
  for (const { root, host } of mounted.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

describe("Select multiple", () => {
  it("submits every chosen value under the name", () => {
    const host = mount(<Select label="Fruit" options={FRUIT} multiple name="fruit" defaultValue={["a", "c"]} />);
    expect(new FormData(host as HTMLFormElement).getAll("fruit")).toEqual(["a", "c"]);
  });

  it("names the values in the trigger, for a screen reader, while the tags are hidden from it", () => {
    const host = mount(<Select label="Fruit" options={FRUIT} multiple defaultValue={["a", "b"]} />);
    expect(host.querySelector('[data-part="trigger"]')?.textContent).toContain("Apple, Banana");
    expect(host.querySelector(".select-field__tags")?.getAttribute("aria-hidden")).toBe("true");
  });

  /** A 120px row, 50px tags and no gap fit one tag beside the 32px "+N". */
  it("marks the tags that do not fit and counts them in a +N tag", () => {
    const width = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth")!;
    const rect = Element.prototype.getBoundingClientRect;
    Object.defineProperty(Element.prototype, "clientWidth", {
      configurable: true,
      get(this: Element) {
        return this.classList.contains("select-field__tags") ? 120 : 0;
      },
    });
    Element.prototype.getBoundingClientRect = function (this: Element) {
      return { width: this.hasAttribute("data-tag") ? 50 : 0 } as DOMRect;
    };
    try {
      const host = mount(<Select label="Fruit" options={FRUIT} multiple defaultValue={["a", "b", "c"]} />);
      const tags = [...host.querySelectorAll(".select-field__tags > [data-tag]")];
      expect(tags.map((tag) => tag.hasAttribute("data-overflowed"))).toEqual([false, true, true]);
      expect(host.querySelector(".select-field__tag-more")?.textContent).toBe("+2");
    } finally {
      Object.defineProperty(Element.prototype, "clientWidth", width);
      Element.prototype.getBoundingClientRect = rect;
    }
  });
});
