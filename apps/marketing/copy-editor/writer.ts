import type { CopyEntry } from "./indexer.ts";

/** Entities the site's JSX actually uses. Anything else stays literal on rewrite. */
const ENTITIES: Record<string, string> = {
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", apos: "'", quot: '"',
  nbsp: " ", mdash: "—", ndash: "–", hellip: "…", copy: "©",
  middot: "·", times: "×", rarr: "→", larr: "←", trade: "™",
};

const WRAP_COLUMN = 80;

/** Keep the file's habit: if it wrote `&rsquo;`, a retyped ’ goes back as `&rsquo;`. */
function encodeJsxText(text: string, previousRaw: string): string {
  const reuse = new Map<string, string>();
  for (const match of previousRaw.matchAll(/&(\w+);/g)) {
    const char = ENTITIES[match[1]];
    if (char) reuse.set(char, match[0]);
  }
  let out = "";
  for (const char of text) {
    if (char === "{") out += "&#123;";
    else if (char === "}") out += "&#125;";
    else if (char === "<") out += "&lt;";
    else if (char === ">") out += "&gt;";
    else if (char === "&") out += "&amp;";
    else out += reuse.get(char) ?? char;
  }
  return out;
}

/** A line break inside JSX text renders as a single space, so wrapping is safe. */
function wrapJsxText(encoded: string, source: string, start: number): string {
  const lineStart = source.lastIndexOf("\n", start - 1) + 1;
  const before = source.slice(lineStart, start);
  // Text that shares its line with a tag can't be re-indented.
  if (before.trim() !== "") return encoded;

  const lines: string[] = [];
  let line = "";
  for (const word of encoded.split(" ")) {
    if (line && before.length + line.length + 1 + word.length > WRAP_COLUMN) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  lines.push(line);
  return lines.join(`\n${before}`);
}

function encodeString(text: string, quote: string): string {
  let out = "";
  for (const char of text) {
    if (char === "\\") out += "\\\\";
    else if (char === "\n") out += "\\n";
    else if (char === "\r") out += "\\r";
    else if (char === "\t") out += "\\t";
    else if (char === quote) out += `\\${char}`;
    else out += char;
  }
  return out;
}

const encodeTemplate = (text: string): string =>
  text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

/** The source text an entry should hold for `text`, without touching the file. */
export function encodeEntry(entry: CopyEntry, text: string, source: string): string {
  if (entry.kind === "jsx") {
    const flat = text.replace(/\s*\n\s*/g, " ").replace(/[ \t]+/g, " ").trim();
    return wrapJsxText(encodeJsxText(flat, entry.raw), source, entry.start);
  }
  if (entry.kind === "template") return encodeTemplate(text);
  return encodeString(text, source[entry.start - 1]);
}

export const replaceRange = (source: string, start: number, end: number, raw: string): string =>
  source.slice(0, start) + raw + source.slice(end);
