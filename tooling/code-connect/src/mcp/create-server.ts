/**
 * The single McpServer factory (Connect.md §6.1). Registers the Figma tools, the
 * shared read tools + the anti-hallucination instructions ONCE, so the stdio entry
 * (`server.ts`) and the HTTP entry (`http-server.ts`) share identical behavior —
 * "don't fork logic between transports" (§6.1). The transport is the only thing
 * that differs between the two.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadFrameworkData } from "../framework-data.js";
import { ManifestLoader } from "./manifest-loader.js";
import { json, registerReadTools } from "./read-tools.js";
import { buildComponentContext, validateMapping, listStale } from "./tools.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

export function createMcpServer(loader: ManifestLoader = new ManifestLoader()): McpServer {
  const server = new McpServer(
    { name: "ui-organized-code-connect", version: "0.1.0" },
    {
      instructions:
        "Maps Figma components to real @ui-organized/react code components. " +
        "ANTI-HALLUCINATION CONTRACT: When get_component_context returns found:false " +
        "or confidence other than 'exact', do NOT invent a component — state that no " +
        "verified mapping exists and either ask the user or call search_components to " +
        "present real options. When a result has staleness.isStale:true or a warning, " +
        "annotate the generated usage inline with the confidence/reason and verify " +
        "props before relying on them.",
    },
  );

  server.registerTool(
    "get_component_context",
    {
      title: "Get component context",
      description:
        "Resolve a Figma component (by figmaComponentKey, read from the node's " +
        "pluginData) to its real code component: import, props, usage, and a " +
        "staleness flag. Returns found:false with a warning when there is no verified " +
        "mapping — in that case do NOT invent a component; ask the user or use " +
        "search_components. Never fabricate props or imports.",
      inputSchema: {
        figmaComponentKey: z.string().optional().describe("Figma component key (preferred)"),
        figmaNodeId: z
          .string()
          .optional()
          .describe("Figma node id — not resolvable alone; prefer figmaComponentKey"),
      },
    },
    async (args) => json(buildComponentContext(loader, args)),
  );

  server.registerTool(
    "validate_mapping",
    {
      title: "Validate mapping",
      description:
        "Health-check one mapping by re-scanning the real code and diffing its props " +
        "against the stored manifest entry. Use as a pre-flight before a large " +
        "design-to-code batch. Returns isValid plus the exact prop-level diff.",
      inputSchema: {
        figmaComponentKey: z.string().describe("Figma component key of the mapping to validate"),
      },
    },
    async (args) => json(validateMapping(loader, args)),
  );

  server.registerTool(
    "list_stale",
    {
      title: "List stale mappings",
      description:
        "List every mapping whose code has drifted from its last-synced signature. " +
        "Operational health-check across the whole manifest — not typically called " +
        "mid-generation.",
      inputSchema: {},
    },
    async () => json(listStale(loader)),
  );

  registerReadTools(server, {
    loader,
    tokensCssPath: resolve(REPO, "packages/tokens/output/variables.css"),
    figmaVariablesPath: resolve(REPO, "manifest/figma-variables.json"),
    packageVersion: (
      JSON.parse(readFileSync(resolve(REPO, "packages/react/package.json"), "utf8")) as { version: string }
    ).version,
    // Read from the checkout, so a spec for Svelte, Vue or Angular is as current as the repo.
    frameworks: loadFrameworkData(REPO),
  });

  return server;
}
