// @vitest-environment jsdom
/**
 * A value that arrives before its options.
 *
 * zag works out the input text once, when the machine starts:
 * `collection.stringifyMany(value)`. Options fetched after mount therefore give
 * an empty box with the placeholder showing over a perfectly good selection —
 * the Theme Builder's font pickers did exactly this on a fresh load. When the
 * options do arrive, the machine only sends `CHILDREN_CHANGE`, which it handles
 * in its open states alone, so nothing ever re-derives the text.
 *
 * The parity gate cannot see any of this: it compares attributes, and an
 * input's text is its `value` *property*.
 */
import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { Combobox } from "./Combobox.js";
import type { ComboboxOption } from "./Combobox.types.js";
import { registerIconSet } from "../../icons/registry.js";

const FRUIT: ComboboxOption[] = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry" },
];

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  // The trigger's chevron is an icon; a stub set keeps the warning out of the
  // output without pulling in a real icon library.
  registerIconSet({
    library: "lucide",
    outline: new Proxy({}, { get: () => () => null }),
    svgProps: () => ({}),
  });
  // zag looks options up by escaped id once the list is open; jsdom has no CSS.
  (globalThis as { CSS?: { escape(value: string): string } }).CSS ??= {
    escape: (value) => value.replace(/[^\w-]/g, (c) => `\\${c}`),
  };
  // zag's popper measures with this; jsdom ships none.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const mounted: Array<{ root: Root; host: HTMLElement }> = [];

function mount(ui: ReactNode): HTMLElement {
  const host = document.createElement("div");
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

/** The component, with a handle for "the request came back". */
let load: (options: ComboboxOption[]) => void = () => {};
function Loading(props: { value?: string; defaultValue?: string }) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  load = setOptions;
  return <Combobox label="Fruit" placeholder="Pick one" options={options} {...props} />;
}

/** zag syncs the text in a microtask, after the render that carried the options. */
const settle = () => act(async () => {});

const input = (host: HTMLElement) => host.querySelector<HTMLInputElement>('[data-part="input"]')!;

/**
 * The machine opens on typing, so this is the open, filtering state.
 *
 * Through the prototype's setter: React wraps an input's own `value` setter to
 * track what it last saw, and a plain assignment updates that record — so the
 * `input` event finds nothing changed, React fires no `onChange`, and the
 * machine never hears the keystroke.
 */
const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
const type = async (box: HTMLInputElement, text: string) => {
  act(() => {
    box.focus();
    setNativeValue.call(box, text);
    box.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await settle();
};

describe("Combobox options that load after the value", () => {
  it("shows the chosen label once the options holding it arrive", async () => {
    const host = mount(<Loading defaultValue="b" />);
    expect(input(host).value).toBe("");

    act(() => load(FRUIT));
    await settle();
    expect(input(host).value).toBe("Banana");
  });

  it("does the same for a controlled value", async () => {
    const host = mount(<Loading value="c" />);
    act(() => load(FRUIT));
    await settle();
    expect(input(host).value).toBe("Cherry");
  });

  it("waits for the option it needs, not merely for some options", async () => {
    const host = mount(<Loading defaultValue="b" />);
    act(() => load([FRUIT[0]!]));
    await settle();
    expect(input(host).value).toBe("");

    act(() => load(FRUIT));
    await settle();
    expect(input(host).value).toBe("Banana");
  });


  it("leaves typed text alone when the options arrive mid-query", async () => {
    const host = mount(<Loading defaultValue="b" />);
    await type(input(host), "ch");

    act(() => load(FRUIT));
    await settle();
    expect(input(host).value).toBe("ch");
  });

  it("leaves typed text alone when the options re-render", async () => {
    const host = mount(<Loading defaultValue="b" />);
    act(() => load(FRUIT));
    await settle();
    await type(input(host), "ch");
    expect(input(host).value).toBe("ch");

    // A fresh array with the same options in it — a refetch, or a parent that
    // rebuilds the list every render — must not put the label back.
    act(() => load(FRUIT.map((option) => ({ ...option }))));
    await settle();
    expect(input(host).value).toBe("ch");
  });
});

describe("Combobox multiple", () => {
  const MULTI = { label: "Fruit", options: FRUIT, multiple: true as const, name: "fruit" };
  const submitted = (host: HTMLElement) => {
    const form = document.createElement("form");
    form.append(host.firstElementChild!.cloneNode(true));
    return new FormData(form).getAll("fruit");
  };
  const press = (key: string) =>
    act(() => {
      input(document.body).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    });

  /**
   * The values are submitted as hidden inputs, one each, because the text box
   * holds the query. The parity gate compares attributes, not a form's data.
   */
  it("submits each value under the name, and the text box submits nothing", () => {
    const host = mount(<Combobox {...MULTI} defaultValue={["a", "c"]} />);
    expect(submitted(host)).toEqual(["a", "c"]);
    expect(input(host).name).toBe("");
  });

  it("clears the query after a pick and keeps the earlier values", async () => {
    const host = mount(<Combobox {...MULTI} defaultValue={["a"]} />);
    await type(input(host), "ban");
    press("ArrowDown");
    press("Enter");
    await settle();
    expect(submitted(host)).toEqual(["a", "b"]);
    // selectionBehavior "clear": the box empties rather than showing labels.
    expect(input(host).value).toBe("");
  });

  it("removes the last value on Backspace in an empty box, and only then", async () => {
    const host = mount(<Combobox {...MULTI} defaultValue={["a", "b"]} />);
    act(() => input(host).focus());
    press("Backspace");
    await settle();
    expect(submitted(host)).toEqual(["a"]);

    await type(input(host), "c");
    press("Backspace");
    await settle();
    expect(submitted(host)).toEqual(["a"]);
  });
});

describe("Combobox multiple overflow", () => {
  /**
   * jsdom has no layout, so the row's width and each tag's are stubbed: a
   * 120px row, 50px tags and no gap fit one tag beside the 32px "+N". The gate
   * renders in a real browser but at one width, so it never sees tags overflow.
   */
  it("marks the tags that do not fit and counts them in a +N tag", () => {
    const width = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth")!;
    const rect = Element.prototype.getBoundingClientRect;
    Object.defineProperty(Element.prototype, "clientWidth", {
      configurable: true,
      get(this: Element) {
        return this.classList.contains("combobox-field__tags") ? 120 : 0;
      },
    });
    Element.prototype.getBoundingClientRect = function (this: Element) {
      return { width: this.hasAttribute("data-tag") ? 50 : 0 } as DOMRect;
    };
    try {
      const host = mount(<Combobox label="Fruit" options={FRUIT} multiple defaultValue={["a", "b", "c"]} />);
      const tags = [...host.querySelectorAll(".combobox-field__tags > [data-tag]")];
      expect(tags.map((tag) => tag.hasAttribute("data-overflowed"))).toEqual([false, true, true]);
      expect(host.querySelector(".combobox-field__tag-more")?.textContent).toBe("+2");
    } finally {
      Object.defineProperty(Element.prototype, "clientWidth", width);
      Element.prototype.getBoundingClientRect = rect;
    }
  });
});
