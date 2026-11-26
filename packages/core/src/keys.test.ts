import { describe, expect, it } from "vitest";
import { detectPlatform, formatKey, hotkeyKeys, matchesHotkey, parseHotkey } from "./keys.js";
import { createContains } from "./contains.js";

const press = (
  key: string,
  mods: Partial<Record<"meta" | "ctrl" | "alt" | "shift", boolean>> = {},
  code?: string,
) => ({
  key,
  code,
  metaKey: !!mods.meta,
  ctrlKey: !!mods.ctrl,
  altKey: !!mods.alt,
  shiftKey: !!mods.shift,
});

describe("detectPlatform", () => {
  it("reads Apple platforms as mac, from any of the three places a browser says so", () => {
    expect(detectPlatform({ userAgentData: { platform: "macOS" } })).toBe("mac");
    expect(detectPlatform({ platform: "MacIntel" })).toBe("mac");
    expect(
      detectPlatform({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }),
    ).toBe("mac");
  });

  it("reads everything else, and no navigator at all, as other", () => {
    expect(detectPlatform({ platform: "Linux x86_64" })).toBe("other");
    expect(detectPlatform({ userAgentData: { platform: "Windows" } })).toBe("other");
    expect(detectPlatform({})).toBe("other");
  });
});

describe("formatKey", () => {
  it("draws mod as the platform's command key, and names it", () => {
    expect(formatKey("mod", "mac")).toEqual({ glyph: "⌘", name: "Command" });
    expect(formatKey("mod", "other")).toEqual({ glyph: "Ctrl", name: "Control" });
  });

  it("gives a symbol a spoken name, and leaves a word as it is", () => {
    expect(formatKey("shift", "mac")).toEqual({ glyph: "⇧", name: "Shift" });
    expect(formatKey("shift", "other")).toEqual({ glyph: "Shift", name: "Shift" });
    expect(formatKey("Escape", "mac")).toEqual({ glyph: "Esc", name: "Escape" });
    expect(formatKey("up", "other")).toEqual({ glyph: "↑", name: "Up arrow" });
  });

  it("draws a single character upper case and anything else as written", () => {
    expect(formatKey("k", "mac")).toEqual({ glyph: "K", name: "K" });
    expect(formatKey("/", "other")).toEqual({ glyph: "/", name: "/" });
    expect(formatKey("F5", "other")).toEqual({ glyph: "F5", name: "F5" });
  });
});

describe("parseHotkey and hotkeyKeys", () => {
  it("splits a shortcut into its keys, keeping a trailing plus as the plus key", () => {
    expect(hotkeyKeys("mod+shift+k")).toEqual(["mod", "shift", "k"]);
    expect(hotkeyKeys("mod++")).toEqual(["mod", "+"]);
  });

  it("reads modifiers by any spelling and the key in KeyboardEvent spelling", () => {
    expect(parseHotkey("Mod+Shift+K")).toEqual({
      key: "k",
      mod: true,
      ctrl: false,
      meta: false,
      alt: false,
      shift: true,
    });
    expect(parseHotkey("cmd+opt+esc")).toMatchObject({ key: "escape", meta: true, alt: true });
  });
});

describe("matchesHotkey", () => {
  it("takes mod as Meta on a Mac and Ctrl elsewhere", () => {
    expect(matchesHotkey(press("k", { meta: true }), "mod+k", "mac")).toBe(true);
    expect(matchesHotkey(press("k", { ctrl: true }), "mod+k", "mac")).toBe(false);
    expect(matchesHotkey(press("k", { ctrl: true }), "mod+k", "other")).toBe(true);
    expect(matchesHotkey(press("k", { meta: true }), "mod+k", "other")).toBe(false);
  });

  it("wants exactly the modifiers written, no more", () => {
    expect(matchesHotkey(press("K", { meta: true, shift: true }), "mod+k", "mac")).toBe(false);
    expect(matchesHotkey(press("K", { meta: true, shift: true }), "mod+shift+k", "mac")).toBe(true);
    expect(matchesHotkey(press("k"), "mod+k", "mac")).toBe(false);
  });

  it("never fires a modifier-less shortcut while the reader types in a field", () => {
    const input = { tagName: "INPUT", type: "search" };
    expect(matchesHotkey({ ...press("/"), target: input }, "/", "other")).toBe(false);
    expect(
      matchesHotkey(
        { ...press("/"), target: { tagName: "DIV", isContentEditable: true } },
        "/",
        "other",
      ),
    ).toBe(false);
    expect(
      matchesHotkey(
        { ...press("/"), target: { tagName: "INPUT", type: "checkbox" } },
        "/",
        "other",
      ),
    ).toBe(true);
    expect(matchesHotkey({ ...press("/"), target: { tagName: "BODY" } }, "/", "other")).toBe(true);
    // With a modifier it is a command, not text, and fires from anywhere.
    expect(matchesHotkey({ ...press("k", { ctrl: true }), target: input }, "mod+k", "other")).toBe(
      true,
    );
  });

  it("falls back to the physical key, which Option on a Mac rewrites", () => {
    expect(matchesHotkey(press("˚", { meta: true, alt: true }, "KeyK"), "mod+alt+k", "mac")).toBe(
      true,
    );
    expect(matchesHotkey(press("/", {}, "Slash"), "/", "other")).toBe(true);
  });
});

describe("createContains", () => {
  const contains = createContains("en");

  it("ignores case and accents, as zag's filter does", () => {
    expect(contains("Café", "cafe")).toBe(true);
    expect(contains("Apple", "APP")).toBe(true);
    expect(contains("Open settings", "sett")).toBe(true);
  });

  it("matches a substring anywhere, and an empty query everywhere", () => {
    expect(contains("Toggle theme", "theme")).toBe(true);
    expect(contains("Toggle theme", "dark")).toBe(false);
    expect(contains("Anything", "")).toBe(true);
  });
});
