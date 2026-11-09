/**
 * The tools that need only the manifest and the tokens: everything a consumer can
 * use outside this repo. Registered by both the repo server (`create-server.ts`)
 * and the published `@ui-organized/mcp`.
 *
 * This module must stay free of `staleness.ts`, which pulls in the TypeScript
 * scanner and expects a repo checkout. That's why the Figma tools aren't here.
 */

import { existsSync, readFileSync } from "node:fs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { buildComponentSpec } from "../component-spec.js";
import { fetchFrame, FigmaRequestError, parseFigmaUrl } from "../figma/rest.js";
import { resolveFrame, resolveProps, type ResolveContext } from "../figma/resolve.js";
import type { FigmaVariableNames } from "../figma/types.js";
import { figmaVariableIndex, getToken, parseTokens, searchTokens, type Token } from "../tokens/catalog.js";
import { searchComponents as runSearch } from "./confidence.js";
import type { ManifestLoader } from "./manifest-loader.js";

/** Every tool returns pretty JSON text — agents parse it; humans can read it. */
export function json(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export interface ReadToolsOptions {
  loader: ManifestLoader;
  /** Absolute path of the built `variables.css`. */
  tokensCssPath: string;
  /** `@ui-organized/react` version the specs describe. */
  packageVersion: string;
  /** `figma-variables.json`, written by `figma:sync`. Optional: unnamed variables are reported. */
  figmaVariablesPath?: string;
}

/** The whole spec for one component by exact name, or real alternatives. */
export function getComponent(
  { loader, packageVersion }: Pick<ReadToolsOptions, "loader" | "packageVersion">,
  name: string,
): { found: true; spec: string } | { found: false; warning: string; suggestions: string[] } {
  const manifest = loader.getManifest();
  const entry = manifest.components.find((e) => e.codeName === name);
  if (entry) {
    return { found: true, spec: buildComponentSpec(entry, manifest, loader.getLatestHashes(), packageVersion) };
  }
  return {
    found: false,
    warning: `No component named "${name}". Do not invent it.`,
    suggestions: runSearch(loader, { query: name })
      .slice(0, 5)
      .map((result) => result.name),
  };
}

function resolveContext(loader: ManifestLoader, tokens: Token[], variablesPath?: string): ResolveContext {
  const live = loader.all().filter((entry) => entry.status !== "deprecated");
  const byName = new Map(live.map((entry) => [entry.codeName, entry]));
  return {
    byKey: (key) => {
      const entry = loader.byKey(key);
      return entry?.status === "deprecated" ? undefined : entry;
    },
    byName: (name) => byName.get(name),
    latest: loader.getLatestHashes(),
    variableIndex: figmaVariableIndex(tokens),
    variableNames:
      variablesPath && existsSync(variablesPath)
        ? (JSON.parse(readFileSync(variablesPath, "utf8")) as FigmaVariableNames)
        : {},
  };
}

/** Exact keys only: an unknown key is reported, with nothing inferred from its name. */
export function resolveFigmaComponents(
  loader: ManifestLoader,
  components: { key: string; properties?: Record<string, string | boolean> }[],
) {
  return components.map(({ key, properties }) => {
    const entry = loader.byKey(key);
    if (!entry || entry.status === "deprecated") {
      return { key, found: false as const, warning: "No verified mapping for this key. Do not invent a component." };
    }
    const { attrs, content, warnings } = resolveProps(entry, properties ?? {});
    const open = `<${entry.codeName}${attrs.length ? ` ${attrs.join(" ")}` : ""}`;
    return {
      key,
      found: true as const,
      importStatement: entry.importStatement,
      jsx: content === undefined ? `${open} />` : `${open}>${content}</${entry.codeName}>`,
      ...(warnings.length ? { warnings } : {}),
    };
  });
}

export function registerReadTools(server: McpServer, options: ReadToolsOptions): void {
  const { loader, tokensCssPath } = options;

  let tokens: Token[] | undefined;
  const loadTokens = (): Token[] => (tokens ??= parseTokens(readFileSync(tokensCssPath, "utf8")));

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
        framework: z.enum(["react", "svelte", "vue", "angular", "swiftui", "compose"]).optional(),
        status: z.enum(["active", "deprecated", "draft"]).optional(),
      },
    },
    async (args) => json({ results: runSearch(loader, args) }),
  );

  server.registerTool(
    "get_component",
    {
      title: "Get component",
      description:
        "The complete spec for one component by exact code name: import, every prop and " +
        "its allowed values, usage rules and examples. Read it before using a component. " +
        "Returns found:false with real alternatives when the name doesn't exist — do NOT " +
        "invent a component.",
      inputSchema: { name: z.string().describe("Exact component name, e.g. Button") },
    },
    async ({ name }) => json(getComponent(options, name)),
  );

  server.registerTool(
    "search_tokens",
    {
      title: "Search design tokens",
      description:
        "Find design tokens by purpose, e.g. 'background', 'padding', 'error text'. Use this " +
        "for custom layout and custom elements instead of hex colours or px literals. Results " +
        "are semantic tokens with their theme values and when to use them. A component's own " +
        "props come first.",
      inputSchema: { query: z.string().describe("What the value is for") },
    },
    async ({ query }) => json({ results: searchTokens(loadTokens(), query) }),
  );

  server.registerTool(
    "get_token",
    {
      title: "Get design token",
      description:
        "Check one token by exact name. Returns found:false with real alternatives when it " +
        "doesn't exist — never use a token this rejects.",
      inputSchema: { name: z.string().describe("Token name, e.g. --color-surface-base") },
    },
    async ({ name }) => json(getToken(loadTokens(), name)),
  );

  server.registerTool(
    "get_figma_frame",
    {
      title: "Read a Figma frame as JSX",
      description:
        "Start here for any Figma link. Returns one frame as a compact JSX skeleton using real " +
        "components and tokens, without each component's internal layers. Read get_component only " +
        "for a component you need to know more about. Items in `unmapped` and `unbound` have no " +
        "verified code equivalent: report them, do not invent one. Needs FIGMA_TOKEN in the " +
        "server's environment; without it, use resolve_figma_components.",
      inputSchema: {
        url: z.string().optional().describe("Figma URL including node-id"),
        fileKey: z.string().optional().describe("File key, if no URL"),
        nodeId: z.string().optional().describe("Node id such as 1:2, if no URL"),
      },
    },
    async ({ url, fileKey, nodeId }) => {
      const parsed = url ? parseFigmaUrl(url) : null;
      if (url && !parsed) return json({ found: false, warning: "That isn't a Figma design URL." });
      const file = parsed?.fileKey ?? fileKey;
      const node = parsed?.nodeId ?? nodeId;
      if (!file || !node) {
        return json({ found: false, warning: "Provide a Figma URL with a node-id, or fileKey and nodeId." });
      }
      const token = process.env.FIGMA_TOKEN;
      if (!token) {
        return json({
          found: false,
          warning: "FIGMA_TOKEN isn't set for this server. Set it, or pass component keys to resolve_figma_components.",
        });
      }
      try {
        const doc = await fetchFrame(file, node, token);
        return json({ found: true, ...resolveFrame(doc, resolveContext(loader, loadTokens(), options.figmaVariablesPath)) });
      } catch (error) {
        if (error instanceof FigmaRequestError) return json({ found: false, warning: error.message });
        throw error;
      }
    },
  );

  server.registerTool(
    "resolve_figma_components",
    {
      title: "Resolve Figma components",
      description:
        "Turn Figma component set keys and their property values into real imports and JSX, " +
        "for callers already holding node data. An unknown key returns found:false — do NOT " +
        "invent a component.",
      inputSchema: {
        components: z.array(
          z.object({
            key: z.string().describe("Component set key, or component key if it has no set"),
            properties: z.record(z.union([z.string(), z.boolean()])).optional(),
          }),
        ),
      },
    },
    async ({ components }) => json({ results: resolveFigmaComponents(loader, components) }),
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
}
