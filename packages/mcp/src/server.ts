#!/usr/bin/env node
/**
 * The MCP server a consumer installs. Same read tools as the repo server, reading
 * the manifest and tokens this package shipped with, so answers match the version
 * installed. The Figma tools stay in the repo: they re-scan source this package
 * doesn't have.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ManifestLoader } from "@ui-organized/code-connect/manifest-loader";
import { registerReadTools } from "@ui-organized/code-connect/read-tools";

const data = join(dirname(fileURLToPath(import.meta.url)), "data");
const meta = JSON.parse(readFileSync(join(data, "meta.json"), "utf8")) as { reactVersion: string };
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

const server = new McpServer(
  { name: "ui-organized", version: pkg.version },
  {
    instructions:
      `Real components and design tokens of @ui-organized/react v${meta.reactVersion}. ` +
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
});

await server.connect(new StdioServerTransport());
// stdout is the JSON-RPC channel — never console.log here.
console.error("[ui-organized] MCP server ready on stdio");
