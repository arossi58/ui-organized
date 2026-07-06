/**
 * Layer 4 — retroactive verification pass (Connect.md §7.4).
 *
 * Statically scans generated files' imports and JSX usage against the manifest and
 * flags what the earlier layers can't guarantee (an agent can ignore the Layer 2
 * instruction):
 *  - a component imported from `@ui-organized/react` that ISN'T a real manifest
 *    component — i.e. a hallucination (error);
 *  - a JSX prop that isn't in the component's manifest signature (error);
 *  - a usage of a non-exact mapping (deprecated or stale) with no Layer 2
 *    annotation above it (error) — this is what catches an ignored §7.2 instruction;
 *  - use of a deprecated component (warning).
 *
 * Run as a CI gate the same way lint/type-check gate (§7.4). Node-only (TS AST + fs).
 */

import ts from "typescript";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import type { ComponentManifestEntry } from "../schema.js";
import type { ManifestLoader } from "../mcp/manifest-loader.js";
import { computeStaleness } from "../mcp/staleness.js";
import { ANNOTATION_MARKER } from "./annotation.js";

const PKG = "@ui-organized/react";

export type FindingKind =
  | "unresolved-import"
  | "deprecated-import"
  | "unknown-prop"
  | "missing-annotation";

export interface VerifyFinding {
  file: string;
  line: number;
  severity: "error" | "warning";
  kind: FindingKind;
  message: string;
}

/** Props valid on any host element — never flagged as "unknown". */
const ALLOWED_PROPS = new Set([
  "className", "style", "id", "key", "ref", "children", "role", "tabIndex",
  "title", "hidden", "dir", "lang", "slot", "onClick",
]);
function isAllowedProp(name: string): boolean {
  return ALLOWED_PROPS.has(name) || /^(on[A-Z]|aria-|data-)/.test(name);
}

/** Look back a few lines from `startPos` for a Code Connect annotation. */
function annotatedAbove(text: string, startPos: number): boolean {
  const before = text.slice(0, startPos);
  const lines = before.split("\n").slice(-5);
  return lines.some((l) => l.includes(ANNOTATION_MARKER));
}

export function verifyGeneratedCode(
  files: string[],
  loader: ManifestLoader,
  repoRoot = process.cwd(),
): VerifyFinding[] {
  const byName = new Map<string, ComponentManifestEntry>();
  for (const e of loader.all()) if (!byName.has(e.codeName)) byName.set(e.codeName, e);

  const requiresAnnotation = (e: ComponentManifestEntry): boolean =>
    e.status === "deprecated" || computeStaleness(e, loader).isStale;

  const findings: VerifyFinding[] = [];

  for (const file of files) {
    const rel = relative(repoRoot, file);
    const text = readFileSync(file, "utf8");
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const lineOf = (pos: number) => sf.getLineAndCharacterOfPosition(pos).line + 1;

    // 1. Imports from @ui-organized/react → localName → { imported name, line }.
    const imported = new Map<string, string>();
    for (const stmt of sf.statements) {
      if (
        ts.isImportDeclaration(stmt) &&
        ts.isStringLiteral(stmt.moduleSpecifier) &&
        stmt.moduleSpecifier.text === PKG
      ) {
        const named = stmt.importClause?.namedBindings;
        if (named && ts.isNamedImports(named)) {
          for (const el of named.elements) {
            const name = (el.propertyName ?? el.name).text;
            imported.set(el.name.text, name);
            const entry = byName.get(name);
            if (!entry) {
              findings.push({
                file: rel,
                line: lineOf(el.getStart(sf)),
                severity: "error",
                kind: "unresolved-import",
                message: `'${name}' is imported from ${PKG} but is not a known component in the manifest — possible hallucination.`,
              });
            } else if (entry.status === "deprecated") {
              findings.push({
                file: rel,
                line: lineOf(el.getStart(sf)),
                severity: "warning",
                kind: "deprecated-import",
                message: `'${name}' maps to a deprecated component; consider a current one.`,
              });
            }
          }
        }
      }
    }

    // 2. JSX usage → prop checks + missing-annotation checks.
    const walk = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sf);
        const name = imported.get(tag);
        const entry = name ? byName.get(name) : undefined;
        if (entry) {
          const known = new Set(entry.props.map((p) => p.name));
          for (const attr of node.attributes.properties) {
            if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name)) {
              const pn = attr.name.text;
              if (!known.has(pn) && !isAllowedProp(pn)) {
                findings.push({
                  file: rel,
                  line: lineOf(attr.getStart(sf)),
                  severity: "error",
                  kind: "unknown-prop",
                  message: `<${tag}> has prop '${pn}' that is not in ${entry.codeName}'s manifest signature.`,
                });
              }
            }
          }
          if (requiresAnnotation(entry) && !annotatedAbove(text, node.getStart(sf))) {
            findings.push({
              file: rel,
              line: lineOf(node.getStart(sf)),
              severity: "error",
              kind: "missing-annotation",
              message: `<${tag}> uses a non-exact mapping (${entry.status === "deprecated" ? "deprecated" : "stale"}) without a Code Connect annotation above it.`,
            });
          }
        }
      }
      ts.forEachChild(node, walk);
    };
    walk(sf);
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}
