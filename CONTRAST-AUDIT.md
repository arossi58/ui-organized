# Contrast audit — semantic colour roles fail WCAG AA across the palette

**Status:** open. **Scope:** `@ui-organized/utils`, `@ui-organized/tokens`, `@ui-organized/core`.
**Written:** 25 September 2026, against `react@5.1.0 · tokens@3.4.0 · utils@3.2.0 · schema@3.1.0`.

Found while switching a consumer site (arossi.design) from light-only to a light/dark
toggle. Dark mode exposed defects that light mode had been hiding; the largest one
turned out not to be dark-specific at all.

This is a work order. Every claim below was measured, and every measurement is
reproducible with the script in §2 — **run it before changing anything**, so you have
the baseline, and again after each task.

---

## 0. Before you start

Repo conventions apply (see `CLAUDE.md`): query graphify before grepping, `pnpm`, turbo.

```bash
export PATH="$HOME/.local/bin:$PATH"
graphify query "semanticColorMap resolveSemanticColors getNeutralRamp getCoreFamily" --budget 2000
```

**Do not** start by editing colour values by hand. One of the four defects is already
fixed in this repo and merely unwired (Task 1); two more should be fixed by deriving a
value rather than by picking a new constant. Hand-tuning hex is how this class of bug
got here.

---

## 1. Summary

| # | Defect | Severity | Already fixed in repo? |
|---|---|---|---|
| 1 | Dark-mode neutral text roles fail on 10 of 11 neutral families | **P1** | **Yes — `getNeutralRamp()` exists and is unwired/unpublished** |
| 2 | Filled-button label fails on 13 of 26 brand families, **both modes** | **P1** | No |
| 3 | Dark-mode link role fails on 4 of 26 brand families | **P1** | No |
| 4 | `getNeutralPreset()` cannot satisfy `semanticColorMap` — silent unresolved roles | **P2** | No |
| 5 | `Button` draws its focus ring with `box-shadow` — consumers delete it silently | **P2** | No |
| 6 | `--color-interactive-ui-*` are alpha overlays named like colours | **P3** | Partially — alpha is re-applied in `semanticResolve.ts` |
| 7 | `initTheme()` cannot express "follow the system"; inverted media query | **P3** | No |
| 8 | No sun/moon/monitor in the icon registry | **P3** | No |
| 9 | Nothing asserts contrast in CI | **P2** | No |

Defects 1–3 share one root cause. Read §3 before fixing any of them.

---

## 2. Reproduction

The script is committed at `scripts/audit-contrast.mjs`. It is self-contained, has no
dependencies, and reads only the built `utils`:

```bash
pnpm build                          # it reads packages/utils/dist
node scripts/audit-contrast.mjs
```

Run it from the repo root. It is reproduced here so this document stands on its own:

