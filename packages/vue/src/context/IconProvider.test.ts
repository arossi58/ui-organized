import { describe, it, expect, vi, afterEach } from "vitest";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import StyleProp from "./StyleProp.fixture.vue";

/**
 * Why `IconProvider`'s outline/solid prop is called `iconStyle` here and `style`
 * everywhere else.
 *
 * This is the one place the three libraries' public APIs diverge, so the reason
 * is pinned rather than left as a comment: Vue reserves `style`, and a value
 * written under that name never arrives. The template compiler parses
 * `style="solid"` into a style *object* before props are resolved, so what the
 * component receives is `{}` — truthy, wrongly typed, and silently not "solid".
 *
 * If a future Vue release stops doing that, this test fails and the extra prop
 * can go.
 */
describe("IconProvider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("cannot receive the outline/solid setting as `style` — Vue mangles it", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = await renderToString(createSSRApp(StyleProp));

    // The setting never arrives, so the provider falls back to its default —
    // "outline" for an app that plainly asked for solid. This is the whole
    // reason `iconStyle` exists, and the failure it prevents is silent.
    expect(html).toContain('data-icon-style="&quot;outline&quot;"');
    expect(html).not.toContain("solid");

    // The value did reach the component, just not intact — which is how the
    // wrong spelling can be intercepted and named rather than ignored. Silence
    // would leave a consumer with outline icons and no explanation.
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("icon-style");
  });
});
