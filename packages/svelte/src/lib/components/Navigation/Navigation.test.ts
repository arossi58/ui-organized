import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import Fixture from "./Navigation.fixture.svelte";

/**
 * That the rail reaches items that are already on the page.
 *
 * The parity gate renders once, so every collapsed case it compares was
 * collapsed before the item existed. The transition is the part that can break,
 * and it breaks silently: `useNavContext` returning `accessor.current` rather
 * than a live getter type-checks, renders, and hands each item the value it had
 * at initialisation. The symptom is a 56px rail with full-width labels in it.
 */
describe("Navigation", () => {
  it("collapses items that were already mounted when the sidebar toggles", async () => {
    const { container } = render(Fixture);
    const item = container.querySelector<HTMLElement>(".nav-item")!;
    const toggle = container.querySelector<HTMLElement>(".sidebar__toggle")!;

    expect(item.classList.contains("nav-item--collapsed")).toBe(false);

    toggle.click();
    await tick();

    expect(container.querySelector(".sidebar")!.classList.contains("sidebar--collapsed")).toBe(true);
    expect(item.classList.contains("nav-item--collapsed")).toBe(true);
  });
});
