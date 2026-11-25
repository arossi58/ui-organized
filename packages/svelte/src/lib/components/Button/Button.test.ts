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
    const intents = ["primary", "secondary", "tertiary", "ghost", "destructive", "destructive-ghost", "link", "link-neutral"] as const;
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

  // `class` is typed as Svelte's `ClassValue`, the shape an Ark `asChild` hands
  // over, so `<Button {...props()}>` typechecks without a cast. The type is
  // only honest if the merge takes every shape it admits, not just strings.
  it("merges a class given as an array, an object or null", () => {
    const { container } = render(Button, {
      props: { class: ["mine", { on: true, off: false }, null] },
    });
    const classes = container.querySelector("button")!.classList;
    expect(classes.contains("btn")).toBe(true);
    expect(classes.contains("mine")).toBe(true);
    expect(classes.contains("on")).toBe(true);
    expect(classes.contains("off")).toBe(false);

    const { container: bare } = render(Button, { props: { class: null } });
    expect([...bare.querySelector("button")!.classList].sort()).toEqual(
      ["btn", "btn--primary", "btn--md", "text-default-body-large"].sort(),
    );
  });
  it("marks a loading button busy rather than disabled, and swallows the click", async () => {
    let clicks = 0;
    const { container } = render(Button, {
      props: { loading: true, onclick: () => clicks++ },
    });
    const button = container.querySelector("button")!;
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("data-loading")).toBe(true);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    button.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(clicks).toBe(0);
  });

  it("puts a decorative spinner in the icon's place while loading", () => {
    const { container } = render(Button, {
      props: { loading: true, icon: "check", iconPosition: "right" },
    });
    const spinner = container.querySelector(".spinner")!;
    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute("aria-hidden")).toBe("true");
    expect(spinner.hasAttribute("role")).toBe(false);
    expect(container.querySelector(".icon")).toBeNull();
  });

  it("renders a real anchor for href, and an inert link while loading", () => {
    const { container } = render(Button, { props: { href: "/docs", target: "_blank" } });
    const anchor = container.querySelector("a")!;
    expect(anchor.getAttribute("href")).toBe("/docs");
    expect(anchor.getAttribute("target")).toBe("_blank");
    expect(anchor.hasAttribute("type")).toBe(false);
    expect(anchor.classList.contains("btn")).toBe(true);

    const { container: busy } = render(Button, { props: { href: "/docs", loading: true } });
    const inert = busy.querySelector("a")!;
    expect(inert.hasAttribute("href")).toBe(false);
    expect(inert.getAttribute("role")).toBe("link");
    expect(inert.getAttribute("aria-disabled")).toBe("true");
  });

  it("renders a disabled href as an inert link with the disabled appearance", () => {
    const { container } = render(Button, { props: { href: "/docs", disabled: true } });
    const anchor = container.querySelector("a")!;
    expect(anchor.hasAttribute("href")).toBe(false);
    expect(anchor.hasAttribute("disabled")).toBe(false);
    expect(anchor.hasAttribute("data-disabled")).toBe(true);
    expect(anchor.getAttribute("aria-disabled")).toBe("true");
  });
});
