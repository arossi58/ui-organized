import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { STATE_CONTRACT_PATH, deriveStateContract, type StateContract } from "./stateContract.js";

/**
 * Guards the state contract — what a library must *emit* for the shared
 * stylesheet to style it at all.
 *
 * Companion to `contract.test.ts`, which guards what a *theme* must supply. Both
 * derive from the real CSS rather than a hand-kept list, and both exist because
 * the failure they catch is silent: a missing token renders the wrong size, a
 * missing attribute renders the wrong state.
 *
 * The checks below are deliberately not "the derivation derived something". Two
 * of them catch typos that no other part of the build can see — a selector
 * written `[date-state]` or `[data-state="opened"]` is valid CSS that matches
 * nothing, forever.
 */

const contract = deriveStateContract();

/** Names a component may select on that are neither `data-` nor `aria-`. */
const NATIVE_ATTRIBUTES = new Set([
  "checked",
  "disabled",
  "hidden",
  "multiple",
  "open",
  "readonly",
  "required",
  "selected",
  "type",
  "value",
]);

/**
 * Every value Zag writes for `data-state`, across every machine this library
 * uses. Adding one is a deliberate act; a typo is not, and this is the only
 * place a typo shows up as anything at all.
 */
const STATE_VALUES = new Set([
  "active",
  "checked",
  "closed",
  "complete",
  "incomplete",
  "indeterminate",
  "off",
  "on",
  "open",
  "unchecked",
  "visible",
]);

const AXIS_VALUES = new Set(["horizontal", "vertical"]);

function entries(): [string, StateContract[string]][] {
  return Object.entries(contract);
}

describe("state contract", () => {
  it("covers the whole library", () => {
    expect(Object.keys(contract).length).toBeGreaterThan(50);
    // Every component defines at least one class, or its stylesheet styles
    // nothing that a library could render.
    const classless = entries()
      .filter(([, entry]) => entry.classes.length === 0)
      .map(([name]) => name);
    expect(classless).toEqual([]);
  });

  it("names attributes that could actually match something", () => {
    // `[date-state]` is valid CSS. It matches nothing, in silence, forever.
    const suspect = entries().flatMap(([component, entry]) =>
      Object.keys(entry.attributes)
        .filter(
          (name) =>
            !name.startsWith("data-") && !name.startsWith("aria-") && !NATIVE_ATTRIBUTES.has(name),
        )
        .map((name) => `${component}: [${name}]`),
    );
    expect(suspect, "neither data-*, aria-*, nor a known native attribute").toEqual([]);
  });

  it("only distinguishes state values a machine actually writes", () => {
    const unknown = entries().flatMap(([component, entry]) =>
      (entry.attributes["data-state"] ?? [])
        .filter((value) => !STATE_VALUES.has(value))
        .map((value) => `${component}: [data-state="${value}"]`),
    );
    expect(unknown, "not a value Zag writes — a typo here matches nothing").toEqual([]);
  });

  it("keeps the orientation vocabulary to one axis pair", () => {
    const unknown = entries().flatMap(([component, entry]) =>
      ["data-orientation", "data-axis"].flatMap((attribute) =>
        (entry.attributes[attribute] ?? [])
          .filter((value) => !AXIS_VALUES.has(value))
          .map((value) => `${component}: [${attribute}="${value}"]`),
      ),
    );
    expect(unknown).toEqual([]);
  });

  it("records the runtime-written properties against the component that reads them", () => {
    // The whole point of separating these from the token contract: a theme
    // cannot supply them, so whichever library renders the component has to
    // write them inline. At least one component must need them, or the
    // distinction is not being derived at all.
    const withRuntime = entries().filter(([, entry]) => entry.runtime.length > 0);
    expect(withRuntime.length).toBeGreaterThan(0);
  });

  it("matches the checked-in state-contract.json", () => {
    // Regenerate with `pnpm --filter @ui-organized/core gen:state-contract`.
    const onDisk = JSON.parse(readFileSync(STATE_CONTRACT_PATH, "utf8")) as {
      components: StateContract;
    };
    expect(onDisk.components).toEqual(contract);
  });
});
