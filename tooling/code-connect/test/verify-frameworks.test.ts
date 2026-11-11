/** `verify` reads every library's markup with its own parser and checks it against that library's scan. */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyGeneratedCode } from "../src/flagging/verify.js";
import { ManifestLoader } from "../src/mcp/manifest-loader.js";
import { loadFrameworkData } from "../src/framework-data.js";
import { parseTokens } from "../src/tokens/catalog.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const DIR = join(HERE, "fixtures/verify");
const data = loadFrameworkData(REPO);
const options = {
  frameworkManifests: { svelte: data.svelte.manifest, vue: data.vue.manifest, angular: data.angular.manifest },
  tokens: new Set(parseTokens(readFileSync(join(REPO, "packages/tokens/output/variables.css"), "utf8")).map((t) => t.name)),
};
const check = (file: string) =>
  verifyGeneratedCode([join(DIR, file)], new ManifestLoader(), DIR, options).map((f) => `${f.kind}:${f.message.match(/'([^']+)'/)?.[1]}`);

describe("verify across libraries", () => {
  it("accepts native attributes on React components (the old false positives)", () => {
    expect(check("Good.tsx")).toEqual([]);
  });
  it("flags an invented component, prop and token in React", () => {
    expect(check("Bad.tsx").sort()).toEqual(["unknown-prop:tone", "unknown-token:--space-4", "unresolved-import:FancyCard"]);
  });
  it("checks a Vue template against Vue's own props, v-model included", () => {
    expect(check("Panel.vue")).toEqual(["unknown-prop:variant"]);
  });
  it("checks Svelte markup against Svelte's own props", () => {
    expect(check("Panel.svelte")).toEqual(["unknown-prop:glow"]);
  });
  it("matches Angular directives by selector and checks their bound inputs", () => {
    expect(check("panel.component.ts")).toEqual(["unknown-prop:shout"]);
  });
});
