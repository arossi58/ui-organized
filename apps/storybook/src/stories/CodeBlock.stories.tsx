import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock, type CodeHighlighter } from "@ui-organized/react";

const SOURCE = `import { Button } from "@ui-organized/react";

// A primary action, in the reader's words.
export function Save({ onSave }: { onSave: () => void }) {
  return <Button intent="primary" onClick={onSave}>Save changes</Button>;
}`;

const DIFF = ` export function Save({ onSave }: { onSave: () => void }) {
-  return <Button onClick={onSave}>Save</Button>;
+  return <Button intent="primary" onClick={onSave}>Save changes</Button>;
 }`;

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * A stand-in for Shiki, enough to show the contract: it returns Shiki's shape
 * (span.line per line) with the css-variables theme's colour names, which the
 * block maps onto its own palette. Real code would pass Shiki's `codeToHtml`.
 */
const TOKEN =
  /(\/\/.*$)|("[^"]*")|\b(import|from|export|function|return|const)\b|\b(Button|Save)\b/g;

const demoHighlight: CodeHighlighter = (code) =>
  code
    .split("\n")
    .map((line) => {
      // One pass over the source text, so a token's own markup is never matched again.
      let html = "";
      let last = 0;
      for (const match of line.matchAll(TOKEN)) {
        const kind = match[1] ? "comment" : match[2] ? "string" : match[3] ? "keyword" : "function";
        html += escape(line.slice(last, match.index));
        html += `<span style="color:var(--shiki-token-${kind})">${escape(match[0])}</span>`;
        last = match.index + match[0].length;
      }
      return `<span class="line">${html}${escape(line.slice(last))}</span>`;
    })
    .join("\n");

const meta: Meta<typeof CodeBlock> = {
  title: "Components/Data Display/CodeBlock",
  component: CodeBlock,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Code to read and copy. Highlighting is yours: pass `highlight` (Shiki's `codeToHtml` works as is), or the code shows as plain text.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "terminal"] },
    highlight: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Inspect: Story = {
  tags: ["dev"],
  args: {
    code: SOURCE,
    language: "tsx",
    title: "Save.tsx",
    lineNumbers: false,
    wrap: false,
    diff: false,
    copyable: true,
    variant: "default",
  },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock {...args} highlight={demoHighlight} />
    </div>
  ),
};

/** Plain text: the default without a highlighter. */
export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock code={SOURCE} language="tsx" title="Save.tsx" />
    </div>
  ),
};

/** `highlight` turns the code into HTML; its css-variables colours take the block's palette. */
export const Highlighted: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock code={SOURCE} language="tsx" title="Save.tsx" highlight={demoHighlight} />
    </div>
  ),
};

/** Numbered lines, with the ones that matter marked. The numbers are never copied. */
export const LineNumbers: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock
        code={SOURCE}
        language="tsx"
        lineNumbers
        highlightLines="4-5"
        highlight={demoHighlight}
      />
    </div>
  ),
};

/** Lines that start with `+` or `-` show as added or removed. */
export const Diff: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock code={DIFF} language="tsx" title="Save.tsx" diff highlight={demoHighlight} />
    </div>
  ),
};

/** Dark on any page, for shell commands. */
export const Terminal: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock
        code={"pnpm add @ui-organized/react @ui-organized/tokens"}
        language="sh"
        variant="terminal"
      />
    </div>
  ),
};

/** Long lines scroll sideways inside the block, or `wrap` them. */
export const LongLines: Story = {
  render: () => {
    const code = `const message = "A line long enough to run past the edge of a narrow block, so it either scrolls inside it or wraps onto the next line.";`;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
        <CodeBlock code={code} language="ts" title="Scrolls" />
        <CodeBlock code={code} language="ts" title="Wraps" wrap />
      </div>
    );
  },
};

/** `maxHeight` scrolls a long file inside the block. */
export const MaxHeight: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock
        code={Array.from({ length: 30 }, (_, i) => `const line${i + 1} = ${i + 1};`).join("\n")}
        language="ts"
        lineNumbers
        maxHeight={200}
      />
    </div>
  ),
};

/** No title, no language and no copy button: the code alone. */
export const Bare: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <CodeBlock code={"pnpm quality"} copyable={false} />
    </div>
  ),
};
