/**
 * Angular scanner — the `@ui-organized/angular` counterpart of `scan-react.ts`.
 *
 * Angular declares a component's API on its class, not in a `${Name}Props`
 * interface: `readonly intent = input<ButtonIntent>("primary")`. The type
 * argument is usually an alias (`ButtonIntent`, `ControlSize`, or
 * `NonNullable<TagVariants["variant"]>`), so this uses a full TypeScript program
 * and its checker to turn it into the literal union an agent can use.
 *
 * Read per exported component or directive class:
 *  - its `selector`, from the decorator;
 *  - every `input()` / `input<T>()` / `input.required<T>()` — the prop's name
 *    (or its `alias`), type, default and doc comment;
 *  - every `model()` / `model<T>()`, the same way, marked two-way.
 * Outputs are already listed in specs from the export surface
 * (`parseAngularOutputs`), so they aren't repeated as props here.
 */

import ts from "typescript";
import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import type { PropDefinition } from "../schema.js";
import { hashProps } from "../hash.js";
import type { ScannedComponent } from "./scan-react.js";

export const ANGULAR_ROOTS: { pkg: string; index: string; tsconfig: string }[] = [
  { pkg: "@ui-organized/angular", index: "packages/angular/src/public-api.ts", tsconfig: "packages/angular/tsconfig.json" },
  {
    pkg: "@ui-organized/angular-table",
    index: "packages/angular-table/src/public-api.ts",
    tsconfig: "packages/angular-table/tsconfig.json",
  },
];

function programFor(repoRoot: string, root: (typeof ANGULAR_ROOTS)[number]): ts.Program | null {
  const index = resolve(repoRoot, root.index);
  if (!existsSync(index)) return null;
  const configPath = resolve(repoRoot, root.tsconfig);
  let options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
  };
  if (existsSync(configPath)) {
    const read = ts.readConfigFile(configPath, ts.sys.readFile);
    if (!read.error) {
      options = { ...ts.parseJsonConfigFileContent(read.config, ts.sys, dirname(configPath)).options, noEmit: true };
    }
  }
  return ts.createProgram([index], options);
}

function decoratorOf(node: ts.ClassDeclaration): ts.CallExpression | undefined {
  for (const decorator of ts.getDecorators(node) ?? []) {
    const call = decorator.expression;
    if (ts.isCallExpression(call) && ts.isIdentifier(call.expression) && ["Component", "Directive"].includes(call.expression.text)) {
      return call;
    }
  }
  return undefined;
}

function selectorOf(decorator: ts.CallExpression): string | undefined {
  const config = decorator.arguments[0];
  if (!config || !ts.isObjectLiteralExpression(config)) return undefined;
  for (const prop of config.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === "selector") {
      const value = prop.initializer;
      if (ts.isStringLiteralLike(value)) return value.text.replace(/\s+/g, " ").trim();
    }
  }
  return undefined;
}

/** `input`, `input.required`, `model`, `model.required` — the signal API's declarations. */
function signalCall(init: ts.Expression | undefined): { kind: "input" | "model"; required: boolean; call: ts.CallExpression } | undefined {
  if (!init || !ts.isCallExpression(init)) return undefined;
  const callee = init.expression;
  if (ts.isIdentifier(callee) && (callee.text === "input" || callee.text === "model")) {
    return { kind: callee.text, required: false, call: init };
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    (callee.expression.text === "input" || callee.expression.text === "model") &&
    callee.name.text === "required"
  ) {
    return { kind: callee.expression.text, required: true, call: init };
  }
  return undefined;
}

/** A public alias from the options object, `input(x, { alias: "name" })`. */
function aliasOf(call: ts.CallExpression, required: boolean): string | undefined {
  const options = call.arguments[required ? 0 : 1];
  if (!options || !ts.isObjectLiteralExpression(options)) return undefined;
  for (const prop of options.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === "alias" && ts.isStringLiteralLike(prop.initializer)) {
      return prop.initializer.text;
    }
  }
  return undefined;
}

