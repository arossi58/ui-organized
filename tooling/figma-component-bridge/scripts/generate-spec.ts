/**
 * Spec generator (COMPONENT-PLUGIN.md §3, Phase 3) — the Phase 2/3 orchestrator.
 *
 * For a component, enumerate its variants from the Component Manifest axes (the
 * cartesian product, capped — see AXIS_SELECTION), render each via Playwright,
 * normalize the captures into the Spec JSON contract, and write the committed
 * spec to `src/generated/specs/<Component>.json`. The plugin builds that spec.
 *
 * Browser-gated (see scripts/render.ts). The committed token map supplies the
 * token custom-property names the renderer reads.
 *
 * Run: pnpm --filter @ui-organized/figma-component-bridge generate:spec -- Button
 *      (set STORYBOOK_URL, default http://localhost:6006)
 */

import { writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderComponent, type RenderVariant } from "./render";
import { normalizeCapture } from "../src/normalize";
import type { ComponentManifest, ManifestProperty } from "../src/manifest";
import type { PropertyDefinition } from "../src/spec";
import manifestJson from "../src/generated/component-manifest.json";
import tokenMapJson from "../src/generated/token-name-map.json";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(here, "../src/generated/specs");

const MANIFEST = manifestJson as ComponentManifest;
const TOKEN_VARS = Object.keys(tokenMapJson);
const MAX_VARIANTS = 120; // cap the combinatorial blow-up; excess base axes → AXIS_SELECTION
/** Interactive states captured as a pseudo-axis (forced via CDP in the renderer). */
const STATES = ["default", "hover", "active", "focus", "disabled"];
/** A representative icon to render for INSTANCE_SWAP props so icons appear. */
const REP_ICON = "plus";

// pnpm may forward the `--` separator as an argument; ignore it.
const component = process.argv.slice(2).filter((a) => a !== "--")[0];
const storybookUrl = process.env.STORYBOOK_URL ?? "http://localhost:6006";
if (!component) {
  console.error("usage: generate:spec -- <Component>   (e.g. Button)");
  process.exit(1);
}

const entry = MANIFEST.components.find((c) => c.component === component);
if (!entry) {
  console.error(`"${component}" not in the component manifest. Run generate:manifest first.`);
  process.exit(1);
}

// ── Enumerate variants: state axis × icon config × base VARIANT axes ───────────

/** Fold the icon INSTANCE_SWAP + iconPosition into one axis: none / left / right. */
interface IconConfig {
  label: string;
  args: Record<string, string>;
}
const iconProp = entry.properties.find((p) => p.kind === "INSTANCE_SWAP");
const positionProp = entry.properties.find((p) => p.name === "iconPosition" && p.kind === "VARIANT");
let iconConfigs: IconConfig[] | null = null;
if (iconProp) {
  iconConfigs = [{ label: "none", args: {} }];
  for (const pos of positionProp?.values ?? ["default"]) {
    iconConfigs.push({
      label: positionProp ? pos : "icon",
      args: { [iconProp.name]: REP_ICON, ...(positionProp ? { iconPosition: pos } : {}) },
    });
  }
  // Icon-only: an icon with no label — the DS renders a square `.btn--icon-only`.
  // `children:!undefined` is Storybook's URL token for unsetting the arg.
  iconConfigs.push({ label: "icon-only", args: { [iconProp.name]: REP_ICON, children: "!undefined" } });
}

// Base VARIANT axes (iconPosition is folded into the icon config above).
const baseAxes = entry.properties.filter(
  (p) => p.kind === "VARIANT" && p.values?.length && p.name !== "iconPosition",
);

// Greedily include base axes under the cap; state + icon are always-on multipliers.
const included: ManifestProperty[] = [];
const dropped: string[] = [];
let product = STATES.length * (iconConfigs?.length ?? 1);
for (const axis of baseAxes) {
  const n = axis.values!.length;
  if (product * n <= MAX_VARIANTS) {
    included.push(axis);
    product *= n;
  } else {
    dropped.push(axis.name);
  }
}

// Dropped axes are pinned to their default in the render args.
const pinnedArgs: Record<string, string> = {};
for (const name of dropped) {
  const def = entry.properties.find((p) => p.name === name)?.default;
  if (typeof def === "string") pinnedArgs[name] = def;
}

let baseCombos: Record<string, string>[] = [{}];
for (const axis of included) {
  baseCombos = baseCombos.flatMap((c) => axis.values!.map((v) => ({ ...c, [axis.name]: v })));
}

const configs: IconConfig[] = iconConfigs ?? [{ label: "", args: {} }];
const variants: RenderVariant[] = [];
for (const state of STATES) {
  for (const base of baseCombos) {
    for (const cfg of configs) {
      const props: Record<string, string> = { state, ...base };
      if (iconConfigs) props.icon = cfg.label;
      variants.push({ props, args: { ...pinnedArgs, ...base, ...cfg.args } });
    }
  }
}

const propertyDefinitions: Record<string, PropertyDefinition> = {};
for (const p of entry.properties) {
  propertyDefinitions[p.name] = {
    type: p.kind,
    ...(p.values ? { values: p.values } : {}),
    default: p.default ?? null,
  };
}

// ── Render → normalize → write ─────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`Rendering ${component}: ${variants.length} variant(s) from ${storybookUrl}`);
  if (dropped.length) console.log(`  AXIS_SELECTION: pinned axes to default (over cap): ${dropped.join(", ")}`);

  const capture = await renderComponent({ storybookUrl, component: component!, variants, tokenVars: TOKEN_VARS });
  const spec = normalizeCapture(capture, { propertyDefinitions, hash: entry!.hash });

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = resolve(OUT_DIR, `${component}.json`);
  writeFileSync(outPath, JSON.stringify(spec, null, 2) + "\n");
  writeSpecsIndex();

  console.log(
    `\n${component}.json: ${spec.variants.length} variants, ${spec.unresolved.length} unresolved, ` +
      `${Object.keys(spec.fallbacks ?? {}).length} fallbacks`,
  );
  if (spec.unresolved.length) {
    const byKind = spec.unresolved.reduce<Record<string, number>>((m, u) => ((m[u.kind] = (m[u.kind] ?? 0) + 1), m), {});
    console.log(`  unresolved by kind: ${JSON.stringify(byKind)}`);
  }
}

/** Rewrite src/generated/specs/index.ts to statically import every committed spec. */
function writeSpecsIndex(): void {
  const names = readdirSync(OUT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .filter((n) => /^[A-Za-z][A-Za-z0-9]*$/.test(n))
    .sort();
  const imports = names.map((n) => `import ${n} from "./${n}.json";`).join("\n");
  const entries = names.map((n) => `  ${JSON.stringify(n)}: ${n} as unknown as ComponentSpec,`).join("\n");
  const body =
    `/**\n * Committed component specs (Phase 4). Generated by scripts/generate-spec.ts —\n` +
    ` * do not edit by hand. Statically imports every <Component>.json in this dir.\n */\n` +
    `import type { ComponentSpec } from "../../spec";\n` +
    (imports ? `${imports}\n` : "") +
    `\nexport const SPECS: Record<string, ComponentSpec> = {\n${entries}\n};\n`;
  writeFileSync(resolve(OUT_DIR, "index.ts"), body);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
