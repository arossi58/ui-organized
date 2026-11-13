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
import { REFERENCE_BUDGET, REFERENCE_DEPTH, UTILITY_TYPES, typeNamesInText, type ScannedComponent } from "./scan-react.js";

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

// ─── Named types the inputs refer to ─────────────────────────────────────────
// The same field `scan-react.ts` writes (`referencedTypes`), read through the
// checker instead of by name: an input's type argument is resolved to its
// declaration, which is written out if it lives in this repo's packages.

type NamedDecl = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;

/** A declaration in one of this repo's packages: not a dependency's, not TypeScript's lib. */
function isOurs(decl: ts.Declaration, repoRoot: string): boolean {
  const file = decl.getSourceFile().fileName;
  return file.startsWith(`${resolve(repoRoot, "packages")}/`) && !file.includes("/node_modules/");
}

/** The interface or alias a type name resolves to, through any import alias. */
function declarationOf(name: ts.Node, checker: ts.TypeChecker): NamedDecl | undefined {
  let symbol = checker.getSymbolAtLocation(name);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return symbol?.declarations?.find((d): d is NamedDecl => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
}

/** Every declaration of ours a type node names, in order. */
function ourTypesIn(node: ts.Node, checker: ts.TypeChecker, repoRoot: string): NamedDecl[] {
  const out: NamedDecl[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isTypeReferenceNode(n)) {
      const decl = declarationOf(n.typeName, checker);
      if (decl && isOurs(decl, repoRoot)) out.push(decl);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return out;
}

const SHAPE_FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

/** One member of an object shape, typed by the checker: `disabled?: boolean`. */
function memberText(member: ts.TypeElement, checker: ts.TypeChecker): string {
  const name = member.name?.getText() ?? "";
  const optional = member.questionToken ? "?" : "";
  if (ts.isPropertySignature(member) && member.type) {
    const readonly = member.modifiers?.some((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword) ? "readonly " : "";
    return `${readonly}${name}${optional}: ${formatType(checker.getTypeFromTypeNode(member.type), checker)}`;
  }
  if (ts.isMethodSignature(member)) {
    return `${name}${optional}: ${checker.typeToString(checker.getTypeAtLocation(member), undefined, SHAPE_FLAGS)}`;
  }
  return member.getText().replace(/\s+/g, " ").replace(/[;,]\s*$/, "").trim();
}

/** An interface's members with its bases' of ours merged in; a base that isn't ours is kept by name. */
function interfaceMembers(
  decl: ts.InterfaceDeclaration,
  checker: ts.TypeChecker,
  repoRoot: string,
  seen = new Set<ts.Node>(),
): { members: Map<string, ts.TypeElement>; foreign: string[] } {
  const members = new Map<string, ts.TypeElement>();
  const foreign: string[] = [];
  if (!seen.has(decl)) {
    seen.add(decl);
    for (const clause of decl.heritageClauses ?? []) {
      if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
      for (const type of clause.types) {
        const base = declarationOf(type.expression, checker);
        if (base && ts.isInterfaceDeclaration(base) && isOurs(base, repoRoot)) {
          const fromBase = interfaceMembers(base, checker, repoRoot, seen);
          for (const [key, member] of fromBase.members) members.set(key, member);
          foreign.push(...fromBase.foreign);
        } else {
          foreign.push(checker.typeToString(checker.getTypeAtLocation(type), undefined, SHAPE_FLAGS));
        }
      }
    }
  }
  // A derived member wins over a base member of the same name.
  for (const member of decl.members) members.set(member.name?.getText() ?? member.getText(), member);
  return { members, foreign };
}

/**
 * Whether every name in an alias is a type parameter, a utility type or one of
 * ours, all the way down — see `aliasIsOurs` in `scan-react.ts`. All the way
 * down because angular-table's `TableColumn` is one of ours that renames
 * table-core's, which is TanStack's `ColumnDef`.
 */
function aliasIsOurs(
  decl: ts.TypeAliasDeclaration,
  checker: ts.TypeChecker,
  repoRoot: string,
  seen = new Set<ts.Node>(),
): boolean {
  const kind = decl.type.kind;
  if (kind >= ts.SyntaxKind.FirstKeyword && kind <= ts.SyntaxKind.LastKeyword) return false;
  if (seen.has(decl)) return true;
  seen.add(decl);
  const params = new Set(decl.typeParameters?.map((p) => p.name.text));
  let ours = true;
  const visit = (n: ts.Node) => {
    if (!ours) return;
    if (ts.isTypeQueryNode(n) || ts.isImportTypeNode(n)) {
      ours = false;
      return;
    }
    if (ts.isTypeReferenceNode(n)) {
      const name = ts.isIdentifier(n.typeName) ? n.typeName.text : "";
      const target = declarationOf(n.typeName, checker);
      const known =
        params.has(name) ||
        UTILITY_TYPES.has(name) ||
        (target !== undefined &&
          isOurs(target, repoRoot) &&
          (!ts.isTypeAliasDeclaration(target) || aliasIsOurs(target, checker, repoRoot, seen)));
      if (!known) {
        ours = false;
        return;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(decl.type);
  return ours;
}

/** A branded type (`IconGlyph`'s `[BRAND]` key) is opaque on purpose — see `isBranded` in `scan-react.ts`. */
function isBranded(members: readonly ts.TypeElement[]): boolean {
  return members.some((m) => m.name !== undefined && ts.isComputedPropertyName(m.name));
}

/** The checker writes `{ a: string; }`; the React scan writes `{ a: string }`. */
function tidy(text: string): string {
  return text.replace(/;\s*}/g, " }");
}

/** A declaration's compact shape, and the nodes inside it whose names are followed next. */
function shapeOf(decl: NamedDecl, checker: ts.TypeChecker, repoRoot: string): { text: string; inner: ts.Node[] } | null {
  const objectShape = (members: ts.TypeElement[], foreign: string[] = []) =>
    isBranded(members)
      ? null
      : {
          text: tidy(
            [...foreign, members.length ? `{ ${members.map((m) => memberText(m, checker)).join("; ")} }` : "{}"].join(" & "),
          ),
          inner: members,
        };
  if (ts.isInterfaceDeclaration(decl)) {
    const { members, foreign } = interfaceMembers(decl, checker, repoRoot);
    return objectShape([...members.values()], foreign);
  }
  if (!aliasIsOurs(decl, checker, repoRoot)) return null;
  if (ts.isTypeLiteralNode(decl.type)) return objectShape([...decl.type.members]);
  // An alias that applies a utility type (`Omit<TableFilterCondition, "id">`)
  // is written as declared: the checker could only print its own name or the
  // fully expanded result, and the expansion hides `TableFilterCondition`,
  // which has an entry of its own. Anything else is the checker's, with
  // `InTypeAlias` so it writes the alias's structure rather than its name.
  const text = ts.isTypeReferenceNode(decl.type)
    ? decl.type.getText().replace(/\s+/g, " ")
    : checker.typeToString(checker.getTypeFromTypeNode(decl.type), undefined, SHAPE_FLAGS | ts.TypeFormatFlags.InTypeAlias);
  return { text: tidy(text), inner: [decl.type] };
}

/**
 * What the named types in a class's inputs are, by name — the Angular half of
 * `referencedTypesFor` in `scan-react.ts`, with the same depth and the same
 * write-each-name-once guard against recursive types. It starts from the names
 * still in the props' types: an alias `formatType` already spelled out as its
 * union (`ButtonIntent`) has nothing left to explain.
 */
function referencedTypesOf(
  typeNodes: ts.TypeNode[],
  props: PropDefinition[],
  checker: ts.TypeChecker,
  repoRoot: string,
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  const seen = new Set<string>();
  let spent = 0;
  const named = new Set(props.flatMap((p) => typeNamesInText(p.type)));
  let frontier = typeNodes.flatMap((node) => ourTypesIn(node, checker, repoRoot)).filter((d) => named.has(d.name.text));
  for (let depth = 0; depth < REFERENCE_DEPTH && frontier.length; depth++) {
    const next: NamedDecl[] = [];
    for (const decl of frontier) {
      const name = decl.name.text;
      if (seen.has(name)) continue;
      seen.add(name);
      const shape = shapeOf(decl, checker, repoRoot);
      if (!shape) continue;
      if (depth > 0 && spent + shape.text.length > REFERENCE_BUDGET) continue;
      if (depth > 0) spent += shape.text.length;
      out[name] = shape.text;
      // Only names the shape still shows: `formatType` spells a literal alias
      // out, and `TourStep.type` written as its union needs no entry of its own.
      const shown = new Set(typeNamesInText(shape.text));
      next.push(...shape.inner.flatMap((node) => ourTypesIn(node, checker, repoRoot)).filter((d) => shown.has(d.name.text)));
    }
    frontier = next;
  }
  return Object.keys(out).length ? out : undefined;
}

/** The type argument of every public signal input or model, for `referencedTypesOf`. */
function inputTypeNodes(node: ts.ClassDeclaration): ts.TypeNode[] {
  return node.members.flatMap((member) => {
    if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) return [];
    if (member.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)) return [];
    const typeArg = signalCall(member.initializer)?.call.typeArguments?.[0];
    return typeArg ? [typeArg] : [];
  });
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
      const referencedTypes = referencedTypesOf(inputTypeNodes(decl), props, checker, repoRoot);
      const codeName = exported.name;
      const selector = selectorOf(decorator);
      scanned.push({
        codeName,
        codePath: relative(repoRoot, sf.fileName),
        framework: "angular",
        importStatement: `import { ${codeName} } from '${root.pkg}';`,
        ...(selector ? { selector } : {}),
        props,
        ...(referencedTypes ? { referencedTypes } : {}),
        propSignatureHash: hashProps(props),
        usageSnippet: selector ? `<!-- ${selector} -->` : `<!-- ${codeName} -->`,
      });
    }
  }
  scanned.sort((a, b) => a.codeName.localeCompare(b.codeName));
  return scanned;
}
