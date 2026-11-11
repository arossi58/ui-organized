import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/svelte";
import Listbox from "./Listbox.svelte";

/**
 * zag focuses the listbox content on an item's `mousedown` without
 * `preventScroll`, which scrolls a list whose top is off screen between press
 * and release. The content is focused first, in the capture phase, without
 * scrolling, so zag's own focus is a no-op.
 */
describe("Listbox", () => {
  it("focuses its content without scrolling when an option is pressed", () => {
    const { container } = render(Listbox, {
      props: {
        label: "Fruit",
        options: [
          { value: "a", label: "Apple" },
          { value: "b", label: "Banana" },
        ],
      },
    });
    const content = container.querySelector<HTMLElement>(".listbox__content")!;
    const option = content.querySelector<HTMLElement>('[data-part="item"]')!;
    const focus = vi.spyOn(content, "focus");

    option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));

    expect(focus.mock.calls[0]?.[0]).toEqual({ preventScroll: true });
    expect(document.activeElement).toBe(content);
  });
});
