// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { createApp, h, nextTick, type App } from "vue";
import Marquee from "./Marquee.vue";

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
 * synthetic event, and the Vue adapter rewrites it into a real listener name.
 * Nothing throws if that mapping is wrong — the marquee simply never pauses
 * under the pointer, which is a WCAG 2.2.2 problem rather than a visual one.
 */

const items = [
  { id: "a", content: "One" },
  { id: "b", content: "Two" },
];

/**
 * The component's own props, emit handlers included.
 *
 * A loose `Record<string, unknown>` does not type-check against `h()` here:
 * `items` is required, and vue-tsc rejects the call rather than the object. The
 * instance type is the only spelling that covers both the declared props and the
 * `onComplete`-style emit listeners.
 */
type MarqueeMountProps = InstanceType<typeof Marquee>["$props"];

function mount(props: MarqueeMountProps): { host: HTMLElement; app: App } {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const app = createApp({ render: () => h(Marquee, props) });
  app.mount(host);
  return { host, app };
}

const root = (host: HTMLElement) =>
  host.querySelector<HTMLElement>('[data-scope="marquee"][data-part="root"]')!;

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

  it("starts running, and starts paused when told to", () => {
    const running = mount({ items });
    expect(root(running.host).hasAttribute("data-paused")).toBe(false);
    expect(root(running.host).getAttribute("data-state")).toBe("idle");
    running.app.unmount();

    const paused = mount({ items, defaultPaused: true });
    expect(root(paused.host).hasAttribute("data-paused")).toBe(true);
    expect(root(paused.host).getAttribute("data-state")).toBe("paused");
    paused.app.unmount();
  });

  it("pauses under the pointer only when asked to", async () => {
    const { host, app } = mount({ items, pauseOnInteraction: true });
    const el = root(host);

    el.dispatchEvent(new MouseEvent("mouseenter"));
    await nextTick();
    expect(el.hasAttribute("data-paused")).toBe(true);

    el.dispatchEvent(new MouseEvent("mouseleave"));
    await nextTick();
    expect(el.hasAttribute("data-paused")).toBe(false);
    app.unmount();
  });

  it("ignores the pointer without pauseOnInteraction", async () => {
    const { host, app } = mount({ items });
    const el = root(host);

    el.dispatchEvent(new MouseEvent("mouseenter"));
    await nextTick();
    expect(el.hasAttribute("data-paused")).toBe(false);
    app.unmount();
  });
});
