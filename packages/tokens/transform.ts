/**
 * Figma export → DTCG transform script.
 *
 * Reads raw Figma plugin exports (primitive-tokens.json and ui-tokens.json)
 * from the project root and writes clean DTCG-formatted JSON files to src/.
 *
 * Run this script whenever you re-export tokens from Figma:
 *   pnpm transform
 *
 * Then rebuild the CSS:
 *   pnpm build:tokens
 *
 * ─── Input file format ───────────────────────────────────────────────────────
 *
 * primitive-tokens.json:
 *   Array wrapper → unwrap
 *   └── Primitive.modes.Light
 *       ├── brand, shark, black, white, mavic, ... (color ramps)
 *       └── curtain (overlay colors)
 *
 * ui-tokens.json:
 *   Array of 3 collections:
 *   [0] Component.modes.Desktop  → component radius + button spacing
 *   [1] Semantic.modes.Value     → all semantic tokens (color, spacing, radius, dimension)
 *   [2] Typography.modes.Desktop → font sizes + font families
 *
 * ─── Figma typo fixes (fix in Figma before exporting) ───────────────────────
 *   "waterloo " (trailing space)  → "waterloo"
 *   "dimesnion-01" through -12    → "dimension-01" through -12
 *   "icon-seconadry"              → "icon-secondary"
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Paths ────────────────────────────────────────────────────────────────────

const PRIMITIVE_EXPORT = resolve(__dirname, "../../primitive-tokens.json");
const UI_EXPORT = resolve(__dirname, "../../ui-tokens.json");
const SRC_DIR = resolve(__dirname, "src");

// ─── Types ────────────────────────────────────────────────────────────────────

interface FigmaToken {
  $value: unknown;
  $type: string;
  $scopes?: string[];
  $libraryName?: string;
  $collectionName?: string;
  $description?: string;
}

type FigmaTree = {
  [key: string]: FigmaToken | FigmaTree;
};

interface DtcgToken {
  $type: string;
  $value: string | number;
}

type DtcgTree = {
  [key: string]: DtcgToken | DtcgTree;
};

// Primitive ramp names — used to qualify alias references
const PRIMITIVE_RAMPS = new Set([
  "brand", "shark", "black", "white", "mavic",
  "dove", "mythical", "flint", "waterloo", "stone", "cave",
  "juniper", "battleship", "squirrel", "hemp",
  "passion", "cerise", "violet", "eggplant", "purple", "lapis",
  "persian", "cerulean", "aqua", "damselfly", "scooter", "caribbean",
  "emerald", "malachite", "lima", "inch-worm", "lime", "candlelight",
  "midas", "lightning", "dough", "meteor", "mars", "pumpkin",
  "cinnabar", "crimson", "curtain",
]);

const SEMANTIC_KEYS = new Set([
  "border-radius", "spacing", "dimension",
  "color-border", "color-interactive", "color-content",
  "color-status", "color-surface",
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a Figma key name to a clean CSS-friendly kebab name. */
function cleanKey(key: string): string {
  return key
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

/** Check if a node is a leaf token (has $value). */
function isToken(node: unknown): node is FigmaToken {
  return typeof node === "object" && node !== null && "$value" in node;
}

/** Map Figma $type to DTCG $type. */
function mapType(figmaType: string, scopes: string[] = []): string {
  if (figmaType === "color") return "color";
  if (figmaType === "string") return "string";
  if (figmaType === "float") {
    if (scopes.includes("CORNER_RADIUS")) return "dimension";
    if (scopes.includes("GAP")) return "dimension";
    if (scopes.includes("WIDTH_HEIGHT")) return "dimension";
    // Font size floats
    return "dimension";
  }
  return figmaType;
}

/**
 * Format $value: append "px" to numeric dimension values.
 * Qualify alias references to full paths.
 */
function formatValue(value: unknown, type: string): string | number {
  if (typeof value === "number") {
    if (type === "dimension") return `${value}px`;
    return value;
  }
  if (typeof value !== "string") return String(value);

  // Qualify alias references: {brand.900} → {brand.900} (primitives stay as-is,
  // they're at the top level of the merged token tree)
  // {border-radius.radius-04} → {border-radius.radius-04} (also top-level)
  // No qualification needed since we don't use a namespace wrapper.
  return value;
}

/** Recursively convert a Figma token tree to DTCG format. */
function convertTree(tree: FigmaTree, parentKey = ""): DtcgTree {
  const result: DtcgTree = {};

  for (const [rawKey, node] of Object.entries(tree)) {
    const key = cleanKey(rawKey);

    if (isToken(node)) {
      const scopes = node.$scopes ?? [];
      const type = mapType(node.$type, scopes);
      const value = formatValue(node.$value, type);
      result[key] = { $type: type, $value: value };
    } else {
      result[key] = convertTree(node as FigmaTree, key);
    }
  }

  return result;
}

/** Write a DTCG JSON file, creating directories as needed. */
function writeDtcg(path: string, data: DtcgTree): void {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`  wrote ${path.replace(__dirname + "/", "")}`);
}

