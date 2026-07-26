import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  CONTRACT_PATH,
  VARIABLES_CSS,
  deriveContract,
  tokenValues,
} from "../scripts/token-contract";

/**
 * Guards the token contract — the set of CSS custom properties this library
 * consumes but does not define — against silent drift. See the header of
 * `scripts/token-contract.ts` for why this exists (a theme export that dropped
 * seven tokens, broke the sidebar and every overlay, and threw nothing).
 *
 * Companion to `typography.test.ts`: same approach of asserting against the real
 * CSS rather than a hand-maintained list.
 */

const { used, required } = deriveContract();
const shipped = tokenValues(readFileSync(VARIABLES_CSS, "utf8"));

describe("token contract", () => {
  it("derives a contract from the real component stylesheets", () => {
    expect(required.length).toBeGreaterThan(100);
    // Sanity: the families a theme is expected to supply are all represented.
    for (const prefix of ["--color-", "--type-", "--spacing-", "--border-radius-"]) {
      expect(required.some((name) => name.startsWith(prefix)), prefix).toBe(true);
    }
  });

  it("only references tokens the design system actually ships", () => {
    const missing = required.filter((name) => !shipped.has(name));
    expect(missing, `not defined in ${VARIABLES_CSS}`).toEqual([]);
  });

  it("keeps every var() fallback in step with the token's real value", () => {
    const drifted: string[] = [];
    for (const [name, { fallbacks }] of used) {
      for (const fallback of fallbacks) {
        if (!fallback) continue;
        const real = shipped.get(name);
        // Tokens whose shipped value is itself a var() reference (the colour
        // aliases) can't be compared literally. Fallbacks are only used on the
        // layout constants, which resolve to plain values.
        if (!real || real.startsWith("var(")) continue;
        if (real !== fallback) drifted.push(`${name}: fallback ${fallback} ≠ shipped ${real}`);
      }
    }
    expect(drifted).toEqual([]);
  });

  it("carries a fallback on every single use of a non-themeable layout constant", () => {
    // These are the ones a theme generator forgets, and the failure is invisible —
    // so the library degrades gracefully rather than trusting the theme. Checked
    // per occurrence: one file dropping its fallback must fail even while nine
    // others keep theirs.
    const constants = required.filter(
      (name) => name.startsWith("--dimension-") || name.startsWith("--z-index-"),
    );
    expect(constants.length).toBeGreaterThan(0);
    const bare = constants
      .filter((name) => (used.get(name)?.bare ?? 0) > 0)
      .map((name) => `${name} (${used.get(name)!.bare} bare use(s))`);
    expect(bare, "layout constants must be written var(--token, fallback)").toEqual([]);
  });

  it("matches the checked-in token-contract.json", () => {
    // Regenerate with `pnpm --filter @ui-organized/react gen:contract`.
    const onDisk = JSON.parse(readFileSync(CONTRACT_PATH, "utf8")) as { tokens: string[] };
    expect(onDisk.tokens).toEqual(required);
  });
});
