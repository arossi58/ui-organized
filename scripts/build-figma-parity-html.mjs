#!/usr/bin/env node
// Renders FIGMA-PARITY.md to a single self-contained FIGMA-PARITY.html with a
// searchable sidebar, scroll-spy and a light/dark toggle.
//
//   node scripts/build-figma-parity-html.mjs
//
// The converter is deliberately narrow: it handles exactly the markdown the
// source file uses — h1/h2/h3, pipe tables (with `\|` escapes), fenced code
// blocks, ordered lists, horizontal rules, `code`, **bold** and *em*. It is not
// a general markdown implementation.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "FIGMA-PARITY.md");
const OUT = resolve(root, "FIGMA-PARITY.html");

const PROPERTY_KINDS = ["VARIANT", "BOOLEAN", "TEXT", "INSTANCE_SWAP"];

/* ------------------------------------------------------------------ inline */

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** `code` → placeholder, so bold/em never run inside a code span. */
function inline(md, { linkCode } = {}) {
  const spans = [];
  let out = escapeHtml(md).replace(/`([^`]+)`/g, (_, code) => {
    const href = linkCode?.(code);
    const chip = href
      ? `<a class="chip" href="#${href}"><code>${code}</code></a>`
      : `<code>${code}</code>`;
    spans.push(chip);
    return `\u0000${spans.length - 1}\u0000`;
  });
  out = out
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)]);
}

/** Plain text of a heading, for slugs and nav labels. */
const stripMarkup = (md) => md.replace(/[`*]/g, "").trim();

const slug = (text) =>
  stripMarkup(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Split a table row on unescaped pipes, unescaping `\|` as it goes. */
function splitRow(line) {
  const cells = [];
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (ch === "|") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  // Leading and trailing pipes produce empty edge cells.
  if (cells[0].trim() === "") cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === "") cells.pop();
  return cells.map((c) => c.trim());
}

const isKindCell = (text) =>
  text.length > 0 && text.split("+").every((part) => PROPERTY_KINDS.includes(part.trim()));

function renderCell(text, opts) {
  if (isKindCell(text)) {
    return text
      .split("+")
      .map((p) => p.trim())
      .map((p) => `<span class="kind kind--${p.toLowerCase()}">${p}</span>`)
      .join(" ");
  }
  if (text === "—" || text === "-") return `<span class="dash">—</span>`;
  return inline(text, opts);
}

/* ------------------------------------------------------------------- block */

function parse(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let i = 0;

  const flushParagraph = (buf) => {
    if (buf.length) blocks.push({ type: "p", text: buf.join(" ").trim() });
  };

  let para = [];
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flushParagraph(para);
      para = [];
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph(para);
      para = [];
      blocks.push({ type: "h", level: heading[1].length, text: heading[2].trim() });
      i++;
      continue;
    }

    if (/^-{3,}\s*$/.test(line)) {
      // Section separators; headings already delimit the content.
      flushParagraph(para);
      para = [];
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      flushParagraph(para);
      para = [];
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(splitRow(lines[i++]));
      const isDivider = (r) => r.every((c) => /^:?-{2,}:?$/.test(c));
      const head = rows.length > 1 && isDivider(rows[1]) ? rows[0] : null;
      const body = rows.filter((r, idx) => !(idx === 0 && head) && !isDivider(r));
      blocks.push({ type: "table", head, body });
      continue;
    }

    const ol = /^(\d+)\.\s+(.*)$/.exec(line);
    if (ol) {
      flushParagraph(para);
      para = [];
      const items = [];
      while (i < lines.length) {
        const m = /^(\d+)\.\s+(.*)$/.exec(lines[i]);
        if (m) {
          items.push(m[2]);
          i++;
        } else if (/^\s+\S/.test(lines[i]) && items.length) {
          items[items.length - 1] += " " + lines[i].trim();
          i++;
        } else break;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (line.trim() === "") {
      flushParagraph(para);
      para = [];
      i++;
      continue;
    }

    para.push(line.trim());
    i++;
  }
  flushParagraph(para);
  return blocks;
}

