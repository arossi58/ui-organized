import { staticScenarios, type BrowserScenario } from "./scenario.js";

const code = 'const a = 1;\nconst b = "<b>";\n\nexport { a, b };';
const diffCode = " const a = 1;\n-const b = 2;\n+const b = 3;";

/** Angular is compared here only; the SSR gate covers the other three. */
const scenarios: BrowserScenario[] = staticScenarios("CodeBlock", [
  { name: "language and title", props: { code, language: "ts", title: "values.ts" } },
  {
    name: "no header, wrapped, max height",
    props: { code, copyable: false, wrap: true, maxHeight: 120 },
  },
  {
    name: "terminal",
    props: { code: "pnpm add @ui-organized/react", language: "sh", variant: "terminal" },
  },
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
]);

export default scenarios;