/** A type as an agent should read it: literal unions spelled out, `undefined` dropped. */
function formatType(type: ts.Type, checker: ts.TypeChecker): string {
  const members = type.isUnion() ? type.types : [type];
  const kept = members.filter((t) => !(t.flags & ts.TypeFlags.Undefined));
  const literal = (t: ts.Type) => t.isStringLiteral() || t.isNumberLiteral() || !!(t.flags & ts.TypeFlags.BooleanLiteral);
  if (kept.length && kept.every(literal)) {
    const texts = kept.map((t) => checker.typeToString(t));
    // `true | false` is how the checker spells `boolean`.
    if (texts.length === 2 && texts.includes("true") && texts.includes("false")) return "boolean";
    return texts.join(" | ");
  }
  const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
  const texts = kept.map((t) => checker.typeToString(t, undefined, flags));
  // A mixed union still spells `boolean` as `false | true`; fold it back.
  if (texts.includes("true") && texts.includes("false")) {
    return ["boolean", ...texts.filter((t) => t !== "true" && t !== "false")].join(" | ");
  }
  return texts.join(" | ") || checker.typeToString(type);
}

function defaultOf(call: ts.CallExpression, required: boolean, sf: ts.SourceFile): string | undefined {
  if (required) return undefined;
  const arg = call.arguments[0];
  if (!arg || (ts.isIdentifier(arg) && arg.text === "undefined")) return undefined;
  return ts.isStringLiteralLike(arg) ? arg.text : arg.getText(sf);
}

function docOf(symbol: ts.Symbol | undefined, checker: ts.TypeChecker): string | undefined {
  if (!symbol) return undefined;
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).replace(/\s+/g, " ").trim();
  return text ? text.split(/(?<=\.)\s/)[0] : undefined;
}

function propsOf(node: ts.ClassDeclaration, checker: ts.TypeChecker, sf: ts.SourceFile): PropDefinition[] {
  const props: PropDefinition[] = [];
  for (const member of node.members) {
    if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) continue;
    if (member.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)) continue;
    const signal = signalCall(member.initializer);
    if (!signal) continue;
    const { kind, required, call } = signal;

    const typeArg = call.typeArguments?.[0];
    const type = typeArg
      ? formatType(checker.getTypeFromTypeNode(typeArg), checker)
      : call.arguments[0] && !required
        ? checker.typeToString(checker.getBaseTypeOfLiteralType(checker.getTypeAtLocation(call.arguments[0])))
        : "unknown";

    const description = docOf(checker.getSymbolAtLocation(member.name), checker);
    const name = aliasOf(call, required) ?? member.name.text;
    const defaultValue = defaultOf(call, required, sf);
    props.push({
      name,
      type,
      required,
      ...(defaultValue !== undefined ? { defaultValue } : {}),
      ...(kind === "model"
        ? { description: `Two-way: bind with [(${name})]${description ? `. ${description}` : "."}` }
        : description
          ? { description }
          : {}),
    });
  }
  return props.sort((a, b) => a.name.localeCompare(b.name));
}

/** Every exported Angular component or directive, with its selector and signal inputs. */
export function scanAngular(repoRoot: string): ScannedComponent[] {
  const scanned: ScannedComponent[] = [];
  for (const root of ANGULAR_ROOTS) {
    const program = programFor(repoRoot, root);
    if (!program) continue;
    const checker = program.getTypeChecker();
    const indexFile = program.getSourceFile(resolve(repoRoot, root.index));
    const moduleSymbol = indexFile && checker.getSymbolAtLocation(indexFile);
    if (!moduleSymbol) continue;

    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const decl = symbol.declarations?.find(ts.isClassDeclaration);
      if (!decl) continue;
      const decorator = decoratorOf(decl);
      if (!decorator) continue;

      const sf = decl.getSourceFile();
      const props = propsOf(decl, checker, sf);
      const codeName = exported.name;
      const selector = selectorOf(decorator);
      scanned.push({
        codeName,
        codePath: relative(repoRoot, sf.fileName),
        framework: "angular",
        importStatement: `import { ${codeName} } from '${root.pkg}';`,
        ...(selector ? { selector } : {}),
        props,
        propSignatureHash: hashProps(props),
        usageSnippet: selector ? `<!-- ${selector} -->` : `<!-- ${codeName} -->`,
      });
    }
  }
  scanned.sort((a, b) => a.codeName.localeCompare(b.codeName));
  return scanned;
}
