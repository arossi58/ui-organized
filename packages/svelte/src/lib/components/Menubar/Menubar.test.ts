import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import Fixture from "./Menubar.fixture.svelte";

/**
 * The half of the menubar nothing else can see.
 *
 * The parity gate compares static markup, and the roving tabindex is applied
 * from an effect — so on the server neither library emits a `tabindex` and the
 * gate can only agree about its absence. There is no browser scenario for
 * Menubar either. Everything asserted here therefore has exactly one guard.
 *
 * The trap this exists for: React's `onFocus` is a synthetic event and *bubbles*,
 * so the direct port of its handler — `onfocus` on the container — is silently
 * dead. `focus` fires only on the element it targets, so a bar listening for it
 * never learns that one of its triggers was focused and the roving state stops
 * following the user. Nothing throws; tabbing simply lands on the wrong trigger.
 */
describe("Menubar", () => {
  const itemsOf = (container: HTMLElement) => [
    ...container.querySelectorAll<HTMLElement>("[data-menubar-item]"),
  ];

  it("turns its menu triggers into menuitems", () => {
    // `role="menubar"` may only contain menuitems, and a trigger cannot know it
    // sits in a bar — the bar announces itself on context.
    const { container } = render(Fixture);
    const items = itemsOf(container);
    expect(items).toHaveLength(2);
    for (const item of items) expect(item.getAttribute("role")).toBe("menuitem");
  });

  it("is a single tab stop", async () => {
    const { container } = render(Fixture);
    await tick();
    expect(itemsOf(container).map((item) => item.tabIndex)).toEqual([0, -1]);
  });

  it("moves the tab stop to whichever trigger takes focus", async () => {
    const { container } = render(Fixture);
    await tick();
    const items = itemsOf(container);

    items[1]!.focus();
    await tick();
    expect(items.map((item) => item.tabIndex)).toEqual([-1, 0]);
  });

  it("moves focus between triggers with the arrow keys, and wraps", async () => {
    const { container } = render(Fixture);
    await tick();
    const bar = container.querySelector<HTMLElement>('[role="menubar"]')!;
    const items = itemsOf(container);

    items[0]!.focus();
    await tick();

    const arrow = (key: string) =>
      bar.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

    arrow("ArrowRight");
    expect(document.activeElement).toBe(items[1]);
    // Past the end and round to the front: a bar is a ring, not a list.
    arrow("ArrowRight");
    expect(document.activeElement).toBe(items[0]);
    arrow("End");
    expect(document.activeElement).toBe(items[1]);
    arrow("Home");
    expect(document.activeElement).toBe(items[0]);
  });
});