```js
const U = await import("../packages/utils/dist/index.js"); // relative to scripts/
const {
  semanticColorMap, getCoreFamily, getNeutralRamp, getNeutralPreset,
  resolveSemanticColors, BRAND_FAMILY_NAMES, NEUTRAL_FAMILY_NAMES,
} = U;

const rgb = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lin = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const Y = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const L = (h) => { const y = Y(h); return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (y * 24389) / 27; };
const cr = (a, b) => { const [x, y] = [Y(a), Y(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const S = (ref) => /\.(\d+)$/.exec(String(ref))?.[1];

// ── Task 1: dark neutral text roles, authored vs derived ramps ──────────────
const TEXT = ["--color-content-secondary", "--color-content-tertiary", "--color-content-placeholder"];
const d = semanticColorMap.dark;
for (const [label, ramp] of [["getCoreFamily (authored)", getCoreFamily], ["getNeutralRamp (derived)", getNeutralRamp]]) {
  let fails = 0, worst = Infinity;
  for (const n of NEUTRAL_FAMILY_NAMES) {
    const f = ramp(n);
    const beds = [f[S(d["--color-surface-primary"])].hex, f[S(d["--color-surface-secondary"])].hex];
    for (const role of TEXT) {
      const r = Math.min(...beds.map((b) => cr(f[S(d[role])].hex, b)));
      worst = Math.min(worst, r);
      if (r < 4.5) fails++;
    }
  }
  console.log(`T1 ${label.padEnd(26)} ${String(fails).padStart(2)}/${NEUTRAL_FAMILY_NAMES.length * TEXT.length} fail   worst ${worst.toFixed(2)}:1`);
}

// ── Task 2: filled-button label ─────────────────────────────────────────────
for (const mode of ["light", "dark"]) {
  const m = semanticColorMap[mode];
  const label = getCoreFamily("grey")[S(m["--color-interactive-contents"])].hex;
  const fillStep = S(m["--color-interactive-primary-default"]);
  const fails = BRAND_FAMILY_NAMES
    .map((b) => [b, cr(label, getCoreFamily(b)[fillStep].hex)])
    .filter(([, r]) => r < 4.5);
  console.log(`T2 button label ${mode.padEnd(5)} ${fails.length}/${BRAND_FAMILY_NAMES.length} fail  worst ${Math.min(...fails.map((f) => f[1])).toFixed(2)}:1  ${fails.map((f) => f[0]).join(" ")}`);
}

// ── Task 3: dark link role ──────────────────────────────────────────────────
const bed = getNeutralRamp("grey")[S(d["--color-surface-primary"])].hex;
const lf = BRAND_FAMILY_NAMES
  .map((b) => [b, cr(getCoreFamily(b)[S(d["--color-interactive-tertiary-default"])].hex, bed)])
  .filter(([, r]) => r < 4.5);
console.log(`T3 dark link (brand.${S(d["--color-interactive-tertiary-default"])}) ${lf.length}/${BRAND_FAMILY_NAMES.length} fail  ${lf.map(([b, r]) => b + " " + r.toFixed(2)).join(", ")}`);

// ── Task 4: preset coverage ─────────────────────────────────────────────────
const preset = getNeutralPreset("flint");
const need = Math.max(...[...Object.values(semanticColorMap.light), ...Object.values(semanticColorMap.dark)]
  .map(String).filter((v) => /^grey\./.test(v)).map((v) => +v.split(".")[1]));
console.log(`T4 getNeutralPreset max step ${Math.max(...Object.keys(preset).map(Number))}, map needs ${need}`);
for (const mode of ["light", "dark"]) {
  const roles = resolveSemanticColors(mode, { brandRamp: getCoreFamily("mars"), neutralRamp: preset });
  const bad = Object.entries(roles).filter(([, v]) => typeof v === "string" && !/^(#|rgb|hsl|color\()/.test(v));
  console.log(`   ${mode.padEnd(5)} unresolved: ${bad.length}  e.g. ${bad.slice(0, 2).map(([k, v]) => `${k}="${v}"`).join("  ")}`);
}

// ── Root cause: L* divergence by step ───────────────────────────────────────
console.log("\nL* spread across neutral families, authored ramps:");
for (const s of ["100", "300", "800", "1100", "1300", "1400", "1800", "2100", "2300", "2400"]) {
  const v = NEUTRAL_FAMILY_NAMES.map((n) => L(getCoreFamily(n)[s].hex));
  console.log(`  ${s.padStart(4)}  spread ${(Math.max(...v) - Math.min(...v)).toFixed(1).padStart(5)} L*   grey ${L(getCoreFamily("grey")[s].hex).toFixed(1).padStart(5)}`);
}
```

### Expected output today (the baseline you must improve on)

```
T1 getCoreFamily (authored)   19/33 fail   worst 3.09:1
T1 getNeutralRamp (derived)    0/33 fail   worst 5.90:1
T2 button label light 13/26 fail  worst 1.99:1  damselfly scooter caribbean emerald malachite lima inchworm lime candlelight midas lightning dough meteor
T2 button label dark  13/26 fail  worst 1.99:1  damselfly scooter caribbean emerald malachite lima inchworm lime candlelight midas lightning dough meteor
T3 dark link (brand.1100) 4/26 fail  purple 3.67, lapis 3.00, persian 3.42, cerulean 4.36
T4 getNeutralPreset max step 1600, map needs 2400
   light unresolved: 7  e.g. --color-interactive-ui-dark="grey.2400"  --color-interactive-focus="grey.2400"
   dark  unresolved: 12  e.g. --color-border-primary="grey.2100"  --color-border-secondary="grey.2000"
```