/* ------------------------------------------------------------------ render */

function build(markdown) {
  const blocks = parse(markdown);

  // Pre-pass: heading ids (deduped) and the component-name → id map used to
  // turn the §5 index into links.
  const seen = new Map();
  const idFor = new Map();
  const componentIds = new Map();
  let inComponentSpecs = false;

  for (const b of blocks) {
    if (b.type !== "h") continue;
    let id = slug(b.text) || "section";
    if (seen.has(id)) {
      const n = seen.get(id) + 1;
      seen.set(id, n);
      id = `${id}-${n}`;
    } else seen.set(id, 0);
    idFor.set(b, id);
    if (b.level === 2) inComponentSpecs = /^5\./.test(stripMarkup(b.text));
    if (b.level === 3 && inComponentSpecs) {
      componentIds.set(stripMarkup(b.text).replace(/\s*\(internal\)\s*$/, ""), id);
    }
  }

  const linkCode = (code) => componentIds.get(code.replace(/¹$/, "")) ?? null;

  const html = [];
  const nav = [];
  let openChapter = false;
  let openCard = false;
  let title = "Figma Parity";
  let intro = "";

  const closeCard = () => {
    if (openCard) html.push("</article>");
    openCard = false;
  };
  const closeChapter = () => {
    closeCard();
    if (openChapter) html.push("</section>");
    openChapter = false;
  };

  for (const b of blocks) {
    switch (b.type) {
      case "h": {
        const id = idFor.get(b);
        const plain = stripMarkup(b.text);
        if (b.level === 1) {
          title = plain;
          break;
        }
        const internal = /\*\(internal\)\*/.test(b.text);
        const label = plain.replace(/\s*\(internal\)\s*$/, "");
        if (b.level === 2) {
          closeChapter();
          const num = /^(\d+)\./.exec(plain);
          nav.push({ level: 2, id, label: plain.replace(/^\d+\.\s*/, ""), num: num?.[1] ?? null });
          html.push(`<section class="chapter" id="${id}-chapter">`);
          openChapter = true;
          html.push(
            `<h2 id="${id}" class="h2">` +
              (num ? `<span class="num">${num[1]}</span>` : "") +
              `<span>${inline(b.text.replace(/^\d+\.\s*/, ""))}</span>` +
              `<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h2>`,
          );
        } else {
          closeCard();
          nav.push({ level: 3, id, label, internal });
          html.push(`<article class="card">`);
          openCard = true;
          html.push(
            `<h3 id="${id}" class="h3"><span>${inline(label)}</span>` +
              (internal ? `<span class="tag">internal</span>` : "") +
              `<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h3>`,
          );
        }
        break;
      }
      case "p": {
        const isIndex = /^\*\*Index\.\*\*/.test(b.text);
        const lead = /^\*\*(Divergences|Bindings|Variant matrix|Layer tree)/.test(b.text);
        const body = inline(b.text, isIndex ? { linkCode } : undefined);
        if (!intro && !openChapter) intro = body;
        html.push(`<p class="${isIndex ? "index" : lead ? "lead" : ""}">${body}</p>`);
        break;
      }
      case "ol":
        html.push(`<ol>${b.items.map((it) => `<li>${inline(it)}</li>`).join("")}</ol>`);
        break;
      case "code":
        html.push(`<div class="codewrap"><pre><code>${escapeHtml(b.text)}</code></pre></div>`);
        break;
      case "table": {
        const head = b.head
          ? `<thead><tr>${b.head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`
          : "";
        const body = b.body
          .map(
            (r) =>
              `<tr>${r
                .map((c, idx) => `<td${idx === 0 ? ' class="first"' : ""}>${renderCell(c)}</td>`)
                .join("")}</tr>`,
          )
          .join("");
        html.push(`<div class="tablewrap"><table>${head}<tbody>${body}</tbody></table></div>`);
        break;
      }
    }
  }
  closeChapter();

  return { title, nav, body: html.join("\n"), intro };
}

/* -------------------------------------------------------------------- page */