// ─── Main transform ───────────────────────────────────────────────────────────

function transformPrimitiveTokens(): void {
  console.log("Transforming primitive-tokens.json...");

  const raw = JSON.parse(readFileSync(PRIMITIVE_EXPORT, "utf-8"));

  // Strip array wrapper if present
  const root = Array.isArray(raw) ? raw[0] : raw;

  // Navigate to Primitive.modes.Light
  const light = root?.Primitive?.modes?.Light ?? root?.modes?.Light ?? root;

  const primitives: DtcgTree = convertTree(light as FigmaTree);

  writeDtcg(resolve(SRC_DIR, "primitive/colors.json"), primitives);
}

function transformUiTokens(): void {
  console.log("Transforming ui-tokens.json...");

  const raw = JSON.parse(readFileSync(UI_EXPORT, "utf-8"));

  // ui-tokens.json is an array of 3 collections: [Component, Semantic, Typography]
  const collections = Array.isArray(raw) ? raw : [raw];

  for (const collection of collections) {
    const name: string = collection.name ?? collection.$collectionName ?? "";

    if (name.toLowerCase().includes("component")) {
      const desktop = collection.modes?.Desktop ?? collection.modes?.["Desktop"];
      if (desktop) {
        transformComponentTokens(desktop as FigmaTree);
      }
    } else if (name.toLowerCase().includes("semantic")) {
      const value = collection.modes?.Value ?? collection.modes?.["Value"];
      if (value) {
        transformSemanticTokens(value as FigmaTree);
      }
    } else if (name.toLowerCase().includes("typography")) {
      const desktop = collection.modes?.Desktop ?? collection.modes?.["Desktop"];
      if (desktop) {
        transformTypographyTokens(desktop as FigmaTree);
      }
    }
  }
}

function transformComponentTokens(tokens: FigmaTree): void {
  const converted = convertTree(tokens);

  // Separate radius tokens from button tokens
  const radius: DtcgTree = {};
  const button: DtcgTree = {};

  for (const [key, value] of Object.entries(converted)) {
    if (key.startsWith("radius")) {
      // radius-interactive, radius-checkbox, radius-status
      const shortKey = key.replace(/^radius-/, "");
      if (!radius["radius"]) radius["radius"] = {} as DtcgTree;
      (radius["radius"] as DtcgTree)[shortKey] = value as DtcgToken;
    } else if (key === "button" || key.toLowerCase() === "button") {
      button["Button"] = value as DtcgTree;
    } else if (key === "Button") {
      button["Button"] = value as DtcgTree;
    }
  }

  if (Object.keys(radius).length > 0) {
    writeDtcg(resolve(SRC_DIR, "component/radius.json"), radius);
  }
  if (Object.keys(button).length > 0) {
    writeDtcg(resolve(SRC_DIR, "component/button.json"), button);
  }
}

function transformSemanticTokens(tokens: FigmaTree): void {
  const converted = convertTree(tokens);

  // Write each semantic group to its own file
  const fileMap: Record<string, string> = {
    "color-border":      "semantic/color-border.json",
    "color-interactive": "semantic/color-interactive.json",
    "color-content":     "semantic/color-content.json",
    "color-status":      "semantic/color-status.json",
    "color-surface":     "semantic/color-surface.json",
    "border-radius":     "semantic/border-radius.json",
    "spacing":           "semantic/spacing.json",
    "dimension":         "semantic/dimension.json",
  };

  for (const [key, fileName] of Object.entries(fileMap)) {
    if (converted[key]) {
      writeDtcg(resolve(SRC_DIR, fileName), { [key]: converted[key] } as DtcgTree);
    }
  }
}

function transformTypographyTokens(tokens: FigmaTree): void {
  const converted = convertTree(tokens);

  // Map Figma typography keys to our DTCG structure
  const fontSize: DtcgTree = {};
  const fontFamilies: DtcgTree = {};

  for (const [key, value] of Object.entries(converted)) {
    if (key === "font-size" || key === "font size") {
      fontSize["type"] = { size: value as DtcgTree } as DtcgTree;
    } else if (key === "font-families" || key === "font families") {
      fontFamilies["type"] = { font: value as DtcgTree } as DtcgTree;
    }
  }

  if (Object.keys(fontSize).length > 0) {
    writeDtcg(resolve(SRC_DIR, "typography/font-size.json"), fontSize);
  }
  if (Object.keys(fontFamilies).length > 0) {
    writeDtcg(resolve(SRC_DIR, "typography/font-families.json"), fontFamilies);
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

try {
  transformPrimitiveTokens();
  transformUiTokens();
  console.log("✓ Transform complete. Run `pnpm build:tokens` to regenerate CSS.");
} catch (err) {
  if ((err as NodeJS.ErrnoException).code === "ENOENT") {
    console.error(`
✗ Figma export files not found.

Place your Figma export files at the monorepo root:
  primitive-tokens.json
  ui-tokens.json

Then re-run: pnpm transform
`);
    process.exit(1);
  }
  throw err;
}
