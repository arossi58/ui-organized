import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { zIndexTokens } from "@ui-organized/tokens";
import { SRC_DIR, cssFiles } from "../scripts/token-contract";

/**
 * Guards the stacking contract for portalled overlays, which has two halves that
 * fail silently on their own.
 *
 * **Where the declaration lives.** @zag-js/popper owns the positioner's
 * `z-index`: it writes an inline `z-index: var(--z-index)` and then fills that
 * variable from `getComputedStyle(positioner.firstElementChild).zIndex` — the
 * popup. So the library's contract is "style the popup, the positioner
 * inherits", and a `z-index` written on the positioner is outranked by zag's own
 * inline style and does exactly nothing. Every popper-backed component in this
 * package once got this wrong, and nothing caught it: the rules were present and
 * plausible, the computed value was `auto`, and the only visible symptom was a
 * dropdown losing to a dialog. zag latches the read (`zIndexComputed`) after the
 * first open, so it does not even self-correct on a later re-render.
 *
 * **Which tier it names.** Anchored surfaces are always spawned *from* another
 * surface, often a dialog, so the popover tier has to outrank the dialog tier.
 * See the `zIndexTokens` doc comment in @ui-organized/tokens.
 *
 * Companion to `tokenContract.test.ts`: same approach of asserting against the
 * real stylesheets rather than a hand-maintained list.
 */

/** Positioner class → the popup that must carry the `z-index` for it. */
const POPPER_LAYERS: Record<string, string> = {
  "select-positioner": "select-popup",
  "combobox-positioner": "combobox-popup",
  "menu__positioner": "menu__popup",
  "context-menu__positioner": "context-menu__popup",
  "popover__positioner": "popover__popup",
  "hover-card__positioner": "hover-card__popup",
  "tooltip__positioner": "tooltip__popup",
  "date-popover-positioner": "date-popover",
};

/**
 * `<ArkDialog.Positioner>` is the one positioner that is *not* popper-backed —
 * it is a plain `position: fixed; inset: 0` centering box with no inline
 * `z-index`, so it styles normally and is exempt from the rule above.
 */
const NON_POPPER_NAMESPACE = "Dialog";

function tsxFiles(dir: string = SRC_DIR): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxFiles(path));
    else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) out.push(path);
  }
  return out;
}

/** Every `<Ark<Ns>.Positioner className="…">` in the package, by Ark namespace. */
function renderedPositioners(): { namespace: string; classes: string[] }[] {
  const found: { namespace: string; classes: string[] }[] = [];
  for (const file of tsxFiles()) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/<Ark(\w+)\.Positioner\s+className="([^"]+)"/g)) {
      found.push({ namespace: m[1]!, classes: m[2]!.split(/\s+/).filter(Boolean) });
    }
  }
  return found;
}

type Rule = { selectors: string[]; body: string };

/**
 * Comments are stripped first and deliberately: the popup rules explain the zag
 * mechanism in prose that contains the literal text `z-index: var(--z-index)`,
 * which a naive scan would read as a declaration on whatever rule follows.
 */
function parseRules(css: string): Rule[] {
  const rules: Rule[] = [];
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const prelude = m[1]!.trim();
    // Skip at-rule preludes (`@media …`); their inner rules match on their own.
    if (prelude.startsWith("@")) continue;
    rules.push({ selectors: prelude.split(",").map((s) => s.trim()), body: m[2]! });
  }
  return rules;
}

const declaresZIndex = (body: string) => /(^|[;{\s])z-index\s*:/.test(body);

const ALL_RULES = cssFiles().flatMap((file) => parseRules(readFileSync(file, "utf8")));

/**
 * Rules whose selector list uses `.cls` as a standalone class, in any position.
 *
 * The lookahead is what keeps `.select-popup` from also matching its own
 * children (`.select-popup__item`), which would make the check meaningless.
 */
function rulesTouching(cls: string): Rule[] {
  const token = new RegExp(`\\.${cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`);
  return ALL_RULES.filter((r) => r.selectors.some((s) => token.test(s)));
}

describe("overlay stacking", () => {
  it("knows about every popper-positioned layer that is actually rendered", () => {
    // A new anchored component must be added to POPPER_LAYERS (or be a Dialog
    // positioner) rather than silently inheriting the bug this file exists for.
    const unaccounted = renderedPositioners()
      .filter((p) => p.namespace !== NON_POPPER_NAMESPACE)
      .flatMap((p) => p.classes)
      .filter((cls) => !(cls in POPPER_LAYERS));
    expect(unaccounted, "popper positioners missing from POPPER_LAYERS").toEqual([]);
  });

  it("never declares z-index on a popper positioner, where zag would ignore it", () => {
    const offenders: string[] = [];
    for (const positioner of Object.keys(POPPER_LAYERS)) {
      for (const rule of rulesTouching(positioner)) {
        if (declaresZIndex(rule.body)) offenders.push(`${rule.selectors.join(", ")}`);
      }
    }
    expect(offenders, "move these to the popup — zag overrides them inline").toEqual([]);
  });

  it("declares z-index on every popper popup, which is what zag reads", () => {
    const missing: string[] = [];
    for (const [positioner, popup] of Object.entries(POPPER_LAYERS)) {
      const base = ALL_RULES.filter((r) => r.selectors.includes(`.${popup}`));
      if (!base.some((r) => declaresZIndex(r.body))) missing.push(`.${popup} (for .${positioner})`);
    }
    expect(missing, "these layers compute to z-index: auto").toEqual([]);
  });

  it("ranks anchored surfaces above modal ones", () => {
    // A <Select> inside a <Dialog> has to paint over its own host.
    expect(zIndexTokens.popover).toBeGreaterThan(zIndexTokens.dialog!);
    expect(zIndexTokens.tooltip).toBeGreaterThan(zIndexTokens.popover!);
    expect(zIndexTokens.toast).toBeGreaterThan(zIndexTokens.tooltip!);
  });

  it("points every anchored popup at the popover or tooltip tier", () => {
    const wrong: string[] = [];
    for (const popup of Object.values(POPPER_LAYERS)) {
      const decl = ALL_RULES.filter((r) => r.selectors.includes(`.${popup}`))
        .map((r) => /z-index\s*:\s*([^;]+)/.exec(r.body)?.[1]?.trim())
        .find(Boolean);
      if (!decl) continue;
      if (!/--z-index-(popover|tooltip)\b/.test(decl)) wrong.push(`.${popup}: ${decl}`);
    }
    expect(wrong, "anchored popups must use the popover/tooltip tier tokens").toEqual([]);
  });
});
