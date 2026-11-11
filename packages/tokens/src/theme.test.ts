import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTheme, initTheme, setTheme, toggleTheme } from "./theme.js";

type Scheme = "dark" | "light" | "no-preference";

/** Minimal browser stand-ins: <html> attributes, localStorage, matchMedia. */
function stubBrowser(initial: Scheme) {
  let scheme: Scheme = initial;
  const attrs = new Map<string, string>();
  const store = new Map<string, string>();
  const listeners = new Set<() => void>();

  vi.stubGlobal("document", {
    documentElement: {
      getAttribute: (k: string) => attrs.get(k) ?? null,
      setAttribute: (k: string, v: string) => void attrs.set(k, v),
    },
  });
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal("window", {
    matchMedia: (q: string) => ({
      get matches() {
        return q.includes(scheme);
      },
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }),
  });

  return {
    store,
    listeners,
    changeScheme(next: Scheme) {
      scheme = next;
      for (const fn of [...listeners]) fn();
    },
  };
}

describe("initTheme", () => {
  let env: ReturnType<typeof stubBrowser>;
  beforeEach(() => {
    env = stubBrowser("dark");
  });
  afterEach(() => {
    setTheme("system"); // detach any listener before the globals go
    vi.unstubAllGlobals();
  });

  it("follows a dark OS preference without persisting it", () => {
    expect(initTheme()).toBe("dark");
    expect(getTheme()).toBe("dark");
    expect(env.store.size).toBe(0);
  });

  it("resolves no-preference to the light fallback, not dark", () => {
    env = stubBrowser("no-preference");
    expect(initTheme()).toBe("light");
  });

  it("honours an explicit fallback, positionally or as an option", () => {
    env = stubBrowser("no-preference");
    expect(initTheme("dark")).toBe("dark");
    expect(initTheme({ fallback: "dark" })).toBe("dark");
  });

  it("tracks OS changes until the user chooses", () => {
    initTheme();
    env.changeScheme("light");
    expect(getTheme()).toBe("light");

    toggleTheme(); // explicit choice: dark, persisted, stops following
    expect(getTheme()).toBe("dark");
    expect(env.store.get("ds-theme")).toBe("dark");
    env.changeScheme("light");
    expect(getTheme()).toBe("dark");
  });

  it("prefers a stored choice over the OS", () => {
    env.store.set("ds-theme", "light");
    expect(initTheme()).toBe("light");
    env.changeScheme("dark");
    expect(getTheme()).toBe("light");
  });

  it('setTheme("system") forgets the choice and follows the OS again', () => {
    setTheme("light");
    setTheme("system");
    expect(env.store.has("ds-theme")).toBe(false);
    expect(getTheme()).toBe("dark");
    env.changeScheme("light");
    expect(getTheme()).toBe("light");
  });
});
