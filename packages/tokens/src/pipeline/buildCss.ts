/**
 * Style Dictionary CSS build pipeline.
 *
 * Takes the output of transformConfig() and runs Style Dictionary to produce:
 *   - Base CSS file: all primitive, radius, spacing, and typography tokens
 *     as CSS custom properties on :root
 *   - Semantic defaults on :root (light mode values)
 *   - Per-mode overrides: [data-theme="dark"] { ... } etc.
 *
 * Returns the generated CSS as a string (no file I/O — callers decide
 * where to write it).
 */

import type { TransformResult } from "./transform.js";
import { semanticColorTokens } from "../definitions/semantic-color.js";
import { componentTokens } from "../definitions/component-tokens.js";

// ─── CSS property name formatter ──────────────────────────────────────────────

/**
 * Convert a dot-separated token path to a CSS custom property name.
 * e.g. "color.brand.500" → "--color-brand-500"
 *      "type.font.heading" → "--type-font-heading"
 */
function pathToCssVar(path: string[]): string {
  return "--" + path.join("-");
}

// ─── Deep-flatten a token tree ────────────────────────────────────────────────

interface FlatToken {
  path: string[];
  value: string | number;
  type: string;
}

function flattenTokenTree(
  tree: Record<string, unknown>,
  prefix: string[] = [],
): FlatToken[] {
  const result: FlatToken[] = [];
  for (const [key, node] of Object.entries(tree)) {
    const currentPath = [...prefix, key];
    if (
      node !== null &&
      typeof node === "object" &&
      "$value" in (node as object)
    ) {
      const token = node as { $value: string | number; $type: string };
      result.push({ path: currentPath, value: token.$value, type: token.$type });
    } else if (typeof node === "object" && node !== null) {
      result.push(...flattenTokenTree(node as Record<string, unknown>, currentPath));
    }
  }
  return result;
}

// ─── Alias resolution ─────────────────────────────────────────────────────────

/**
 * Resolve a {color.brand.500} style alias against the flat token map.
 * Returns the resolved hex value or the original value if not an alias.
 */
function resolveAlias(
  value: string | number,
  flatMap: Map<string, string | number>,
  depth = 0,
): string | number {
  if (typeof value !== "string") return value;
  if (!value.startsWith("{") || !value.endsWith("}")) return value;
  if (depth > 10) return value; // cycle guard

  const refPath = value.slice(1, -1); // strip braces
  const resolved = flatMap.get(refPath);
  // Unresolvable alias — emit transparent so the CSS remains valid
  if (resolved === undefined) return "transparent";
  return resolveAlias(resolved, flatMap, depth + 1);
}

/**
 * Build a flat map of "path.joined" → resolved value from all token layers.
 * Used for alias resolution in component and semantic tokens.
 */
function buildFlatMap(
  ...trees: Record<string, unknown>[]
): Map<string, string | number> {
  const map = new Map<string, string | number>();
  for (const tree of trees) {
    const flat = flattenTokenTree(tree);
    for (const token of flat) {
      map.set(token.path.join("."), token.value);
    }
  }
  return map;
}

// ─── CSS block generation ─────────────────────────────────────────────────────

function declarationsToBlock(declarations: string[], selector: string): string {
  if (declarations.length === 0) return "";
  return `${selector} {\n${declarations.map((d) => `  ${d}`).join("\n")}\n}\n`;
}

// ─── Main build function ──────────────────────────────────────────────────────

export interface CssBuildResult {
  /** Full generated CSS string */
  css: string;
  /** List of all emitted custom property names (for validation/testing) */
  propertyNames: string[];
}

/**
 * Build CSS custom properties from a TransformResult.
 *
 * This function does NOT use the Style Dictionary CLI — it runs the
 * transform pipeline programmatically and returns the CSS string.
 * Style Dictionary is used for its token resolution model; we handle
 * the CSS output format ourselves to keep full control.
 */
export function buildCss(result: TransformResult): CssBuildResult {
  const { primitiveTokens, radiusTokens, spacingTokens, typeTokens, modeOverrides } = result;

  const propertyNames: string[] = [];
  const rootDeclarations: string[] = [];

  // ── 1. Primitive tokens on :root ─────────────────────────────────────────
  for (const tree of [primitiveTokens, radiusTokens, spacingTokens, typeTokens]) {
    const flat = flattenTokenTree(tree as Record<string, unknown>);
    for (const token of flat) {
      const prop = pathToCssVar(token.path);
      rootDeclarations.push(`${prop}: ${token.value};`);
      propertyNames.push(prop);
    }
  }

  // ── 2. Default semantic tokens (light mode) on :root ─────────────────────
  // Build the flat map for alias resolution
  const allPrimitives = buildFlatMap(
    primitiveTokens as Record<string, unknown>,
    radiusTokens as Record<string, unknown>,
  );

  const semanticFlat = flattenTokenTree(
    semanticColorTokens as unknown as Record<string, unknown>,
  );
  for (const token of semanticFlat) {
    const resolved = resolveAlias(token.value, allPrimitives);
    const prop = pathToCssVar(token.path);
    rootDeclarations.push(`${prop}: ${resolved};`);
    propertyNames.push(prop);
  }

  // ── 3. Component tokens on :root ─────────────────────────────────────────
  // Build a combined map including semantic tokens for alias resolution
  const semanticMap = new Map(allPrimitives);
  for (const token of semanticFlat) {
    const resolved = resolveAlias(token.value, allPrimitives);
    semanticMap.set(token.path.join("."), resolved);
  }

  const componentFlat = flattenTokenTree(
    componentTokens as unknown as Record<string, unknown>,
  );
  for (const token of componentFlat) {
    const resolved = resolveAlias(token.value, semanticMap);
    const prop = pathToCssVar(token.path);
    rootDeclarations.push(`${prop}: ${resolved};`);
    propertyNames.push(prop);
  }

  // ── 4. Mode override blocks ───────────────────────────────────────────────
  const modeBlocks: string[] = [];

  // The "light" mode is the default (already on :root via semantic defaults).
  // We still emit [data-theme="light"] so explicit mode switching works.
  for (const [modeName, semanticValues] of Object.entries(modeOverrides)) {
    const declarations: string[] = [];

    for (const [semanticKey, hex] of Object.entries(semanticValues)) {
      // Semantic keys use dot notation: "color-surface.base" or "color-text.text-primary"
      // Convert to CSS var: --color-surface-base, --color-text-text-primary
      const parts = semanticKey.split(".");
      const prop = pathToCssVar(parts);
      declarations.push(`${prop}: ${hex};`);
    }

    if (declarations.length > 0) {
      modeBlocks.push(
        declarationsToBlock(declarations, `[data-theme="${modeName}"]`),
      );
    }
  }

  const css = [
    "/* Generated by @ui-organized/tokens — do not edit manually */\n",
    declarationsToBlock(rootDeclarations, ":root"),
    ...modeBlocks,
  ].join("\n");

  return { css, propertyNames };
}

