// @vitest-environment jsdom
/**
 * A text add-on is part of the value, so the control is described by it: a
 * screen reader that lands on the field reads "https://" and ".com" with it.
 * Ark writes the field's own `aria-describedby` (helper and error text), so the
 * add-ons have to be joined to it rather than replace it. The parity gate shows
 * the four libraries agree; this shows what they agree on.
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { Input } from "./Input.js";

let container: HTMLDivElement;
let root: Root;

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function render(node: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(node));
  // Ark finds its helper text in an effect, then re-renders the control.
  await act(async () => {});
  return container.querySelector("input")!;
}

/** The text of each element the control is described by, in order. */
const descriptions = (input: HTMLInputElement) =>
  (input.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? `<missing ${id}>`);

describe("Input add-ons", () => {
  it("describes the control by its text add-ons, ahead of the helper text", async () => {
    const input = await render(
      <Input label="Website" startAddon="https://" endAddon=".com" helperText="Your site" />,
    );
    expect(descriptions(input)).toEqual(["https://", ".com", "Your site"]);
  });

  it("does not describe the control by a slot add-on, which is a control of its own", async () => {
    const input = await render(
      <Input label="Share link" endAddon={<button type="button">Copy</button>} />,
    );
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(container.querySelector(".field__addon--slot")!.hasAttribute("id")).toBe(false);
  });

  it("keeps a description the caller passes", async () => {
    const input = await render(
      <>
        <p id="hint">Lowercase only</p>
        <Input label="Website" startAddon="https://" aria-describedby="hint" />
      </>,
    );
    expect(descriptions(input)).toEqual(["https://", "Lowercase only"]);
  });

  it("leaves an Input without add-ons to Ark", async () => {
    const input = await render(<Input label="Email" helperText="We never share it" />);
    expect(descriptions(input)).toEqual(["We never share it"]);
  });
});
