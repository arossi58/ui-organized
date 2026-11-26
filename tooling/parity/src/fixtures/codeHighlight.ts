/**
 * The fake highlighter every CodeBlock fixture passes when a case sets
 * `highlighted`: Shiki-shaped output (a pre, a code, one span.line per line)
 * with one token span per line, so the highlighted DOM can be compared.
 */
const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function fakeHighlight(code: string, language?: string): string {
  const lines = code
    .split("\n")
    .map(
      (line) =>
        `<span class="line"><span class="token" data-language="${language ?? "text"}">${escape(line)}</span></span>`,
    );
  return `<pre class="shiki"><code>${lines.join("\n")}</code></pre>`;
}
