import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { Component, computed, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UIO_PART_ATTRIBUTES, UioPart, stateFlag } from "./part.js";

/**
 * The base directive is the only thing standing between a hand-written Angular
 * component and a control that renders perfectly while reporting none of its
 * state. These assertions are about that, not about Angular.
 */

/**
 * Signals rather than `input()`s, deliberately.
 *
 * These probes are compiled by the JIT compiler, and **JIT does not register
 * initializer-based inputs**: `input()` is read for its default and never
 * bound, so `setInput` silently does nothing. That is not a problem for the
 * library — ng-packagr compiles it ahead of time and its inputs are real — but
 * it does mean a spec cannot exercise them, so input binding is covered by the
 * parity harness, which runs against the built package the way a consumer does.
 * What is under test here is the base's bindings, and a writable signal drives
 * those exactly as an input would.
 */
@Component({ selector: "probe-part", standalone: true, template: "" })
class ProbePart extends UioPart {
  readonly scope = "probe";
  readonly part = "root";
  readonly on = signal(false);
  override readonly state = computed(() => (this.on() ? "open" : "closed"));
  override readonly disabled = signal(false);
  override readonly highlighted = signal(false);
}

/** Reports nothing beyond its identity, which is the common case. */
@Component({ selector: "quiet-part", standalone: true, template: "" })
class QuietPart extends UioPart {
  readonly scope = "quiet";
  readonly part = "item";
}

const require = createRequire(import.meta.url);
const CORE = dirname(require.resolve("@ui-organized/core/package.json"));

/**
 * Only the attributes the library is responsible for. TestBed stamps its own
 * `id` and `ng-version` on the host, which say nothing about the part.
 */
function attributesOf(element: Element): Record<string, string> {
  return Object.fromEntries(
    [...element.attributes]
      .filter((attribute) => attribute.name.startsWith("data-"))
      .map((attribute) => [attribute.name, attribute.value]),
  );
}

describe("stateFlag", () => {
  it("writes a boolean the way the stylesheets read one", () => {
    // `[data-disabled]` matches `="false"` too, so the natural Angular spelling
    // would apply every disabled style to every enabled control.
    expect(stateFlag(true)).toBe("");
    expect(stateFlag(false)).toBeNull();
    expect(stateFlag(undefined)).toBeNull();
  });
});

describe("UioPart", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it("identifies the part, and reports only the state it has", () => {
    const fixture = TestBed.createComponent(QuietPart);
    fixture.detectChanges();
    // Every unreported attribute must be *absent*, not empty: the CSS selects on
    // presence, so an always-emitted `data-disabled=""` disables everything.
    expect(attributesOf(fixture.nativeElement)).toEqual({
      "data-scope": "quiet",
      "data-part": "item",
    });
  });

  it("tracks a signal state through change detection", () => {
    const fixture = TestBed.createComponent(ProbePart);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-state")).toBe("closed");

    fixture.componentInstance.on.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-state")).toBe("open");
  });

  it("lets a subclass replace a base signal", () => {
    // Load-bearing, and only true because this package compiles with
    // `useDefineForClassFields: false`. With the flag on, a subclass field
    // initialiser runs *after* the base constructor and overwrites the base's
    // signal with undefined at the moment the host binding reads it — every
    // state attribute in the library would throw on first render.
    const fixture = TestBed.createComponent(ProbePart);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-disabled")).toBe("");

    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.hasAttribute("data-disabled")).toBe(false);
  });

  it("binds every attribute it claims to, and nothing else", () => {
    const fixture = TestBed.createComponent(ProbePart);
    // Everything on at once, so no attribute is missing merely because it is
    // false — the failure mode this whole directive exists to prevent.
    const everything = fixture.componentInstance as unknown as Record<string, unknown>;
    for (const key of [
      "invalid", "readOnly", "focus", "focusVisible", "hover", "selected",
    ]) {
      everything[key] = signal(true);
    }
    everything["orientation"] = signal("vertical");
    fixture.componentInstance.disabled.set(true);
    fixture.componentInstance.highlighted.set(true);
    fixture.componentInstance.on.set(true);
    fixture.detectChanges();

    expect(Object.keys(attributesOf(fixture.nativeElement)).sort()).toEqual(
      [...UIO_PART_ATTRIBUTES].sort(),
    );
  });

  it("only claims attributes the shared stylesheets actually read", () => {
    // An attribute bound here that no CSS selects on is dead weight on every
    // element in the library. The contract is derived from the real stylesheets,
    // so this cannot drift into being true.
    const contract = JSON.parse(
      readFileSync(join(CORE, "state-contract.json"), "utf8"),
    ) as { components: Record<string, { attributes: Record<string, string[]> }> };
    const read = new Set(
      Object.values(contract.components).flatMap((entry) => Object.keys(entry.attributes)),
    );

    const unused = UIO_PART_ATTRIBUTES.filter(
      (name) => name !== "data-scope" && name !== "data-part" && !read.has(name),
    );
    expect(unused, "bound by UioPart but read by no stylesheet").toEqual([]);
  });
});
