/**
 * The docs site's syntax highlighter: Shiki with its css-variables theme, so
 * the colours come from CodeBlock's own `--code-*` palette and follow the
 * site's light and dark themes.
 *
 * Loaded lazily through `useHighlighter`: the grammars are far too heavy for
 * a page's first chunk, and a block reads fine as plain text until they land.
 * Only these languages are bundled; anything else stays plain.
 */
import { createCssVariablesTheme, createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import diff from "shiki/langs/diff.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import jsonc from "shiki/langs/jsonc.mjs";
import jsx from "shiki/langs/jsx.mjs";
import shellscript from "shiki/langs/shellscript.mjs";
import svelte from "shiki/langs/svelte.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import vue from "shiki/langs/vue.mjs";
import type { CodeHighlighter } from "@ui-organized/react";

const THEME = "ui-organized";

const highlighter = createHighlighterCoreSync({
  themes: [createCssVariablesTheme({ name: THEME, variablePrefix: "--shiki-", fontStyle: true })],
  langs: [css, diff, html, javascript, json, jsonc, jsx, shellscript, svelte, tsx, typescript, vue],
  engine: createJavaScriptRegexEngine(),
});

/** The site's names for languages Shiki knows by another. */
const ALIASES: Record<string, string> = {
  sh: "shellscript",
  bash: "shellscript",
  shell: "shellscript",
  ts: "typescript",
  js: "javascript",
};

const cache = new Map<string, CodeHighlighter>();

/** A highlighter for one language, the same function every time; undefined for a language not bundled. */
export function highlighterFor(language?: string): CodeHighlighter | undefined {
  if (!language) return undefined;
  const lang = ALIASES[language] ?? language;
  if (!highlighter.getLoadedLanguages().includes(lang)) return undefined;
  let fn = cache.get(lang);
  if (!fn) {
    fn = (code) => highlighter.codeToHtml(code, { lang, theme: THEME });
    cache.set(lang, fn);
  }
  return fn;
}
