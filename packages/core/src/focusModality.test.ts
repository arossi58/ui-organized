import { describe, expect, it } from "vitest";
import { FOCUS_MODALITY_ATTRIBUTE, trackFocusModality, type ModalityDocument } from "./focusModality.js";

type Listener = (e?: unknown) => void;

function fakeDocument() {
  const attrs = new Map<string, string>();
  const listeners = new Map<string, Listener[]>();
  const doc = {
    documentElement: {
      getAttribute: (n: string) => attrs.get(n) ?? null,
      setAttribute: (n: string, v: string) => void attrs.set(n, v),
    },
    addEventListener: (type: string, fn: Listener) => listeners.set(type, [...(listeners.get(type) ?? []), fn]),
  };
  const fire = (type: string, e?: unknown) => listeners.get(type)?.forEach((fn) => fn(e));
  const key = (k: string, target: unknown = { tagName: "BODY" }, mods = {}) =>
    fire("keydown", { key: k, metaKey: false, ctrlKey: false, altKey: false, target, ...mods });
  return {
    doc: doc as unknown as ModalityDocument,
    modality: () => attrs.get(FOCUS_MODALITY_ATTRIBUTE),
    pointer: () => fire("pointerdown"),
    key,
    listenerCount: () => [...listeners.values()].reduce((n, l) => n + l.length, 0),
  };
}

const textInput = { tagName: "INPUT", type: "text" };

describe("trackFocusModality", () => {
  it("sets nothing until the user does something", () => {
    const d = fakeDocument();
    trackFocusModality(d.doc);
    expect(d.modality()).toBeUndefined();
  });

  it("marks pointer on pointerdown and keyboard on Tab", () => {
    const d = fakeDocument();
    trackFocusModality(d.doc);
    d.pointer();
    expect(d.modality()).toBe("pointer");
    d.key("Tab");
    expect(d.modality()).toBe("keyboard");
  });

  it("keeps pointer while typing into the field that was clicked", () => {
    const d = fakeDocument();
    trackFocusModality(d.doc);
    d.pointer();
    d.key("a", textInput);
    d.key("Enter", { tagName: "TEXTAREA" });
    d.key("x", { tagName: "DIV", isContentEditable: true });
    expect(d.modality()).toBe("pointer");
    d.key("Tab", textInput);
    expect(d.modality()).toBe("keyboard");
  });

  it("treats keys outside text fields as keyboard navigation", () => {
    const d = fakeDocument();
    trackFocusModality(d.doc);
    d.pointer();
    d.key("ArrowRight", { tagName: "INPUT", type: "radio" });
    expect(d.modality()).toBe("keyboard");
  });

  it("ignores shortcuts", () => {
    const d = fakeDocument();
    trackFocusModality(d.doc);
    d.pointer();
    d.key("c", { tagName: "BODY" }, { metaKey: true });
    expect(d.modality()).toBe("pointer");
  });

  it("installs once per document", () => {
    const d = fakeDocument();
    trackFocusModality(d.doc);
    trackFocusModality(d.doc);
    expect(d.listenerCount()).toBe(2);
  });

  it("is a no-op without a document", () => {
    expect(() => trackFocusModality(undefined)).not.toThrow();
  });
});
