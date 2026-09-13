/**
 * The caller's `class`, which the parity gate structurally cannot check.
 *
 * `Tour.Root` renders no element, so a class handed to `<Tour>` has nothing to
 * fall through onto — Vue drops it silently rather than warning. React and
 * Svelte both merge it onto the card with `clsx(tourStyles(…), className)`, and
 * this component did not, so a consumer's class reached nothing in Vue alone.
 *
 * The gate is blind to it for a reason worth stating: everything Tour renders is
 * teleported, so a parity case asserting "the card carries the class" compares
 * React's absent card against Vue's absent card and passes. Coverage that can
 * only pass is worse than none, which is why the case was deliberately not
 * written and this file exists instead.
 *
 * A server render is enough, but not the obvious one: Vue does not inline
 * teleported content into `renderToString`'s result. It collects it in the
 * context's `teleports` bucket keyed by target, so the card is only reachable by
 * reading that — which is also why a first pass at this test found no card at
 * all and looked like the component rendered nothing.
 */
import { describe, it, expect } from "vitest";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import Tour from "./Tour.vue";

const STEPS = [{ id: "one", title: "First", description: "Something to see" }];

/** The card, wherever the teleport put it. */
const cardClasses = (html: string): string[] => {
  const match = /<div[^>]*data-scope="tour"[^>]*data-part="content"[^>]*>/.exec(html);
  if (!match) return [];
  const cls = /\sclass="([^"]*)"/.exec(match[0]);
  return cls?.[1]?.split(/\s+/).filter(Boolean) ?? [];
};

const render = async (props: Record<string, unknown>): Promise<string> => {
  const context: { teleports?: Record<string, string> } = {};
  const html = await renderToString(
    createSSRApp(Tour, { steps: STEPS, stepId: "one", ...props }),
    context,
  );
  return html + Object.values(context.teleports ?? {}).join("");
};

describe("Tour", () => {
  it("puts the caller's class on the card alongside its own", async () => {
    const classes = cardClasses(await render({ class: "mine" }));
    expect(classes).toContain("mine");
    // Still its own, not replaced by the caller's.
    expect(classes.some((c) => c.startsWith("tour"))).toBe(true);
  });

  it("renders the card's own classes when no class is given", async () => {
    const classes = cardClasses(await render({}));
    expect(classes.length).toBeGreaterThan(0);
    expect(classes).not.toContain("mine");
  });

  it("keeps the variant and size recipes when a class is added", async () => {
    const plain = cardClasses(await render({ size: "lg" }));
    const withClass = cardClasses(await render({ size: "lg", class: "mine" }));
    // The caller's class is additive: everything the recipe produced survives.
    for (const c of plain) expect(withClass).toContain(c);
  });
});