---

## 3. Root cause

**Every P1 defect is the same bug: a token holds a fixed ramp step, but the step that
satisfies contrast depends on another token the map cannot see.**

The colour families converge at both ends of the ramp and diverge in the middle:

| step | L\* spread across the 11 neutrals | grey's L\* |
|---|---|---|
| 100 | 0.3 | 99.0 |
| 300 | 4.6 | 94.4 |
| 800 | 15.7 | 83.8 |
| **1100** | **22.6** | 77.7 |
| **1300** | **22.9** | 68.9 |
| **1400** | **20.6** | 62.1 |
| 1800 | 12.8 | 35.7 |
| 2100 | 6.6 | 15.6 |
| 2300 | 1.4 | 3.6 |
| 2400 | 0.1 | 0.8 |

`grey` is the **lightest** family at every mid step, so a step chosen to look right on
grey is too dark on all ten others. Now note where each mode puts its text roles
(`packages/utils/src/semanticColorMap.ts`):

- **light** — primary `2400`, secondary `2000`, tertiary `1800`, placeholder `1700`
  → the converged end → **11 of 11 families pass**
- **dark** — primary `100`, secondary `1100`, tertiary `1300`, placeholder `1400`
  → the diverged middle → **10 of 11 families fail**

Light mode passing is luck, not design. The same applies across the brand ramps for
defects 2 and 3.

---

## Task 1 — Wire up the derived neutral ramps (P1)

**This is already solved; it is not wired and not published.**

`packages/utils/src/neutralGeneration.ts:257` exports `getNeutralRamp(name, strength)`,
which re-derives each neutral to track grey's luminance. `neutralGeneration.test.ts:264`
("fixes the luminance divergence the authored families had") already asserts it lands
within 5% of grey. It is exported from `packages/utils/src/index.ts:17` — but **it is
not in the published `utils@3.2.0`**, and `getCoreFamily()` still returns the authored,
diverged ramps.

The repro proves the effect: **19/33 failures → 0/33, worst 3.09:1 → 5.90:1.**

`resolveSemanticColors` takes `neutralRamp` from its **caller**
(`packages/utils/src/semanticResolve.ts:74,90`), so the fix only lands where callers
pass the derived ramp.

**Do:**
1. Audit every `resolveSemanticColors` caller and switch the neutral to `getNeutralRamp`.
   Known sites passing `getCoreFamily` for the neutral:
   - `apps/marketing/src/theme/ThemeProvider.tsx:149`
   - `apps/storybook/src/foundations/SemanticTokenTable.tsx:139`
   - `apps/builder/src/utils/semanticMapping.ts` and
     `apps/marketing/src/tools/theme-builder/utils/semanticMapping.ts` take the ramp as a
     parameter — trace their callers.
   (Where the neutral is `grey` this is a no-op, since grey is the reference. Change it
   anyway so the next family swap is safe.)
2. Decide the public story. Either make `getCoreFamily(name)` return the derived ramp for
   neutral families, or document `getNeutralRamp` as the one to use for a neutral and
   leave `getCoreFamily` for brands. **Prefer the first** — every consumer that reaches
   for `getCoreFamily` today gets the broken ramp, and nothing in the name warns them.
   If you take the second route, `resolveSemanticColors` should reject an authored
   neutral ramp rather than quietly resolving with it.
3. Publish. This is the one fix that is otherwise finished.

**Acceptance:** repro line T1 reports `0/33` for whatever the documented public path is,
not merely for `getNeutralRamp`.

**Do not** re-step `semanticColorMap` to work around this. I checked: most families clear
at `1200`, but **mythical, waterloo and hemp need `1100` — which is where
`content.secondary` already sits**, collapsing the three-level text hierarchy to two.
The step table cannot express the fix. The ramps are the fix, and they already exist.

---

## Task 2 — Derive the filled-button label from its fill (P1)

