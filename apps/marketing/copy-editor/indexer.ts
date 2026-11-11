import { parse } from "@babel/parser";

/**
 * Finds the copy in a source file. Every entry records the exact byte range of
 * the string's contents, so the writer can replace it without touching the code
 * around it. Nothing here runs in production: see plugin.ts.
 */

export type EntryKind = "jsx" | "string" | "template";

export interface CopyEntry {
  /** Repo-relative path. */
  file: string;
  start: number;
  end: number;
  line: number;
  kind: EntryKind;
  /** The source text between `start` and `end`, verbatim. */
  raw: string;
  /** What a person edits: entities and escapes decoded, JSX wrapping removed. */
  text: string;
  /** What the browser renders, for matching against a clicked DOM node. */
  key: string;
}

export type FileRole = "site" | "guide" | "story";

/** Props whose strings are code, whatever they happen to look like. */
const CODE_ATTRS = new Set([
  "as", "className", "code", "d", "fill", "form", "height", "href", "htmlFor", "icon", "id",
  "intent", "key", "language", "lang", "method", "name", "path", "rel", "role", "size", "slug",
  "src", "stroke", "style", "tabIndex", "target", "to", "type", "value", "variant", "viewBox",
  "width",
]);

/** Object keys whose values are identifiers, paths or class names rather than copy. */
const CODE_KEYS = new Set([
  ...CODE_ATTRS,
  "codeName", "color", "example", "instead", "kind", "pkg", "sourcePath", "url",
]);

const CODE_CALLS = new Set(["console", "cn", "clsx", "require", "useTranslation"]);

export const normalizeKey = (text: string): string => text.replace(/\s+/g, " ").trim();

/** Usage guides and story descriptions render through InlineMarkdown. */
const stripInlineMarkdown = (text: string): string =>
  text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/(?<!\w)\*(.+?)\*(?!\w)/g, "$1").replace(/`([^`]+)`/g, "$1");

/** Copy has a space or a capital. `primary`, `sm` and `data-open` have neither. */
const looksLikeCopy = (text: string): boolean => {
  if (!/\p{L}/u.test(text)) return false;
  if (/^[./#@]|^https?:|^[\w-]+\/[\w./-]+$/.test(text)) return false;
  return /\s/.test(text.trim()) || /^\p{Lu}/u.test(text.trim());
};

type Node = { type: string; start: number; end: number; loc: { start: { line: number } } } & Record<string, unknown>;

const isNode = (value: unknown): value is Node =>
  typeof value === "object" && value !== null && typeof (value as Node).type === "string";

const keyName = (property: Node): string | undefined => {
  const key = property.key as Node | undefined;
  if (!key || property.computed) return undefined;
  if (key.type === "Identifier") return key.name as string;
  if (key.type === "StringLiteral") return key.value as string;
  return undefined;
};

const calleeRoot = (callee: Node): string | undefined => {
  let node = callee;
  while (node.type === "MemberExpression") node = node.object as Node;
  return node.type === "Identifier" ? (node.name as string) : undefined;
};

function isCopyContext(node: Node, ancestors: Node[], role: FileRole): boolean {
  const parent = ancestors[ancestors.length - 1];
  if (!parent) return false;

  if (
    parent.type === "BinaryExpression" ||
    parent.type === "SwitchCase" ||
    parent.type === "ImportDeclaration" ||
    parent.type === "ExportNamedDeclaration" ||
    parent.type === "ExportAllDeclaration" ||
    parent.type === "ImportExpression" ||
    parent.type === "TSLiteralType" ||
    parent.type === "MemberExpression" ||
    parent.type === "ExpressionStatement"
  ) {
    return false;
  }
  if (parent.type === "ObjectProperty" && parent.key === node) return false;

  let nearestProperty: string | undefined;
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (ancestor.type === "JSXAttribute") {
      const name = (ancestor.name as Node).name as string;
      if (CODE_ATTRS.has(name) || name.startsWith("data-")) return false;
    }
    if (ancestor.type === "ObjectProperty") {
      const name = keyName(ancestor);
      if (nearestProperty === undefined) nearestProperty = name;
      if (name && CODE_KEYS.has(name)) return false;
    }
    if (ancestor.type === "CallExpression" || ancestor.type === "NewExpression") {
      const root = calleeRoot(ancestor.callee as Node);
      if (root && CODE_CALLS.has(root)) return false;
    }
  }

  // A story file is mostly fixtures. Its one piece of site copy is the
  // description the docs page reads (registry.ts).
  if (role === "story") {
    const outer = ancestors.filter((a) => a.type === "ObjectProperty").map(keyName);
    return nearestProperty === "component" && outer.includes("description");
  }
  return true;
}

/** Throws if the source doesn't parse; the caller decides whether that matters. */
export function indexSource(file: string, source: string, role: FileRole = "site"): CopyEntry[] {
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
    errorRecovery: false,
  });

  const entries: CopyEntry[] = [];
  const markdown = role !== "site";

  const push = (start: number, end: number, line: number, kind: EntryKind, text: string) => {
    const display = kind === "jsx" ? text.replace(/[ \t\r\n]+/g, " ").trim() : text;
    if (!display.trim()) return;
    entries.push({
      file,
      start,
      end,
      line,
      kind,
      raw: source.slice(start, end),
      text: display,
      key: normalizeKey(markdown ? stripInlineMarkdown(display) : display),
    });
  };

  const walk = (node: Node, ancestors: Node[]) => {
    if (node.type === "JSXText") {
      if (role === "site") {
        const raw = node.extra ? ((node.extra as { raw: string }).raw) : source.slice(node.start, node.end);
        const leading = raw.length - raw.trimStart().length;
        const trailing = raw.length - raw.trimEnd().length;
        const line = source.slice(0, node.start + leading).split("\n").length;
        if (/\p{L}/u.test(node.value as string)) {
          push(node.start + leading, node.end - trailing, line, "jsx", node.value as string);
        }
      }
      return;
    }
    if (node.type === "StringLiteral") {
      const value = node.value as string;
      if (looksLikeCopy(value) && isCopyContext(node, ancestors, role)) {
        push(node.start + 1, node.end - 1, node.loc.start.line, "string", value);
      }
      return;
    }
    if (node.type === "TemplateLiteral") {
      // `${}` means the rendered text can't be traced back to one string.
      if ((node.expressions as unknown[]).length === 0) {
        const quasi = (node.quasis as Node[])[0];
        const value = (quasi.value as { cooked?: string }).cooked ?? "";
        if (looksLikeCopy(value) && isCopyContext(node, ancestors, role)) {
          push(node.start + 1, node.end - 1, node.loc.start.line, "template", value);
        }
      }
      return;
    }
    if (node.type.startsWith("TS") && node.type !== "TSAsExpression" && node.type !== "TSSatisfiesExpression") {
      return;
    }
    const next = [...ancestors, node];
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "extra" || key === "leadingComments" || key === "trailingComments") continue;
      const value = node[key];
      if (Array.isArray(value)) {
        for (const child of value) if (isNode(child)) walk(child, next);
      } else if (isNode(value)) {
        walk(value, next);
      }
    }
  };

  walk(ast.program as unknown as Node, []);
  return entries;
}
