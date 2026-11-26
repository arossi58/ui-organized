import { describe, expect, it } from "vitest";
import { SIDEBAR_NAVIGATION_SELECTOR, isSidebarNavigation } from "./Navigation.styles.js";

/** Just enough of an Element: the closest control the selector finds, and whether it is disabled. */
function target(control: { disabled?: boolean; inside?: boolean } | null) {
  const found = control && {
    matches: (selector: string) => {
      expect(selector).toContain(":disabled");
      return !!control.disabled;
    },
  };
  return {
    closest: (selector: string) => {
      expect(selector).toBe(SIDEBAR_NAVIGATION_SELECTOR);
      return found;
    },
    found,
    inside: control?.inside ?? true,
  };
}

const sidebar = (t: ReturnType<typeof target>) => ({
  contains: (node: unknown) => node === t.found && t.inside,
});

describe("isSidebarNavigation", () => {
  it("counts links, sub-items and items with no sub-pages", () => {
    expect(SIDEBAR_NAVIGATION_SELECTOR).toBe(
      "a[href], .nav-sub-item, .nav-item__trigger:not([aria-expanded])",
    );
    const t = target({});
    expect(isSidebarNavigation(t, sidebar(t))).toBe(true);
  });

  it("does not count a click on nothing that navigates, or outside the sidebar", () => {
    const none = target(null);
    expect(isSidebarNavigation(none, sidebar(none))).toBe(false);
    const outside = target({ inside: false });
    expect(isSidebarNavigation(outside, sidebar(outside))).toBe(false);
    expect(isSidebarNavigation(null, sidebar(none))).toBe(false);
  });

  it("does not count a disabled control", () => {
    const t = target({ disabled: true });
    expect(isSidebarNavigation(t, sidebar(t))).toBe(false);
  });
});
