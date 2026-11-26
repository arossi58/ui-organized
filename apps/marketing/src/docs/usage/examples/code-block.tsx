import type { ComponentProps } from "react";
import { CodeBlock } from "@ui-organized/react";
import { useHighlighter } from "../../components/useHighlighter";
import type { UsageExampleSet } from "./types";

const CONFIG = `export default {
  theme: "light",
  density: "comfortable",
};`;

const SAVE = `export function Save({ onSave }) {
  const label = "Save changes";
  return <Button intent="primary" onClick={onSave}>{label}</Button>;
}`;

function Block(props: ComponentProps<typeof CodeBlock>) {
  const highlight = useHighlighter(props.language);
  return <CodeBlock {...props} highlight={highlight} />;
}

export const codeBlockExamples: UsageExampleSet = {
  labels: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 480 }}>
        <Block code={CONFIG} language="ts" title="app.config.ts" />
      </div>
    ),
    // No language and no file name.
    Dont: () => (
      <div style={{ maxWidth: 480 }}>
        <Block code={CONFIG} />
      </div>
    ),
  },

  commands: {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 480 }}>
        <Block code="pnpm add @ui-organized/react" language="sh" variant="terminal" />
      </div>
    ),
    // The prompt is pasted with the command.
    Dont: () => (
      <div style={{ maxWidth: 480 }}>
        <Block code="$ pnpm add @ui-organized/react" language="sh" />
      </div>
    ),
  },

  "marked-lines": {
    layout: "padded",
    Do: () => (
      <div style={{ maxWidth: 480 }}>
        <Block code={SAVE} language="tsx" lineNumbers highlightLines="3" />
      </div>
    ),
    // Every line is marked, so none stands out.
    Dont: () => (
      <div style={{ maxWidth: 480 }}>
        <Block code={SAVE} language="tsx" lineNumbers highlightLines="1-4" />
      </div>
    ),
  },
};