**The largest defect, and it has nothing to do with dark mode.**

`--color-interactive-contents` is `grey.100` (near-white) in **both** modes, while
`--color-interactive-primary-default` is `brand.1400`, whose lightness varies enormously
across the 26 brand families. **13 of 26 fail 4.5:1, identically in light and dark:**

```
candlelight 1.99   lime 2.19   inchworm 2.42   lightning 2.50   lima 2.53
caribbean   2.61   emerald 2.65   midas 2.71   malachite 2.72   scooter 3.22
dough       3.34   meteor 4.12   damselfly 4.14
```

White on `candlelight.1400` at 1.99:1 is unreadable, and ships today.

**Do:** in `packages/utils/src/semanticResolve.ts`, resolve `--color-interactive-contents`
(and the `-hover` / `-active` / `-selected` pairs, which share the problem) by choosing
`grey.100` or `grey.2400` against the **resolved fill's** luminance, rather than taking a
fixed ref from the map. Both values are already in scope at resolve time.

This also fixes a downstream bug consumers hit unaided: anyone who steps the brand
*lighter* for dark mode — the obvious move, and what arossi.design does with `brand.900`
— gets white-on-light at 2.4–3.1:1 and has to discover the override themselves.

**Acceptance:** repro line T2 reports `0/26` in both modes. Add a case asserting a
*light* brand fill (e.g. `candlelight.900`) receives a dark label.

---

## Task 3 — Fix the dark-mode link step (P1)

`--color-interactive-tertiary-default` is `brand.1500` in light but `brand.1100` in dark.
`brand.1100` is a **display** step — correct for headings ≥24px at 3:1, too close to the
page for body-size link text at 4.5:1. On `surface.primary`:

```
lapis 3.00   persian 3.42   purple 3.67   cerulean 4.36
```

The light/dark asymmetry reads as an oversight rather than a decision.

**Do:** step dark links darker-of-the-light-end (around `brand.800`), or better, resolve
by contrast target against the resolved surface so it holds for any brand. Apply the same
treatment to `-hover` and `-active`, which are `brand.1600` / `brand.1300` in both modes.

**Acceptance:** repro line T3 reports `0/26`, and the hover/active states also clear
4.5:1 on both `surface.primary` and `surface.secondary`.

---

## Task 4 — Make `getNeutralPreset()` satisfy the map, or fail loudly (P2)

`getNeutralPreset(name)` returns steps **100–1600**. `semanticColorMap` references up to
**2400**. Passing a preset to `resolveSemanticColors` leaves roles unresolved as literal
strings — **no error, no warning** — and those strings are written straight into CSS as
invalid values:

```
light  7 unresolved   e.g. --color-content-primary = "grey.2400"
dark  12 unresolved   e.g. --color-border-primary  = "grey.2100"
```

`getCoreFamily(name)` returns 0 unresolved, so the two entry points disagree.

**Do:** extend the presets to the full 24 steps (preferably by routing them through
`getNeutralRamp`, which closes Task 1 at the same time). Whichever way it goes,
`resolveSemanticColors` must **throw** on an unresolvable ref. Emitting `"grey.2400"` as
a colour value is the worst of the three options and is what happens today.

**Acceptance:** repro line T4 reports `0` unresolved in both modes, and a unit test
asserts that an intentionally short ramp throws rather than passing the ref through.

---

## Task 5 — Stop drawing the focus ring with `box-shadow` (P2)

`packages/core/src/components/Button/Button.css:33`:

```css
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-interactive-focus);
}
```

Any consumer who sets `box-shadow` on a button — for a card shadow, a lifted disc,
anything — **silently deletes the focus indicator**. No error, and visually it reads as
"this button just has no focus style". I hit this building a theme toggle and only caught
it by diffing computed styles.

**Do:** draw the ring with `outline` + `outline-offset` (which cannot collide with a
shadow), or expose it as a `--Button-focus-ring` custom property so an override composes
instead of replacing. Audit the other components for the same pattern.

**Acceptance:** a test (or Storybook interaction) asserting a Button with a
consumer-supplied `box-shadow` still shows a focus indicator.