function renderNav(nav) {
  const out = [];
  let open = false;
  for (const item of nav) {
    if (item.level === 2) {
      if (open) out.push("</div></details>");
      out.push(
        `<details class="navgroup" open><summary><a href="#${item.id}">` +
          (item.num ? `<span class="navnum">${item.num}</span>` : "") +
          `<span>${item.label}</span></a></summary><div class="navlist">`,
      );
      open = true;
    } else {
      out.push(
        `<a class="navlink" href="#${item.id}" data-label="${item.label.toLowerCase()}">` +
          `<span>${item.label}</span>` +
          (item.internal ? `<span class="tag tag--sm">int</span>` : "") +
          `</a>`,
      );
    }
  }
  if (open) out.push("</div></details>");
  return out.join("\n");
}

const md = readFileSync(SRC, "utf8");
const { title, nav, body } = build(md);
const componentCount = nav.filter((n) => n.level === 3).length;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Figma to React component parity spec, generated from FIGMA-PARITY.md.">
<style>
:root {
  color-scheme: light;
  --bg: #ffffff;
  --bg-sub: #f7f7f5;
  --surface: #ffffff;
  --surface-2: #fafaf8;
  --text: #1b1b19;
  --text-2: #55554f;
  --text-3: #85857c;
  --border: #e6e5e0;
  --border-2: #d5d4cd;
  --accent: #2f5fd6;
  --accent-soft: #eaf0fd;
  --code-bg: #f2f2ee;
  --code-text: #35352f;
  --shadow: 0 1px 2px rgba(20,20,16,.05), 0 8px 24px -12px rgba(20,20,16,.12);
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg: #131312;
    --bg-sub: #171716;
    --surface: #1a1a18;
    --surface-2: #1f1f1d;
    --text: #eceae5;
    --text-2: #b3b1aa;
    --text-3: #8a887f;
    --border: #2c2c29;
    --border-2: #3a3a36;
    --accent: #8fb0ff;
    --accent-soft: #1d2740;
    --code-bg: #232320;
    --code-text: #d8d5cd;
    --shadow: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.6);
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #131312;
  --bg-sub: #171716;
  --surface: #1a1a18;
  --surface-2: #1f1f1d;
  --text: #eceae5;
  --text-2: #b3b1aa;
  --text-3: #8a887f;
  --border: #2c2c29;
  --border-2: #3a3a36;
  --accent: #8fb0ff;
  --accent-soft: #1d2740;
  --code-bg: #232320;
  --code-text: #d8d5cd;
  --shadow: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.6);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 84px; }
body {
  margin: 0;
  background: var(--bg-sub);
  color: var(--text);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* ---------------------------------------------------------------- chrome */
header.top {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; gap: 12px;
  height: 56px; padding: 0 20px;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: saturate(1.4) blur(12px);
  border-bottom: 1px solid var(--border);
}
header.top .brand { font-weight: 640; letter-spacing: -.01em; margin-right: auto; font-size: 14.5px; }
header.top .brand small { color: var(--text-3); font-weight: 480; margin-left: 8px; }
.iconbtn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 32px; min-width: 32px; padding: 0 10px;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--surface); color: var(--text-2);
  font: inherit; font-size: 13px; cursor: pointer;
}
.iconbtn:hover { background: var(--surface-2); color: var(--text); }
#fp-menu { display: none; }

.shell { display: grid; grid-template-columns: 288px minmax(0, 1fr); align-items: start; }

