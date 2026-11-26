/**
 * Keys and shortcuts: what a key is drawn and called, and whether a keyboard
 * event matches a shortcut. Shared by Kbd, CommandMenu's `hotkey` and anything
 * else that shows or listens for one, in all four libraries.
 *
 * `mod` is the platform's command key: ⌘ (Meta) on Apple platforms, Ctrl on
 * everything else. Write `mod+k`, never `meta+k` or `ctrl+k`, for a shortcut
 * that should feel native everywhere.
 */

export type KeyPlatform = "mac" | "other";

/** The little of `navigator` the platform is read from; core is built without the DOM lib. */
export interface NavigatorLike {
  platform?: string;
  userAgent?: string;
  userAgentData?: { platform?: string };
}

/**
 * `mac` on macOS and iOS, `other` everywhere else, including the server.
 * Components never call this during their first render: what the server drew
 * has to match the first client render, so they start at `other` and switch
 * after mounting.
 */
export function detectPlatform(
  nav: NavigatorLike | undefined = (globalThis as { navigator?: NavigatorLike }).navigator,
): KeyPlatform {
  const text = nav?.userAgentData?.platform || nav?.platform || nav?.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(text) ? "mac" : "other";
}

export interface KeyLabel {
  /** What is drawn on the key: a symbol or a short word. */
  glyph: string;
  /** What a screen reader says. The same as `glyph` when the glyph is already a word. */
  name: string;
}

const same = (word: string): KeyLabel => ({ glyph: word, name: word });

/** Named keys, by every spelling a shortcut might use for them. */
const NAMED: Record<string, { mac: KeyLabel; other: KeyLabel }> = {};
function define(spellings: string[], mac: KeyLabel, other: KeyLabel = mac) {
  for (const spelling of spellings) NAMED[spelling] = { mac, other };
}
define(["mod"], { glyph: "⌘", name: "Command" }, { glyph: "Ctrl", name: "Control" });
define(["meta", "cmd", "command"], { glyph: "⌘", name: "Command" }, same("Meta"));
define(["ctrl", "control"], { glyph: "⌃", name: "Control" }, { glyph: "Ctrl", name: "Control" });
define(["alt", "option", "opt"], { glyph: "⌥", name: "Option" }, same("Alt"));
define(["shift"], { glyph: "⇧", name: "Shift" }, same("Shift"));
define(["enter", "return"], { glyph: "↵", name: "Enter" });
define(["escape", "esc"], { glyph: "Esc", name: "Escape" });
define(["backspace"], { glyph: "⌫", name: "Backspace" }, same("Backspace"));
define(["delete", "del"], { glyph: "⌦", name: "Delete" }, { glyph: "Del", name: "Delete" });
define(["tab"], { glyph: "⇥", name: "Tab" }, same("Tab"));
define(["space"], same("Space"));
define(["up", "arrowup"], { glyph: "↑", name: "Up arrow" });
define(["down", "arrowdown"], { glyph: "↓", name: "Down arrow" });
define(["left", "arrowleft"], { glyph: "←", name: "Left arrow" });
define(["right", "arrowright"], { glyph: "→", name: "Right arrow" });
define(["pageup"], { glyph: "PgUp", name: "Page up" });
define(["pagedown"], { glyph: "PgDn", name: "Page down" });
define(["home"], same("Home"));
define(["end"], same("End"));

/**
 * How one key is drawn and named. Named keys follow the platform (`mod` is ⌘
 * on a Mac, Ctrl elsewhere); a single character is drawn upper case; anything
 * else is drawn as written.
 */
export function formatKey(key: string, platform: KeyPlatform): KeyLabel {
  const named = NAMED[key.toLowerCase()];
  if (named) return named[platform];
  if (key.length === 1) return same(key.toUpperCase());
  return same(key);
}

export interface Hotkey {
  /** The key itself, lower case, in `KeyboardEvent.key` spelling. */
  key: string;
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

/** Spellings a shortcut may use for a key, mapped to `KeyboardEvent.key`. */
const EVENT_KEY: Record<string, string> = {
  esc: "escape",
  return: "enter",
  space: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
};

/** The parts of a shortcut written as `mod+shift+k`, for display: `["mod", "shift", "k"]`. */
export function hotkeyKeys(hotkey: string): string[] {
  // A trailing "+" is the plus key itself: `mod++` is mod and "+".
  const parts = hotkey.split("+");
  if (hotkey.endsWith("++")) return [...parts.slice(0, -2), "+"].filter(Boolean);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** `mod+shift+k` → `{ key: "k", mod: true, shift: true, … }`. Modifier names are case-insensitive. */
export function parseHotkey(hotkey: string): Hotkey {
  const parts = hotkeyKeys(hotkey).map((part) => part.toLowerCase());
  const key = parts.pop() ?? "";
  const has = (...names: string[]) => parts.some((part) => names.includes(part));
  return {
    key: EVENT_KEY[key] ?? key,
    mod: has("mod"),
    ctrl: has("ctrl", "control"),
    meta: has("meta", "cmd", "command"),
    alt: has("alt", "option", "opt"),
    shift: has("shift"),
  };
}

/** The little of a `KeyboardEvent` a match reads. */
export interface KeyEventLike {
  key: string;
  code?: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  /** Where the key was pressed. A shortcut with no modifier never fires in a text field. */
  target?: unknown;
}

const NOT_TEXT = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

/** Whether an event target takes typed text: a text input, a textarea, a select or anything contenteditable. */
export function isTextEntry(target: unknown): boolean {
  if (!target || typeof target !== "object") return false;
  const el = target as { tagName?: string; type?: string; isContentEditable?: boolean };
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toLowerCase();
  if (tag === "textarea" || tag === "select") return true;
  return tag === "input" && !NOT_TEXT.has((el.type || "text").toLowerCase());
}

/**
 * Whether an event is the shortcut, with exactly its modifiers held: `mod+k`
 * does not fire on ⌘⇧K. A letter or digit also matches by `code`, because
 * Option on a Mac turns `k` into `˚`, and another keyboard layout can move it.
 *
 * A shortcut with no modifier, such as `/`, is text when the reader is typing,
 * so it does not match an event from a text field, the menu's own search box
 * included.
 */
export function matchesHotkey(
  event: KeyEventLike,
  hotkey: string | Hotkey,
  platform: KeyPlatform,
): boolean {
  const want = typeof hotkey === "string" ? parseHotkey(hotkey) : hotkey;
  const typed = !want.mod && !want.ctrl && !want.meta && !want.alt;
  if (typed && isTextEntry(event.target)) return false;
  const meta = want.meta || (want.mod && platform === "mac");
  const ctrl = want.ctrl || (want.mod && platform === "other");
  if (event.metaKey !== meta || event.ctrlKey !== ctrl) return false;
  if (event.altKey !== want.alt || event.shiftKey !== want.shift) return false;
  if (event.key.toLowerCase() === want.key) return true;
  if (/^[a-z]$/.test(want.key)) return event.code === `Key${want.key.toUpperCase()}`;
  if (/^[0-9]$/.test(want.key)) return event.code === `Digit${want.key}`;
  return false;
}
