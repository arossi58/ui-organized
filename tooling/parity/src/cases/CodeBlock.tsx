import type { ComponentType } from "react";
import { CodeBlock as RCodeBlock } from "@ui-organized/react";
import CodeBlockFixture from "../fixtures/CodeBlockFixture.svelte";
import VueCodeBlockFixture from "../fixtures/vue/CodeBlockFixture.vue";
import { fakeHighlight } from "../fixtures/codeHighlight.js";
import type { ParitySpec } from "./spec.js";

const code = 'const a = 1;\nconst b = "<b>";\n\nexport { a, b };';
const diffCode = " const a = 1;\n-const b = 2;\n+const b = 3;";

/** `highlighted` stands for the `highlight` function: the same fake highlighter in every library. */
const spec: ParitySpec = {
  component: "CodeBlock",
  react: ({ highlighted, ...p }) => (
    <RCodeBlock {...(p as any)} highlight={highlighted ? fakeHighlight : undefined} />
  ),
  svelte: CodeBlockFixture as unknown as ComponentType<any>,
  vue: VueCodeBlockFixture as unknown as ComponentType<any>,
  stylesheets: ["Clipboard/Clipboard.css", "CodeBlock/CodeBlock.css"],
  cases: [
    { name: "plain", props: { code } },
    { name: "language and title", props: { code, language: "ts", title: "values.ts" } },
    { name: "no header", props: { code, copyable: false } },
    { name: "line numbers", props: { code, lineNumbers: true } },
    { name: "highlight lines", props: { code, highlightLines: "1,3-4" } },
    { name: "highlight lines as numbers", props: { code, highlightLines: [2] } },
    { name: "wrap", props: { code, wrap: true } },
    { name: "max height", props: { code, maxHeight: 120 } },
    {
      name: "terminal",
      props: { code: "pnpm add @ui-organized/react", language: "sh", variant: "terminal" },
    },
    { name: "diff", props: { code: diffCode, diff: true } },
    { name: "highlighted", props: { code, language: "ts", highlighted: true } },
    {
      name: "highlighted, numbered, marked diff",
      props: {
        code: diffCode,
        language: "ts",
        highlighted: true,
        lineNumbers: true,
        highlightLines: "2",
        diff: true,
      },
    },
    { name: "copy labels", props: { code, copyLabel: "Copy code", copiedLabel: "Done" } },
  ],
};

export default spec;
