import { describe, it, expect, vi, afterEach } from "vitest";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import DismissListener from "./DismissListener.fixture.vue";

/**
 * Why Alert's dismiss callback is a prop and not an emit.
 *
 * React and Svelte render the dismiss button on the *presence* of `onDismiss` —
 * the prop is the switch. Angular could not follow, because an `output()` exists
 * whether or not anyone subscribed, so it took an explicit `dismissible` input
 * instead. Vue can follow, but only because a declared prop wins over an emit
 * listener during prop resolution: `@dismiss` compiles to an `onDismiss` key,
 * and a component that declares `onDismiss` receives it as a prop rather than
 * having it swallowed by `defineEmits`.
 *
 * That is a Vue internal, so it is pinned here rather than asserted in a
 * comment. If it ever stops holding, `@dismiss` silently renders no button and
 * the only symptom is an alert nobody can close.
 */
describe("Alert", () => {
  // No icon set is registered in a unit test, so `Icon` says so — once, loudly,
  // and irrelevantly to what is being asserted here.
  afterEach(() => vi.restoreAllMocks());

  it("renders the dismiss button for @dismiss and :on-dismiss alike, and for neither otherwise", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = await renderToString(createSSRApp(DismissListener));
    const buttons = html.match(/class="alert__dismiss"/g) ?? [];
    expect(buttons).toHaveLength(2);

    // Positional rather than parsed: the third alert is the one with no
    // callback, and it is the half of the claim that would still pass if the
    // button were simply always rendered.
    const neither = html.slice(html.indexOf('data-case="neither"'));
    expect(neither).not.toContain("alert__dismiss");
  });
});
