// @vitest-environment jsdom
/**
 * The `format` prop is a contract about strings leaving the component, and the
 * notation select is a contract about *not* changing them. Neither is visible
 * by reading the markup — both need the component actually running — and the
 * combination that is easiest to get wrong (a hex or OKLCH field on a machine
 * that can only hold rgba) is exactly the one a consumer would hit first.
 */
import { type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { ColorPicker } from "./ColorPicker.js";
import type { ColorPickerProps } from "./ColorPicker.types.js";

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  // zag's popper measures with both; jsdom ships neither.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  globalThis.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof matchMedia;
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

/** `defaultOpen` so the picker's fields are in the document to be read. */
const picker = (props: Partial<ColorPickerProps> = {}) => (
  <ColorPicker label="Brand" defaultValue="#2563eb" defaultOpen {...props} />
);

const trigger = () => document.querySelector<HTMLElement>(".color-picker__value-text");
const select = () => document.querySelector<HTMLSelectElement>(".color-picker__format-select")!;
const fields = () =>
  [...document.querySelectorAll<HTMLElement>(".color-picker__field")].map((field) => [
    field.querySelector<HTMLInputElement>("input")!.getAttribute("aria-label"),
    field.querySelector<HTMLInputElement>("input")!.value,
  ]);
const submitted = (name: string) =>
  [...document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)].map((el) => el.value);

const setFormat = (value: string) => {
  const el = select();
  act(() => {
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
};

/**
 * Types into a field and leaves it, which is what commits the edit.
 *
 * Two things this has to get right or it silently tests nothing: React maps
 * `onBlur` to the bubbling `focusout`, so a plain `blur` event is ignored; and
 * the state machine applies a value on a microtask, so the act must be awaited
 * before the rendered colour reflects the edit.
 */
const type = async (input: HTMLInputElement, text: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    setter.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => {
    input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
  });
};

describe("format", () => {
  it.each([
    ["rgba", "rgba(37, 99, 235, 1)"],
    ["hsla", "hsla(221.21, 83.19%, 53.33%, 1)"],
    ["hex", "#2563EB"],
    ["oklch", "oklch(0.54615 0.21521 262.881)"],
  ])("shows the value on the trigger as %s", (format, expected) => {
    mount(picker({ format: format as ColorPickerProps["format"] }));
    expect(trigger()?.textContent).toBe(expected);
  });

  it.each([
    ["rgba", "rgba(37, 99, 235, 1)"],
    ["hex", "#2563EB"],
    ["oklch", "oklch(0.54615 0.21521 262.881)"],
  ])("submits %s under the field's name, and only once", (format, expected) => {
    mount(picker({ format: format as ColorPickerProps["format"], name: "brand" }));
    expect(submitted("brand")).toEqual([expected]);
  });

  it("opens the fields on the notation it emits", () => {
    mount(picker({ format: "oklch" }));
    expect(select().value).toBe("oklch");
  });
});

describe("the notation select", () => {
  it("reads the same colour in every notation", () => {
    mount(picker());

    expect(fields()).toEqual([
      ["R", "37"],
      ["G", "99"],
      ["B", "235"],
      ["A", "1"],
    ]);

    setFormat("hex");
    expect(fields()).toEqual([
      ["HEX", "#2563EB"],
      ["A", "1"],
    ]);

    setFormat("hsl");
    expect(fields()).toEqual([
      ["H", "221"],
      ["S", "83"],
      ["L", "53"],
      ["A", "1"],
    ]);

    setFormat("oklch");
    expect(fields()).toEqual([["OKLCH", "0.54615 0.21521 262.881"]]);
  });

  /* The whole point of the switcher being local: it is a way of reading the
     colour, so nothing leaves the component in a shape the consumer did not
     ask for. */
  it("does not change the notation the component emits", async () => {
    const changes: string[] = [];
    mount(picker({ format: "hex", name: "brand", onValueChangeEnd: (v) => changes.push(v) }));

    setFormat("oklch");
    expect(trigger()?.textContent).toBe("#2563EB");
    expect(submitted("brand")).toEqual(["#2563EB"]);

    await type(
      document.querySelector<HTMLInputElement>(".color-picker__field input")!,
      "0.62796 0.25768 29.234",
    );
    expect(changes).toEqual(["#FF0000"]);
    expect(trigger()?.textContent).toBe("#FF0000");
  });
});

describe("editing a field", () => {
  it("writes a channel that the machine's own format cannot hold", async () => {
    const changes: string[] = [];
    // The machine is in rgba here, so `lightness` only exists after conversion.
    mount(picker({ onValueChangeEnd: (v) => changes.push(v) }));

    setFormat("hsl");
    const [, , lightness] = document.querySelectorAll<HTMLInputElement>(
      ".color-picker__field input",
    );
    await type(lightness!, "20");

    expect(changes).toEqual(["rgba(9, 35, 93, 1)"]);
  });

  it("keeps the colour it was showing when an edit cannot be read", async () => {
    const changes: string[] = [];
    mount(picker({ format: "hex", onValueChangeEnd: (v) => changes.push(v) }));

    const hex = document.querySelector<HTMLInputElement>(".color-picker__field input")!;
    await type(hex, "not a colour");

    expect(changes).toEqual([]);
    expect(hex.value).toBe("#2563EB");
  });

  it("leaves alpha alone when a six-digit hex is typed, since the field beside it owns alpha", async () => {
    mount(picker({ defaultValue: "rgba(37, 99, 235, 0.4)" }));

    setFormat("hex");
    const [hex, alpha] = document.querySelectorAll<HTMLInputElement>(".color-picker__field input");
    await type(hex!, "#ff0000");

    expect(alpha!.value).toBe("0.4");
  });
});

describe("showFormatInputs", () => {
  it("drops the whole row when it is off", () => {
    mount(picker({ showFormatInputs: false }));
    expect(document.querySelector(".color-picker__inputs")).toBeNull();
    // The picker itself is still there.
    expect(document.querySelector(".color-picker__area")).not.toBeNull();
  });
});
