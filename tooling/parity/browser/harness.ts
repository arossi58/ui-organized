/**
 * The half of the browser gate that runs in the page.
 *
 * Deliberately almost empty. Which states to drive, which subtrees to compare
 * and what counts as a difference all live in the Playwright spec, so the page
 * has no opinion the three frameworks could implement differently — it reads a
 * component name and a props object out of the URL and mounts one thing.
 */

export interface HarnessCase {
  component: string;
  props: Record<string, unknown>;
}

export function caseFromUrl(): HarnessCase {
  const params = new URLSearchParams(location.search);
  const component = params.get("component");
  if (!component) throw new Error("parity harness: ?component= is required");
  const raw = params.get("props");
  return { component, props: raw ? JSON.parse(raw) : {} };
}

/**
 * Two frames, not one.
 *
 * The three renderers commit at different points — React inside `flushSync`,
 * Svelte after its effect queue drains, Vue after `nextTick` — and Ark schedules
 * its own measurement on top of that. Waiting a fixed number of frames is
 * uniform across all three, where each framework's own "done" signal would mean
 * a subtly different moment. The spec still waits on the state it expects, so
 * this only has to be enough to mount, never enough to settle an animation.
 */
export function signalReady(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.documentElement.setAttribute("data-parity-ready", ""));
  });
}

export function mountPoint(): HTMLElement {
  const el = document.getElementById("mount");
  if (!el) throw new Error("parity harness: #mount is missing");
  return el;
}
