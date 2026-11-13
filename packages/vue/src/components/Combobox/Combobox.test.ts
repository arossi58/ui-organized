// @vitest-environment jsdom
//
// Set per file rather than in the package's vite config, for the reason
// Calendar.test.ts gives.
import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { createApp, h, nextTick, shallowRef, type App } from "vue";
import Combobox from "./Combobox.vue";
import type { ComboboxOption } from "./Combobox.types.js";

/**
 * A value that arrives before its options.
 *
 * zag works out the input text once, when the machine starts, so options
 * fetched after mount gave an empty box with the placeholder showing over a
 * perfectly good selection. See `SelectedLabelSync.vue`. React and Svelte pin
 * the same cases in their own `Combobox.test`.
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

const mounted: { app: App; host: HTMLElement }[] = [];
afterEach(() => {
  for (const { app, host } of mounted.splice(0)) {
    app.unmount();
    host.remove();
  }
  vi.restoreAllMocks();
});

/** Vue flushes, then zag syncs the text in a microtask of its own. */
const settle = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve));
};

function mount(props: { modelValue?: string; defaultValue?: string }) {
  // No icon set is registered in a unit test, so the trigger's chevron says so.
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const options = shallowRef<ComboboxOption[]>([]);
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({
    render: () =>
      h(Combobox, { label: "Fruit", placeholder: "Pick one", options: options.value, ...props }),
  });
  app.mount(host);
  mounted.push({ app, host });

  const input = host.querySelector<HTMLInputElement>('[data-part="input"]')!;
  const load = async (next: ComboboxOption[]) => {
    options.value = next;
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

  it("does the same for a v-model value", async () => {
    const { input, load } = mount({ modelValue: "c" });
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
