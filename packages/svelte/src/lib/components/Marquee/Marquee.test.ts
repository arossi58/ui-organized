import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import Marquee from "./Marquee.svelte";

/**
 * Marquee's run state, which the parity gate can only see stopped.
 *
 * The scroll itself is a CSS animation over custom properties zag computes from
 * a measured track, so there is nothing to assert about it in jsdom, which lays
 * nothing out. What *is* machine state — and what the gate renders exactly one
 * frame of — is paused versus running, and `data-paused` is what Marquee.css
 * selects on to stop the animation.
 *
 * `pauseOnInteraction` is the interesting half: React's `onMouseEnter` is a
 * synthetic event, and the Svelte adapter lowercases it into a real DOM
 * listener. Nothing throws if that mapping is wrong — the marquee simply never
 * pauses under the pointer, which is a WCAG 2.2.2 problem rather than a visual
 * one.
 */

const items = [
  { id: "a", content: "One" },
  { id: "b", content: "Two" },
];
const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-scope="marquee"][data-part="root"]')!;

describe("Marquee", () => {
  // jsdom ships no ResizeObserver, and the machine measures the track with one
  // the moment it mounts. A stub rather than a polyfill: jsdom lays nothing out,
  // so a real implementation would only ever report zeroes — and the sizes are
  // not what these tests are about.
  beforeAll(() => {
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });

  it("starts running, and starts paused when told to", async () => {
    const running = render(Marquee, { props: { items } });
    expect(root(running.container).hasAttribute("data-paused")).toBe(false);
    expect(root(running.container).getAttribute("data-state")).toBe("idle");
    running.unmount();

    const paused = render(Marquee, { props: { items, defaultPaused: true } });
    expect(root(paused.container).hasAttribute("data-paused")).toBe(true);
    expect(root(paused.container).getAttribute("data-state")).toBe("paused");
  });

  it("pauses under the pointer only when asked to", async () => {
    const { container } = render(Marquee, { props: { items, pauseOnInteraction: true } });
    const el = root(container);

    el.dispatchEvent(new MouseEvent("mouseenter"));
    await tick();
    expect(el.hasAttribute("data-paused")).toBe(true);

    el.dispatchEvent(new MouseEvent("mouseleave"));
    await tick();
    expect(el.hasAttribute("data-paused")).toBe(false);
  });

  it("pauses when focus reaches something inside it", async () => {
    // The keyboard half of WCAG 2.2.2: a user tabbing into moving content must
    // be able to stop it. zag asks for `onFocusCapture`, which the Svelte
    // adapter lowercases to `onfocuscapture` — a *capture-phase* `focus`
    // listener. That matters: `focus` does not bubble, so a bubble-phase
    // listener on the root would never hear it and the marquee would keep
    // scrolling under the caret. Capture propagates downward, so it does.
    const { container } = render(Marquee, { props: { items, pauseOnInteraction: true } });
    const el = root(container);
    const inner = el.querySelector<HTMLElement>('[data-part="item"]')!;
    inner.tabIndex = 0;

    inner.dispatchEvent(new FocusEvent("focus", { bubbles: false }));
    await tick();
    expect(el.hasAttribute("data-paused")).toBe(true);
  });

  it("ignores the pointer without pauseOnInteraction", async () => {
    const { container } = render(Marquee, { props: { items } });
    const el = root(container);

    el.dispatchEvent(new MouseEvent("mouseenter"));
    await tick();
    expect(el.hasAttribute("data-paused")).toBe(false);
  });
});
