/**
 * The single McpServer factory (Connect.md §6.1). Registers the 4 tools + the
 * manifest resource + the anti-hallucination instructions ONCE, so the stdio entry
 * (`server.ts`) and the HTTP entry (`http-server.ts`) share identical behavior —
 * "don't fork logic between transports" (§6.1). The transport is the only thing
 * that differs between the two.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ManifestLoader } from "./manifest-loader.js";
import {
  buildComponentContext,
  searchComponents,
  validateMapping,
  listStale,
} from "./tools.js";

/** Every tool returns pretty JSON text — agents parse it; humans can read it. */
function json(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

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
    "search_components",
    {
      title: "Search components",
      description:
        "Fuzzy-search real, mapped code components by name or path. Use this to browse " +
        "available components before generating code for an unmapped design, or when " +
        "get_component_context returned no exact match. Every result carries a " +
        "similarity score — treat low scores as unconfirmed.",
      inputSchema: {
        query: z.string().describe("Name or path fragment to search for"),
        framework: z.enum(["react", "angular", "swiftui", "compose"]).optional(),
        status: z.enum(["active", "deprecated", "draft"]).optional(),
      },
    },
    async (args) => json(searchComponents(loader, args)),
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

  server.registerResource(
    "components",
    "manifest://components",
    {
      title: "Component manifest",
      description: "The full Code Connect component manifest (source of truth).",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(loader.getManifest(), null, 2),
        },
      ],
    }),
  );

  return server;
}
