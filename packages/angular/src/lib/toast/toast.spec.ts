import { ApplicationRef, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UioToaster } from "./toast.js";

/**
 * The imperative surface, which nothing else can reach.
 *
 * The browser parity gate fires two toasts and compares the markup, and that is
 * all it can do: `close` and `update` have no static rendering to be compared
 * against, the auto-dismiss is a timer, and hover-to-pause is a state no
 * screenshot shows. All of it is the *service*, which is the part of this
 * component that is Angular's own shape rather than a reproduction of Ark's DOM.
 *
 * No host component. `UioToaster` is `providedIn: "root"` and renders its region
 * into a CDK overlay the first time something is added, so a spec asks the
 * injector for it exactly as an application would — which is itself the claim
 * worth testing, since the alternative shape would have needed a provider
 * component in every one of these cases.
 */
describe("UioToaster", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  const setup = () => {
    const toaster = TestBed.inject(UioToaster);
    const appRef = TestBed.inject(ApplicationRef);
    const flush = () => {
      try {
        appRef.tick();
      } catch {
        // Already inside a pass — see `overlay/flush.ts`.
      }
    };
    const group = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="group"]');
    const roots = () => [
      ...document.querySelectorAll<HTMLElement>('.cdk-overlay-container [data-part="root"]'),
    ];
    const textOf = (root: HTMLElement, part: string) =>
      root.querySelector<HTMLElement>(`[data-part="${part}"]`)?.textContent;
    /** One frame, which is where `data-mounted` lands. */
    const frame = () => {
      vi.advanceTimersByTime(20);
      flush();
    };
    return { toaster, flush, group, roots, textOf, frame };
  };

  it("creates its region on the first toast and not before", () => {
    // The whole reason this is a service and not a provider component: an
    // application that never toasts must render nothing at all.
    const { toaster, group, roots } = setup();
    expect(group()).toBeNull();

    toaster.add({ title: "Saved", type: "success" });
    expect(group()).not.toBeNull();
    expect(roots().length).toBe(1);
    expect(roots()[0]!.getAttribute("data-type")).toBe("success");
    expect(roots()[0]!.classList.contains("toast__root--success")).toBe(true);
  });

  it("keeps an unrecognised type on the attribute and falls back for the styling", () => {
    // Zag reports `type` verbatim so an application can key its own CSS off it,
    // while only the four statuses have an accent and an icon in this system.
    const { toaster, roots } = setup();
    toaster.add({ title: "Deployed", type: "deploy-finished" });
    expect(roots()[0]!.getAttribute("data-type")).toBe("deploy-finished");
    expect(roots()[0]!.classList.contains("toast__root--info")).toBe(true);
  });

  it("marks itself mounted a frame after it opens, never in the same tick", () => {
    /**
     * The race the browser gate had to learn to wait for. An entrance transition
     * needs one frame at the "before" state, so `data-state="open"` lands first
     * and `data-mounted` follows — a toast that reported both at once would jump
     * into place with no animation at all.
     */
    const { toaster, roots, frame } = setup();
    toaster.add({ title: "Saved" });
    expect(roots()[0]!.getAttribute("data-state")).toBe("open");
    expect(roots()[0]!.hasAttribute("data-mounted")).toBe(false);

    frame();
    expect(roots()[0]!.hasAttribute("data-mounted")).toBe(true);
  });

  it("stacks the newest toast first and marks the ends of the stack", () => {
    const { toaster, roots, textOf } = setup();
    toaster.add({ title: "First" });
    toaster.add({ title: "Second" });
    // Zag unshifts, so the newest is the frontmost — and `data-first` /
    // `data-sibling` are how the stylesheet could ever tell them apart.
    expect(textOf(roots()[0]!, "title")).toBe("Second");
    expect(roots()[0]!.hasAttribute("data-first")).toBe(true);
    expect(roots()[0]!.hasAttribute("data-sibling")).toBe(false);
    expect(roots()[1]!.hasAttribute("data-sibling")).toBe(true);
  });

  it("closes to the exit state first, and leaves the DOM after it", () => {
    /**
     * Removing the element on `close` would be simpler and would delete the
     * transition: `.toast__root[data-state="closed"]` fades it out, and there has
     * to be an element left to fade.
     */
    const { toaster, roots, flush } = setup();
    const id = toaster.add({ title: "Saved" });
    toaster.close(id);
    expect(roots().length).toBe(1);
    expect(roots()[0]!.getAttribute("data-state")).toBe("closed");

    vi.advanceTimersByTime(250);
    flush();
    expect(roots().length).toBe(0);
  });

  it("dismisses itself when its time is up", () => {
    const { toaster, roots, flush } = setup();
    toaster.add({ title: "Saved" });
    vi.advanceTimersByTime(4999);
    flush();
    expect(roots()[0]!.getAttribute("data-state")).toBe("open");

    vi.advanceTimersByTime(2);
    flush();
    expect(roots()[0]!.getAttribute("data-state")).toBe("closed");
  });

  it("never dismisses a toast whose duration is infinite", () => {
    const { toaster, roots, flush } = setup();
    toaster.add({ title: "Uploading", duration: Infinity });
    vi.advanceTimersByTime(60_000);
    flush();
    expect(roots()[0]!.getAttribute("data-state")).toBe("open");
  });

  it("updates a live toast in place, and restarts its countdown", () => {
    /**
     * In place, meaning the same element: an update that removed and re-added
     * would replay the entrance animation and re-announce the whole toast to a
     * screen reader, which is the opposite of what "update" means.
     *
     * The countdown restarts because an update is new information — leaving the
     * old timer running would hide the new message after the time the *previous*
     * one had already spent on screen.
     */
    const { toaster, roots, textOf, frame, flush } = setup();
    const id = toaster.add({ title: "Uploading", type: "info" });
    frame();
    const element = roots()[0]!;

    vi.advanceTimersByTime(4000);
    toaster.update(id, { title: "Uploaded", type: "success" });
    flush();
    expect(roots()[0]).toBe(element);
    expect(textOf(element, "title")).toBe("Uploaded");
    expect(element.getAttribute("data-type")).toBe("success");
    // Still mounted: an update is not a new entrance.
    expect(element.hasAttribute("data-mounted")).toBe(true);

    // The original 5s would have expired 3s ago.
    vi.advanceTimersByTime(3000);
    flush();
    expect(element.getAttribute("data-state")).toBe("open");
  });

  it("carries forward the fields an update does not mention", () => {
    const { toaster, roots, textOf, flush } = setup();
    const id = toaster.add({ title: "Uploading", description: "12 files", type: "info" });
    toaster.update(id, { title: "Uploaded" });
    flush();
    expect(textOf(roots()[0]!, "description")).toBe("12 files");
  });

  it("ignores close and update for a toast that is not there", () => {
    // Both are called with an id the caller has been holding on to, and the
    // toast may well have dismissed itself in the meantime.
    const { toaster } = setup();
    expect(() => toaster.close("toast:gone")).not.toThrow();
    expect(() => toaster.update("toast:gone", { title: "?" })).not.toThrow();
  });

  it("holds the countdown while paused, and banks what was left of it", () => {
    /**
     * The remaining time has to be *banked* when the timer is cleared. Resuming
     * with the full duration is the easy mistake and it is invisible in every
     * test that pauses for less time than it has left.
     */
    const { toaster, roots, flush } = setup();
    toaster.add({ title: "Saved" });

    vi.advanceTimersByTime(4000);
    toaster.pause();
    expect(roots()[0]!.hasAttribute("data-paused")).toBe(true);

    vi.advanceTimersByTime(30_000);
    flush();
    expect(roots()[0]!.getAttribute("data-state")).toBe("open");

    toaster.resume();
    expect(roots()[0]!.hasAttribute("data-paused")).toBe(false);
    // One second was left, not five.
    vi.advanceTimersByTime(1100);
    flush();
    expect(roots()[0]!.getAttribute("data-state")).toBe("closed");
  });

  it("banks the elapsed time once, however many times it is paused", () => {
    // The region pauses on pointer *and* on focus, so both fire when a user tabs
    // into a toast they are already hovering. Subtracting the same elapsed time
    // twice leaves nothing on the clock and dismisses the toast the moment the
    // pointer leaves — which is the exact opposite of what pausing is for.
    const { toaster, roots, flush } = setup();
    toaster.add({ title: "Saved" });
    vi.advanceTimersByTime(4000);
    toaster.pause();
    toaster.pause();
    toaster.resume();

    vi.advanceTimersByTime(900);
    flush();
    expect(roots()[0]!.getAttribute("data-state")).toBe("open");
    vi.advanceTimersByTime(200);
    flush();
    expect(roots()[0]!.getAttribute("data-state")).toBe("closed");
  });

  it("names its title and its description, and only when they exist", () => {
    // A dangling `aria-labelledby` outranks everything beside it, so an empty
    // title must not be referenced at all.
    const { toaster, roots } = setup();
    toaster.add({ title: "Saved" });
    const root = roots()[0]!;
    expect(root.getAttribute("aria-labelledby")).toBe(
      root.querySelector('[data-part="title"]')!.id,
    );
    expect(root.hasAttribute("aria-describedby")).toBe(false);
  });

  it("closes everything at once", () => {
    const { toaster, roots } = setup();
    toaster.add({ title: "One" });
    toaster.add({ title: "Two" });
    toaster.closeAll();
    expect(roots().every((root) => root.getAttribute("data-state") === "closed")).toBe(true);
  });
});
