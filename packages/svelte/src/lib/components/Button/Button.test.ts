import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { buttonStyles, CONTROL_TEXT_CLASS } from "@ui-organized/core";
import Button from "./Button.svelte";

/**
 * The class list is the contract.
 *
 * Every framework library renders different code but must produce the same
 * classes, because there is exactly one stylesheet and it is shared. A Svelte
 * Button that emits `btn--medium` instead of `btn--md` type-checks, renders, and
 * is invisibly unstyled. These assertions are deliberately written against
 * literal strings as well as the recipe: comparing only to `buttonStyles()`
 * would pass even if the recipe itself drifted.
 */
describe("Button", () => {
  it("renders a native button with the default variant classes", () => {
    const { container } = render(Button, { props: {} });
    const button = container.querySelector("button")!;
    expect(button).toBeTruthy();
    expect(button.getAttribute("type")).toBe("button");
    expect([...button.classList].sort()).toEqual(
      ["btn", "btn--primary", "btn--md", "text-default-body-large"].sort(),
    );
  });

  it("agrees with the shared recipe for every intent and size", () => {
    const intents = ["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost"] as const;
    const sizes = ["sm", "md", "lg"] as const;
    for (const intent of intents) {
      for (const size of sizes) {
        const { container, unmount } = render(Button, { props: { intent, size } });
        const actual = [...container.querySelector("button")!.classList].sort();
        const expected = [
          ...new Set(`${CONTROL_TEXT_CLASS[size]} ${buttonStyles({ intent, size })}`.split(/\s+/)),
        ].sort();
        expect(actual, `${intent}/${size}`).toEqual(expected);
        unmount();
      }
    }
  });

  it("defaults type to button so it cannot submit a form by accident", () => {
    const { container } = render(Button, { props: {} });
    expect(container.querySelector("button")!.getAttribute("type")).toBe("button");
  });

  it("passes through arbitrary attributes and merges the caller's class", () => {
    const { container } = render(Button, {
      props: { class: "mine", disabled: true, "aria-label": "Save" },
    });
    const button = container.querySelector("button")!;
    expect(button.classList.contains("mine")).toBe(true);
    expect(button.classList.contains("btn")).toBe(true);
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("Save");
  });
});