---

## Task 6 — Name the overlay tokens as overlays (P3)

`--color-interactive-ui-*` and `--color-interactive-secondary-*` are alpha overlays —
`semanticResolve.ts`'s `TOKEN_ALPHA` table re-applies 0.02–0.2 alpha because the generated
map drops it. They are meant to be layered *over* a surface, but they are named
`--color-…`, so consumers assign them to `background` and the element goes transparent.
That reached a user as a visible bug ("on hover the toggle is transparent").

**Do:** rename to something that says overlay (`--overlay-interactive-hover`), or document
the alpha at the point of definition and in the README. Related: `.btn--secondary:hover:not(:disabled)`
(`Button.css:68`) is specificity (0,3,0), so a consumer needs four classes to override a
background — and loses on source order at three. Keep component rules to one class where
practical, or state the floor in the README.

---

## Task 7 — `initTheme()` (P3)

`packages/tokens/src/theme.ts`:

1. **It cannot express "follow the system."** It always calls `setTheme()`, which
   persists — so merely loading a page writes a choice and pins the theme forever. Any
   consumer wanting a system-tracking default must reimplement it. Add a `"system"`
   sentinel or a `{ persist: false }` option.
2. **The media query is inverted.** It tests `(prefers-color-scheme: light)` and falls
   back to `DEFAULT_THEME = "dark"`, so a browser reporting `no-preference` resolves to
   dark. The conventional idiom tests for `dark` and falls back to light.

Also worth a line in the README: the baseline `:root` is **dark-first**, so an absent or
unknown `data-theme` paints dark. Consumers who server-render a light default need to know.

---

## Task 8 — Theme-toggle icons (P3)

The canonical icon registry has 49 names and no sun, moon or monitor
(`packages/utils/src/iconMapping.ts`). Every consumer building the most common control in
a themed system takes the non-registry detour: `<Icon name={Component} />` plus a
hand-applied `btn--icon-only`, because `Button` only adds that class for a registry
`icon`. Add the three names.

---

## Task 9 — Add the regression test (do this first) (P2)

**Every P1 above is mechanically detectable from `semanticColorMap` plus the ramps — no
browser, no rendering.** Nothing checks it, which is why three of them shipped.

Add `packages/utils/src/semanticContrast.test.ts`. `neutralGeneration.test.ts:15-25`
already has `relativeLuminance` and `contrast` helpers to lift.

Assert, across **every** (brand × neutral × mode) combination — 26 × 11 × 2 = 572, which
runs in well under a second:

| pair | minimum |
|---|---|
| `content-primary` / `-secondary` / `-tertiary` / `-placeholder` on `surface-primary` **and** `surface-secondary` | 4.5:1 |
| `interactive-tertiary-*` (links) on both surfaces | 4.5:1 |
| `interactive-contents` on `interactive-primary-default` / `-hover` / `-active` | 4.5:1 |
| `interactive-focus` on both surfaces | 3:1 |
| `border-primary` on `surface-primary` | 3:1 |

Text roles are measured against the **harder of the two surfaces**, not just the page —
cards and section beds use `surface-secondary`, which in dark mode is a step lighter than
the page, and that is where most captions actually live. Measuring only against the page
is how the original tuning missed this.

Expect it to fail loudly on first run, and use its output to drive Tasks 1–3.

---

## 4. Consumer impact

`arossi.design` is the known consumer and currently carries local workarounds that should
be unwound once this lands:

- a contrast-repair pass in its case-theme generator that steps a failing text role to the
  nearest passing one (Task 1)
- dark links taken from its own theme steps rather than the map's (Task 3)
- `--color-interactive-contents: grey-2400` pinned in its dark block (Task 2)

Its `scripts/check-contrast.mjs` is a working sketch of Task 9 — it audits 120 pairs of
one resolved theme and exits non-zero. The upstream version wants the full matrix.

Tasks 1–3 change published colour values, so they are a **minor** at minimum and arguably
a **major** for anyone who has colour-matched against the current output. Call it out in
the changeset: the values move because the old ones failed AA.