/* --------------------------------------------------------------- sidebar */
aside {
  position: sticky; top: 56px;
  height: calc(100vh - 56px);
  overflow: auto; overscroll-behavior: contain;
  border-right: 1px solid var(--border);
  background: var(--bg);
  padding: 16px 12px 64px;
}
.searchwrap { position: sticky; top: 0; z-index: 2; background: var(--bg); padding-bottom: 10px; }
#fp-search {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid var(--border-2); border-radius: 8px;
  background: var(--surface-2); color: var(--text);
  font: inherit; font-size: 13.5px;
}
#fp-search:focus { outline: 2px solid var(--accent); outline-offset: -1px; border-color: transparent; }
#fp-search::placeholder { color: var(--text-3); }
.navgroup { margin-bottom: 2px; }
.navgroup > summary {
  list-style: none; cursor: pointer;
  display: flex; align-items: center;
  padding: 5px 8px; border-radius: 7px;
  font-size: 12px; font-weight: 620; letter-spacing: .04em; text-transform: uppercase;
  color: var(--text-3);
}
.navgroup > summary::-webkit-details-marker { display: none; }
.navgroup > summary::after {
  content: "›"; margin-left: auto; transform: rotate(90deg);
  transition: transform .15s; font-size: 14px;
}
.navgroup:not([open]) > summary::after { transform: rotate(0deg); }
.navgroup > summary:hover { background: var(--surface-2); color: var(--text-2); }
.navgroup > summary a { color: inherit; text-decoration: none; display: flex; gap: 7px; align-items: center; }
.navnum { opacity: .55; }
.navlist { padding: 2px 0 8px 2px; border-left: 1px solid var(--border); margin-left: 12px; }
.navlink {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; margin-left: 6px;
  border-radius: 7px;
  color: var(--text-2); text-decoration: none; font-size: 13.5px;
}
.navlink:hover { background: var(--surface-2); color: var(--text); }
.navlink.active { background: var(--accent-soft); color: var(--accent); font-weight: 560; }
.navgroup.hidden, .navlink.hidden { display: none; }
.noresults { padding: 10px; color: var(--text-3); font-size: 13px; display: none; }

/* ------------------------------------------------------------------ main */
main { padding: 40px 40px 120px; min-width: 0; }
.wrap { max-width: 980px; margin: 0 auto; }
.pagehead { margin-bottom: 28px; }
.pagehead h1 { font-size: 30px; line-height: 1.2; letter-spacing: -.022em; margin: 0 0 8px; }
.pagehead .sub { color: var(--text-3); font-size: 13.5px; }
.pagehead .sub b { color: var(--text-2); font-weight: 560; }

.chapter { margin: 0 0 44px; }
.h2 {
  display: flex; align-items: baseline; gap: 10px;
  margin: 44px 0 18px; padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  font-size: 21px; letter-spacing: -.015em; scroll-margin-top: 76px;
}
.h2 .num {
  font-size: 12px; font-weight: 600; color: var(--accent);
  background: var(--accent-soft); border-radius: 6px;
  padding: 2px 7px; letter-spacing: 0;
}
.h3 {
  display: flex; align-items: center; gap: 8px;
  margin: 0 0 14px; font-size: 17px; letter-spacing: -.01em;
  scroll-margin-top: 76px;
}
.anchor {
  opacity: 0; color: var(--text-3); text-decoration: none;
  font-weight: 400; transition: opacity .12s;
}
.h2:hover .anchor, .h3:hover .anchor { opacity: 1; }
.anchor:hover { color: var(--accent); }

.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 20px 22px; margin: 0 0 16px;
  box-shadow: var(--shadow);
}
.chapter > p, .chapter > ol, .chapter > .tablewrap, .chapter > .codewrap { margin-left: 2px; }

p { margin: 0 0 14px; color: var(--text-2); }
p:last-child { margin-bottom: 0; }
strong { color: var(--text); font-weight: 620; }
.lead strong:first-child { color: var(--text); }
ol { margin: 0 0 14px; padding-left: 22px; color: var(--text-2); }
li { margin-bottom: 6px; }
li::marker { color: var(--text-3); }

code {
  font-family: var(--mono); font-size: .875em;
  background: var(--code-bg); color: var(--code-text);
  padding: 1.5px 5px; border-radius: 5px;
  white-space: nowrap;
}
a.chip { text-decoration: none; }
a.chip code { color: var(--accent); cursor: pointer; }
a.chip:hover code { background: var(--accent-soft); }
.index { line-height: 2.1; }

