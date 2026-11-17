import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import Combobox from "./Combobox.svelte";
import type { ComboboxOption } from "./Combobox.types.js";

/**
 * A value that arrives before its options.
 *
 * zag works out the input text once, when the machine starts, so options
 * fetched after mount gave an empty box with the placeholder showing over a
 * perfectly good selection. See `SelectedLabelSync.svelte`. React pins the same
 * cases in `Combobox.test.tsx`.
 *
 * The parity gate cannot see any of this: it compares attributes, and an
 * input's text is its `value` *property*.
 */
const FRUIT: ComboboxOption[] = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry" },
];

beforeAll(() => {
  // zag's popper measures with this; jsdom ships none.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

/** Svelte flushes, then zag syncs the text in a microtask of its own. */
const settle = async () => {
  await tick();
  await new Promise((resolve) => setTimeout(resolve));
};

function mount(props: { value?: string; defaultValue?: string }) {
  const view = render(Combobox, {
    props: { label: "Fruit", placeholder: "Pick one", options: [] as ComboboxOption[], ...props },
  });
  const input = view.container.querySelector<HTMLInputElement>('[data-part="input"]')!;
  const load = async (options: ComboboxOption[]) => {
    await view.rerender({ options });
    await settle();
  };
  /** The machine opens on typing, so this is the open, filtering state. */
  const type = async (text: string) => {
    input.focus();
    input.value = text;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle();
  };
  return { input, load, type };
}

describe("Combobox options that load after the value", () => {
  it("shows the chosen label once the options holding it arrive", async () => {
    const { input, load } = mount({ defaultValue: "b" });
    await settle();
    expect(input.value).toBe("");

    await load(FRUIT);
    expect(input.value).toBe("Banana");
  });

  it("does the same for a bound value", async () => {
    const { input, load } = mount({ value: "c" });
    await load(FRUIT);
    expect(input.value).toBe("Cherry");
  });

  it("waits for the option it needs, not merely for some options", async () => {
    const { input, load } = mount({ defaultValue: "b" });
    await load([FRUIT[0]!]);
    expect(input.value).toBe("");

    await load(FRUIT);
    expect(input.value).toBe("Banana");
  });

  it("leaves typed text alone when the options arrive mid-query", async () => {
    const { input, load, type } = mount({ defaultValue: "b" });
    await type("ch");

    await load(FRUIT);
    expect(input.value).toBe("ch");
  });

  it("leaves typed text alone when the options re-render", async () => {
    const { input, load, type } = mount({ defaultValue: "b" });
    await load(FRUIT);
    await type("ch");
    expect(input.value).toBe("ch");

    // A fresh array with the same options in it — a refetch, or a parent that
    // rebuilds the list every render — must not put the label back.
    await load(FRUIT.map((option) => ({ ...option })));
    expect(input.value).toBe("ch");
  });
});
