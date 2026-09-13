/**
 * Where the selected framework comes from.
 *
 * The failure this guards against is silent: a link that says `?framework=vue`
 * opening on React, or a preference that quietly resets on every page, both look
 * like the switcher "not working" and neither throws anything.
 */
import { describe, it, expect } from "vitest";
import {
  DEFAULT_FRAMEWORK,
  FRAMEWORK_PARAM,
  FRAMEWORK_STORAGE_KEY,
  readStoredFramework,
  resolveFramework,
  withFramework,
  writeStoredFramework,
  type FrameworkStore,
} from "./frameworkState";

function fakeStore(initial: Record<string, string> = {}): FrameworkStore & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("resolveFramework", () => {
  it("defaults to React", () => {
    expect(resolveFramework(null, null)).toBe("react");
    expect(DEFAULT_FRAMEWORK).toBe("react");
  });

  it("prefers the URL over the stored preference", () => {
    // A shared link is someone showing you Vue; the reader's last visit is not a
    // reason to override that.
    expect(resolveFramework("vue", "svelte")).toBe("vue");
  });

  it("falls back to the stored preference when the URL says nothing", () => {
    expect(resolveFramework(null, "svelte")).toBe("svelte");
    expect(resolveFramework(undefined, "angular")).toBe("angular");
  });

  it("ignores a value that isn't a framework", () => {
    // A hand-edited or stale URL must not leave the page in a state no code
    // block knows how to render.
    expect(resolveFramework("solid", "svelte")).toBe("svelte");
    expect(resolveFramework("", null)).toBe("react");
    expect(resolveFramework("vue2", "qwik")).toBe("react");
  });
});

describe("persistence", () => {
  it("round-trips through storage", () => {
    const store = fakeStore();
    writeStoredFramework("svelte", store);
    expect(store.data[FRAMEWORK_STORAGE_KEY]).toBe("svelte");
    expect(readStoredFramework(store)).toBe("svelte");
  });

  it("ignores a stored value that isn't a framework", () => {
    expect(readStoredFramework(fakeStore({ [FRAMEWORK_STORAGE_KEY]: "ember" }))).toBeNull();
    expect(readStoredFramework(fakeStore())).toBeNull();
  });

  it("survives a browser that refuses storage", () => {
    // Safari's private mode throws on the write, and some embeddings throw on
    // the property access itself. Losing the preference is fine; losing the page
    // is not.
    const hostile: FrameworkStore = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
    };
    expect(readStoredFramework(hostile)).toBeNull();
    expect(() => writeStoredFramework("vue", hostile)).not.toThrow();
    expect(readStoredFramework(null)).toBeNull();
    expect(() => writeStoredFramework("vue", null)).not.toThrow();
  });
});

describe("withFramework", () => {
  it("round-trips through the query string", () => {
    const next = withFramework(new URLSearchParams(), "angular");
    expect(next.get(FRAMEWORK_PARAM)).toBe("angular");
    expect(resolveFramework(next.get(FRAMEWORK_PARAM), null)).toBe("angular");
  });

  it("keeps every other param and replaces its own", () => {
    const next = withFramework(new URLSearchParams("tab=props&framework=vue"), "svelte");
    expect(next.get("tab")).toBe("props");
    expect(next.getAll(FRAMEWORK_PARAM)).toEqual(["svelte"]);
  });

  it("does not mutate the params it was given", () => {
    const current = new URLSearchParams("framework=vue");
    withFramework(current, "svelte");
    expect(current.get(FRAMEWORK_PARAM)).toBe("vue");
  });
});
