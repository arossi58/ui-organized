import { describe, expect, it } from "vitest";
import {
  APP_SHELL_BREAKPOINT,
  appShellDataLayout,
  appShellNarrowQuery,
  appShellStyles,
  resolveAppShellLayout,
} from "./AppShell.styles.js";

describe("AppShell layout", () => {
  it("is a rail until the viewport is measured, so the server and first render agree", () => {
    expect(resolveAppShellLayout("auto", undefined)).toBe("rail");
    expect(appShellDataLayout("auto", undefined)).toBeUndefined();
  });

  it("follows the viewport once measured", () => {
    expect(resolveAppShellLayout("auto", true)).toBe("sheet");
    expect(resolveAppShellLayout("auto", false)).toBe("rail");
    expect(appShellDataLayout("auto", true)).toBe("sheet");
  });

  it("keeps a forced layout whatever the viewport", () => {
    for (const narrow of [undefined, true, false]) {
      expect(resolveAppShellLayout("rail", narrow)).toBe("rail");
      expect(resolveAppShellLayout("sheet", narrow)).toBe("sheet");
      // Known on the server too, so the attribute is there from the first byte.
      expect(appShellDataLayout("sheet", narrow)).toBe("sheet");
    }
  });

  it("names narrow as at or below the breakpoint", () => {
    expect(APP_SHELL_BREAKPOINT).toBe(900);
    expect(appShellNarrowQuery()).toBe("(max-width: 900px)");
    expect(appShellNarrowQuery(640)).toBe("(max-width: 640px)");
  });

  it("scrolls the page by default", () => {
    expect(appShellStyles()).toBe("app-shell app-shell--scroll-page");
    expect(appShellStyles({ scroll: "main" })).toBe("app-shell app-shell--scroll-main");
  });
});
