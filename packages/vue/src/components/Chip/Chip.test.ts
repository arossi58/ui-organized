import { describe, it, expect, vi, afterEach } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import Chip from "./Chip.vue";
import ChipSegment from "./ChipSegment.vue";

/**
 * The chip's structure is its accessibility contract: segments and the dismiss
 * control are siblings, a segment that opens nothing is not a button, and a
 * segment's attributes land on the segment — which is what lets an Ark
 * `as-child` trigger project its click handler onto exactly one part.
 */
/** Without Vue's SSR fragment markers, which say nothing about the tree. */
const render = async (node: () => ReturnType<typeof h>) =>
  (await renderToString(createSSRApp({ render: node }))).replace(/<!--[^]*?-->/g, "");

describe("Chip", () => {
  // No icon set is registered here, so the dismiss `Icon` warns once.
  afterEach(() => vi.restoreAllMocks());

  it("renders shorthand parts as static span segments, operator spelled", async () => {
    const html = await render(() => h(Chip, { label: "Role", operator: "is any of", value: "Admin" }));
    expect(html).toContain('role="group"');
    expect(html).toContain('<span class="chip__segment chip__segment--label">Role</span>');
    expect(html).toContain('<span class="chip__segment chip__segment--operator">is any of</span>');
    expect(html).toContain('<span class="chip__segment chip__segment--value">Admin</span>');
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<svg");
  });

  it("makes a composed segment with a click handler its own button", async () => {
    const html = await render(() =>
      h(Chip, { selected: true }, () => [
        h(ChipSegment, { part: "operator", onClick: () => {}, "aria-expanded": "true" }, () => "is"),
      ]),
    );
    expect(html).toContain("chip chip--selected");
    expect(html).toMatch(/<button[^>]*aria-expanded="true"[^>]*class="chip__segment chip__segment--operator"/);
  });

  it("disables every segment it holds", async () => {
    const html = await render(() =>
      h(Chip, { disabled: true, label: "Role" }, () => [h(ChipSegment, null, () => "Admin")]),
    );
    expect(html.match(/<button[^>]*disabled/g)).toHaveLength(2);
  });

  it("keeps the dismiss control a sibling of the segments", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = await render(() =>
      h(Chip, { label: "Role", removable: true, removeLabel: "Remove role filter" }),
    );
    expect(html).toContain('aria-label="Remove role filter"');
    expect(html).not.toMatch(/<button[^>]*>[^]*<button[^>]*>[^]*<\/button>[^]*<\/button>/);
  });
});
