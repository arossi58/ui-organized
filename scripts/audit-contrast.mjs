// Contrast audit for the semantic color roles (see CONTRAST-AUDIT.md).
// Reads the built utils: run `pnpm --filter @ui-organized/utils build` first.
// Each line reports the public path (`getCoreFamily` → `resolveSemanticColors`)
// and, where it differs, the raw fixed map step for reference.
const U = await import("../packages/utils/dist/index.js");
const {
  semanticColorMap, getCoreFamily, getAuthoredFamily, getNeutralPreset,
  resolveSemanticColors, contrastRatio: cr, BRAND_FAMILY_NAMES, NEUTRAL_FAMILY_NAMES,
} = U;

const rgb = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lin = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const Y = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const L = (h) => { const y = Y(h); return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (y * 24389) / 27; };
const S = (ref) => /\.(\d+)$/.exec(String(ref))?.[1];
const resolve = (mode, brand, neutral = "grey") =>
  resolveSemanticColors(mode, { brandRamp: getCoreFamily(brand), neutralRamp: getCoreFamily(neutral) });
const BEDS = ["--color-surface-primary", "--color-surface-secondary"];
const worstOn = (v, fg, bgs) => Math.min(...bgs.map((b) => cr(v[fg], v[b])));
let failed = 0;

// ── Task 1: dark neutral text roles ─────────────────────────────────────────
const TEXT = ["--color-content-secondary", "--color-content-tertiary", "--color-content-placeholder"];
const d = semanticColorMap.dark;
{
  let fails = 0, worst = Infinity;
  for (const n of NEUTRAL_FAMILY_NAMES) {
    const f = getAuthoredFamily(n);
    const beds = BEDS.map((b) => f[S(d[b])].hex);
    for (const role of TEXT) {
      const r = Math.min(...beds.map((b) => cr(f[S(d[role])].hex, b)));
      worst = Math.min(worst, r);
      if (r < 4.5) fails++;
    }
  }
  console.log(`T1 authored ramps (ref)       ${String(fails).padStart(2)}/${NEUTRAL_FAMILY_NAMES.length * TEXT.length} fail   worst ${worst.toFixed(2)}:1`);
}
{
  let fails = 0, worst = Infinity;
  for (const n of NEUTRAL_FAMILY_NAMES) {
    const v = resolve("dark", "mars", n);
    for (const role of TEXT) {
      const r = worstOn(v, role, BEDS);
      worst = Math.min(worst, r);
      if (r < 4.5) fails++;
    }
  }
  failed += fails;
  console.log(`T1 getCoreFamily (public)     ${String(fails).padStart(2)}/${NEUTRAL_FAMILY_NAMES.length * TEXT.length} fail   worst ${worst.toFixed(2)}:1`);
}

// ── Task 2: filled-button label on every primary fill state ─────────────────
const FILLS = ["default", "hover", "active", "selected"].map((s) => `--color-interactive-primary-${s}`);
for (const mode of ["light", "dark"]) {
  const fails = BRAND_FAMILY_NAMES
    .map((b) => { const v = resolve(mode, b); return [b, worstOn(v, "--color-interactive-contents", FILLS)]; })
    .filter(([, r]) => r < 4.5);
  failed += fails.length;
  console.log(`T2 button label ${mode.padEnd(5)} ${fails.length}/${BRAND_FAMILY_NAMES.length} fail  ${fails.map(([b, r]) => b + " " + r.toFixed(2)).join(", ")}`);
}

// ── Task 3: link states on both surfaces ────────────────────────────────────
const LINKS = ["default", "hover", "active"].map((s) => `--color-interactive-tertiary-${s}`);
for (const mode of ["light", "dark"]) {
  const fails = BRAND_FAMILY_NAMES
    .map((b) => { const v = resolve(mode, b); return [b, Math.min(...LINKS.map((l) => worstOn(v, l, BEDS)))]; })
    .filter(([, r]) => r < 4.5);
  failed += fails.length;
  console.log(`T3 links ${mode.padEnd(5)} ${fails.length}/${BRAND_FAMILY_NAMES.length} fail  ${fails.map(([b, r]) => b + " " + r.toFixed(2)).join(", ")}`);
}

// ── Task 4: a short ramp must throw, not emit "grey.2400" as a color ────────
const preset = getNeutralPreset("flint");
try {
  resolveSemanticColors("light", { brandRamp: getCoreFamily("mars"), neutralRamp: preset });
  failed++;
  console.log("T4 getNeutralPreset ramp resolved without throwing — refs would leak into CSS");
} catch (e) {
  console.log(`T4 short ramp throws: ${e.message.slice(0, 90)}…`);
}

// ── Root cause: L* divergence by step ───────────────────────────────────────
console.log("\nL* spread across neutral families (authored → public):");
for (const s of ["100", "300", "800", "1100", "1300", "1400", "1800", "2100", "2300", "2400"]) {
  const spread = (get) => { const v = NEUTRAL_FAMILY_NAMES.map((n) => L(get(n)[s].hex)); return (Math.max(...v) - Math.min(...v)).toFixed(1).padStart(5); };
  console.log(`  ${s.padStart(4)}  ${spread(getAuthoredFamily)} → ${spread(getCoreFamily)} L*   grey ${L(getCoreFamily("grey")[s].hex).toFixed(1).padStart(5)}`);
}

process.exitCode = failed ? 1 : 0;