.codewrap {
  background: var(--code-bg); border: 1px solid var(--border);
  border-radius: 10px; overflow-x: auto; margin: 0 0 16px;
}
pre { margin: 0; padding: 14px 16px; }
pre code {
  background: none; padding: 0; border-radius: 0;
  font-size: 12.5px; line-height: 1.6; white-space: pre; color: var(--code-text);
}

.tablewrap {
  overflow-x: auto; margin: 0 0 16px;
  border: 1px solid var(--border); border-radius: 10px;
  background: var(--surface);
}
table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
th, td {
  text-align: left; padding: 9px 14px;
  border-bottom: 1px solid var(--border); vertical-align: top;
}
thead th {
  position: sticky; top: 0;
  background: var(--surface-2); color: var(--text-3);
  font-size: 11.5px; font-weight: 620; letter-spacing: .05em; text-transform: uppercase;
  white-space: nowrap;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: var(--surface-2); }
td { color: var(--text-2); }
td.first { color: var(--text); }
td .dash { color: var(--text-3); }

.kind {
  display: inline-block; font-family: var(--mono);
  font-size: 10.5px; font-weight: 600; letter-spacing: .04em;
  padding: 2px 6px; border-radius: 5px; white-space: nowrap;
  border: 1px solid transparent;
}
.kind--variant { background: #eaf0fd; color: #2f5fd6; }
.kind--boolean { background: #e8f5ec; color: #1f7a45; }
.kind--text { background: #fdf1e3; color: #96540f; }
.kind--instance_swap { background: #f3ebfb; color: #6b3fa0; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .kind--variant { background: #1d2740; color: #93b2ff; }
  :root:not([data-theme="light"]) .kind--boolean { background: #16301f; color: #6bcb92; }
  :root:not([data-theme="light"]) .kind--text { background: #33240f; color: #e0a86a; }
  :root:not([data-theme="light"]) .kind--instance_swap { background: #291d3a; color: #bfa0ea; }
}
:root[data-theme="dark"] .kind--variant { background: #1d2740; color: #93b2ff; }
:root[data-theme="dark"] .kind--boolean { background: #16301f; color: #6bcb92; }
:root[data-theme="dark"] .kind--text { background: #33240f; color: #e0a86a; }
:root[data-theme="dark"] .kind--instance_swap { background: #291d3a; color: #bfa0ea; }

.tag {
  font-size: 10.5px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
  color: var(--text-3); border: 1px solid var(--border-2);
  border-radius: 999px; padding: 1px 8px;
}
.tag--sm { padding: 0 6px; font-size: 9.5px; margin-left: auto; }

#fp-totop {
  position: fixed; right: 20px; bottom: 20px; z-index: 20;
  opacity: 0; pointer-events: none; transition: opacity .2s;
  box-shadow: var(--shadow); height: 36px; border-radius: 999px;
}
#fp-totop.show { opacity: 1; pointer-events: auto; }

@media (max-width: 1000px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  #fp-menu { display: inline-flex; }
  aside {
    position: fixed; top: 56px; left: 0; width: 300px; z-index: 25;
    transform: translateX(-102%); transition: transform .2s ease;
    box-shadow: var(--shadow);
  }
  body.nav-open aside { transform: none; }
  main { padding: 28px 20px 100px; }
  .card { padding: 16px; }
}
@media print {
  aside, header.top, #fp-totop { display: none; }
  .shell { grid-template-columns: 1fr; }
  .card { break-inside: avoid; box-shadow: none; }
}
</style>
</head>
<body>
<header class="top">
  <button class="iconbtn" id="fp-menu" aria-label="Toggle navigation">☰</button>
  <div class="brand">${title} <small>${componentCount} sections</small></div>
  <button class="iconbtn" id="fp-theme" aria-label="Toggle theme">◐</button>
</header>

<div class="shell">
  <aside id="fp-sidebar">
    <div class="searchwrap">
      <input id="fp-search" type="search" placeholder="Search sections…  (press /)" autocomplete="off" spellcheck="false">
    </div>
    <nav id="fp-nav">
${renderNav(nav)}
      <div class="noresults" id="fp-noresults">No matching section.</div>
    </nav>
  </aside>

  <main>
    <div class="wrap">
      <div class="pagehead">
        <h1>${title}</h1>
        <div class="sub">Generated from <b>FIGMA-PARITY.md</b> · rebuild with <b>node scripts/build-figma-parity-html.mjs</b></div>
      </div>
${body}
    </div>
  </main>
</div>

<button class="iconbtn" id="fp-totop" aria-label="Back to top">↑ Top</button>

<script>
(function () {
  var root = document.documentElement;
  var stored = localStorage.getItem("fp-theme");
  if (stored) root.setAttribute("data-theme", stored);
  document.getElementById("fp-theme").addEventListener("click", function () {
    var dark = matchMedia("(prefers-color-scheme: dark)").matches;
    var cur = root.getAttribute("data-theme") || (dark ? "dark" : "light");
    var next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("fp-theme", next);
  });

  var search = document.getElementById("fp-search");
  var noresults = document.getElementById("fp-noresults");
  var groups = Array.prototype.slice.call(document.querySelectorAll(".navgroup"));

  search.addEventListener("input", function () {
    var q = search.value.trim().toLowerCase();
    var any = false;
    groups.forEach(function (g) {
      var links = Array.prototype.slice.call(g.querySelectorAll(".navlink"));
      var groupLabel = g.querySelector("summary").textContent.toLowerCase();
      var hits = 0;
      links.forEach(function (a) {
        var match = !q || a.dataset.label.indexOf(q) > -1 || groupLabel.indexOf(q) > -1;
        a.classList.toggle("hidden", !match);
        if (match) hits++;
      });
      var show = !q || hits > 0 || groupLabel.indexOf(q) > -1;
      g.classList.toggle("hidden", !show);
      if (show) { any = true; if (q) g.open = true; }
    });
    noresults.style.display = any ? "none" : "block";
  });

  search.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { search.value = ""; search.dispatchEvent(new Event("input")); search.blur(); }
    if (e.key === "Enter") {
      var first = document.querySelector(".navgroup:not(.hidden) .navlink:not(.hidden)");
      if (first) { first.click(); search.blur(); }
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); search.select(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); search.focus(); search.select(); }
  });

  // Scroll spy
  var links = Array.prototype.slice.call(document.querySelectorAll(".navlink, .navgroup > summary a"));
  var targets = links.map(function (a) {
    return { link: a, el: document.getElementById(a.getAttribute("href").slice(1)) };
  }).filter(function (t) { return t.el; });
  var active = null;
  var ticking = false;

  function spy() {
    ticking = false;
    var best = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].el.getBoundingClientRect().top <= 120) best = targets[i];
      else break;
    }
    if (!best) best = targets[0];
    if (best && best.link !== active) {
      if (active) active.classList.remove("active");
      active = best.link;
      active.classList.add("active");
      var group = active.closest(".navgroup");
      if (group && !group.open) group.open = true;
      if (active.classList.contains("navlink")) {
        var box = active.getBoundingClientRect();
        var side = document.getElementById("fp-sidebar").getBoundingClientRect();
        if (box.top < side.top + 48 || box.bottom > side.bottom - 24) {
          active.scrollIntoView({ block: "center" });
        }
      }
    }
    var totop = document.getElementById("fp-totop");
    totop.classList.toggle("show", window.scrollY > 600);
  }
  addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(spy); }
  }, { passive: true });
  spy();

  document.getElementById("fp-totop").addEventListener("click", function () {
    scrollTo({ top: 0, behavior: "smooth" });
  });

  var menu = document.getElementById("fp-menu");
  menu.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
  document.getElementById("fp-nav").addEventListener("click", function (e) {
    if (e.target.closest("a")) document.body.classList.remove("nav-open");
  });
})();
</script>
</body>
</html>
`;

writeFileSync(OUT, page);
const kb = (Buffer.byteLength(page) / 1024).toFixed(0);
console.log(
  `FIGMA-PARITY.html  ${kb} KB  ·  ${nav.filter((n) => n.level === 2).length} chapters, ${componentCount} sections`,
);
