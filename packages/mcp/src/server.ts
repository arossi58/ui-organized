#!/usr/bin/env node
/**
 * The MCP server a consumer installs. Same read tools as the repo server, reading
 * the manifest and tokens this package shipped with, so answers match the version
 * installed. The Figma tools stay in the repo: they re-scan source this package
 * doesn't have.
 *
 * It answers for one library by default — `--framework svelte|vue|angular|react`,
 * or `UI_ORGANIZED_FRAMEWORK` — which `uiorg init` sets from the project. Every
 * tool also takes a `framework` argument to ask about another.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ManifestLoader } from "@ui-organized/code-connect/manifest-loader";
import { registerReadTools } from "@ui-organized/code-connect/read-tools";
import type { FrameworkData, OtherFramework } from "@ui-organized/code-connect/framework-data";

const FRAMEWORKS = ["react", "svelte", "vue", "angular"] as const;
type Framework = (typeof FRAMEWORKS)[number];

const data = join(dirname(fileURLToPath(import.meta.url)), "data");
const meta = JSON.parse(readFileSync(join(data, "meta.json"), "utf8")) as { reactVersion: string };
const frameworks = JSON.parse(readFileSync(join(data, "frameworks.json"), "utf8")) as Record<
  OtherFramework,
  FrameworkData
>;
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

function requestedFramework(): Framework {
  const flag = process.argv.indexOf("--framework");
  const value = (flag >= 0 ? process.argv[flag + 1] : process.env.UI_ORGANIZED_FRAMEWORK) ?? "react";
  if ((FRAMEWORKS as readonly string[]).includes(value)) return value as Framework;
  process.stderr.write(`[ui-organized] unknown framework "${value}"; expected ${FRAMEWORKS.join(", ")}\n`);
  process.exit(1);
}

const framework = requestedFramework();
const library =
  framework === "react"
    ? `@ui-organized/react v${meta.reactVersion}`
    : `@ui-organized/${framework} v${frameworks[framework].version}`;

const server = new McpServer(
  { name: "ui-organized", version: pkg.version },
  {
    instructions:
      `Real components and design tokens of ${library}. ` +
      "Call search_components to find a component and get_component to read its spec before " +
      "using it. Use search_tokens for any custom colour, spacing, radius or type value. For a " +
      "Figma link, call get_figma_frame first. " +
      "ANTI-HALLUCINATION CONTRACT: when a tool returns found:false or no results, do NOT " +
      "invent a component, prop or token — say so and offer the real alternatives.",
  },
);

registerReadTools(server, {
  loader: new ManifestLoader(data),
  tokensCssPath: join(data, "variables.css"),
  figmaVariablesPath: join(data, "figma-variables.json"),
  packageVersion: meta.reactVersion,
  framework,
  frameworks,
});

await server.connect(new StdioServerTransport());
// stdout is the JSON-RPC channel — never console.log here.
console.error(`[ui-organized] MCP server ready on stdio (${framework})`);
