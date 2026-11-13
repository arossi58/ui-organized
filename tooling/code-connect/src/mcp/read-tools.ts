/**
 * The tools that need only the manifest and the tokens: everything a consumer can
 * use outside this repo. Registered by both the repo server (`create-server.ts`)
 * and the published `@ui-organized/mcp`.
 *
 * This module must stay free of `staleness.ts`, which pulls in the TypeScript
 * scanner and expects a repo checkout. That's why the mapping-health tools
 * (get_component_context, validate_mapping, list_stale) live in
 * `create-server.ts`; the Figma frame tools need only the manifest, the tokens
 * and Figma's REST API, so they're here.
 */

import { existsSync, readFileSync } from "node:fs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { buildComponentSpec } from "../component-spec.js";
import {
  FRAMEWORK_INFO,
  frameworkUsage,
  importStatement,
  resolveTarget,
  type DocFramework,
  type FrameworkTarget,
} from "../frameworks.js";
import type { FrameworkData, OtherFramework } from "../framework-data.js";
import { fetchFrame, FigmaRequestError, parseFigmaUrl } from "../figma/rest.js";
import { resolveFrame, resolveProps, type ResolveContext } from "../figma/resolve.js";
import type { FigmaVariableNames } from "../figma/types.js";
import { figmaVariableIndex, getToken, parseTokens, searchTokens, type Token } from "../tokens/catalog.js";
import { searchComponents as runSearch, searchEntries } from "./confidence.js";
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
  /**
   * The library this server answers for when a call doesn't say. `uiorg init`
   * sets it from the project (`--framework`), so an agent in a Vue project gets
   * Vue specs without having to ask for them.
   */
  framework?: DocFramework;
  /** Surface, own manifest and version for each of Svelte, Vue and Angular. */
  frameworks?: Partial<Record<OtherFramework, FrameworkData>>;
}

const FRAMEWORK_ENUM = z.enum(["react", "svelte", "vue", "angular"]);

/** The library a call is about: its own argument, else the server's default, else React. */
function frameworkOf(options: Pick<ReadToolsOptions, "framework">, requested?: DocFramework): DocFramework {
  return requested ?? options.framework ?? "react";
}

/**
 * The React entry a name refers to under another library — given either that
 * library's own export (`UioButton`, or Vue's `Select`) or the React name — and
 * the target it resolves to there. Undefined when the library doesn't ship it.
 */
function locate(
  loader: ManifestLoader,
  framework: OtherFramework,
  data: FrameworkData,
  name: string,
): { entry: import("../schema.js").ComponentManifestEntry; target: FrameworkTarget } | undefined {
  const live = loader.getManifest().components.filter((e) => e.status !== "deprecated");
  const own = data.manifest?.components.find((c) => c.codeName === name && c.status !== "deprecated");
  const candidates = [
    own?.reactName,
    name,
    // Angular's names are the React ones behind a `Uio` prefix.
    framework === "angular" && name.startsWith("Uio") ? name.slice(3) : undefined,
  ];
  for (const reactName of candidates) {
    if (!reactName) continue;
    const entry = live.find((e) => e.codeName === reactName);
    const target = entry ? resolveTarget(framework, entry.codeName, data.surface) : undefined;
    if (entry && target) return { entry, target };
  }
  // A name that resolves to a different symbol (Angular's aliases) — match on the target.
  for (const entry of live) {
    const target = resolveTarget(framework, entry.codeName, data.surface);
    if (target?.symbol === name) return { entry, target };
  }
  return undefined;
}

/** Search one library: its own scan when it has one, else React's results under its names. */
export function searchFramework(
  loader: ManifestLoader,
  framework: OtherFramework,
  data: FrameworkData,
  query: string,
  status?: "active" | "deprecated" | "draft",
) {
  if (data.manifest) return searchEntries(data.manifest.components, { query, ...(status ? { status } : {}) });
  return runSearch(loader, { query, ...(status ? { status } : {}) }).flatMap((result) => {
    const target = resolveTarget(framework, result.name, data.surface);
    return target ? [{ ...result, name: target.symbol }] : [];
  });
}

/** The whole spec for one component by exact name, or real alternatives. */
export function getComponent(
  options: Pick<ReadToolsOptions, "loader" | "packageVersion" | "framework" | "frameworks">,
  name: string,
  requested?: DocFramework,
): { found: true; spec: string } | { found: false; warning: string; suggestions: string[] } {
  const { loader, packageVersion } = options;
  const manifest = loader.getManifest();
  const framework = frameworkOf(options, requested);

  if (framework === "react") {
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

  const label = FRAMEWORK_INFO[framework].label;
  const data = options.frameworks?.[framework];
  if (!data) {
    return { found: false, warning: `This server has no ${label} data. Do not fall back to the React API.`, suggestions: [] };
  }
  const located = locate(loader, framework, data, name);
  if (!located) {
    return {
      found: false,
      warning:
        `${FRAMEWORK_INFO[framework].packageName} has no component named "${name}". Do not invent it, ` +
        "and do not substitute the React one.",
      suggestions: searchFramework(loader, framework, data, name).slice(0, 5).map((r) => r.name),
    };
  }
  const { entry, target } = located;
  const relatedTargets: Record<string, FrameworkTarget> = {};
  for (const sibling of manifest.components) {
    if (sibling.codePath !== entry.codePath || sibling.codeName === entry.codeName) continue;
    const t = resolveTarget(framework, sibling.codeName, data.surface);
    if (t) relatedTargets[sibling.codeName] = t;
  }
  return {
    found: true,
    spec: buildComponentSpec(entry, manifest, loader.getLatestHashes(), data.version, {
      framework,
      target,
      relatedTargets,
      ...(data.manifest ? { frameworkManifest: data.manifest } : {}),
      surface: data.surface,
    }),
  };
}

function resolveContext(
  loader: ManifestLoader,
  tokens: Token[],
  variablesPath?: string,
  other?: { framework: OtherFramework; data: FrameworkData },
): ResolveContext {
  const live = loader.all().filter((entry) => entry.status !== "deprecated");
  const byName = new Map(live.map((entry) => [entry.codeName, entry]));
  return {
    ...(other
      ? {
          markup: {
            framework: other.framework,
            targetOf: (codeName: string) => resolveTarget(other.framework, codeName, other.data.surface),
          },
        }
      : {}),
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
  other?: { framework: OtherFramework; data: FrameworkData },
) {
  return components.map(({ key, properties }) => {
    const entry = loader.byKey(key);
    if (!entry || entry.status === "deprecated") {
      return { key, found: false as const, warning: "No verified mapping for this key. Do not invent a component." };
    }
    const { attrs, args, content, warnings } = resolveProps(entry, properties ?? {});
    if (other) {
      const target = resolveTarget(other.framework, entry.codeName, other.data.surface);
      if (!target) {
        return {
          key,
          found: false as const,
          warning: `${FRAMEWORK_INFO[other.framework].packageName} has no ${entry.codeName}. Do not substitute the React one.`,
        };
      }
      return {
        key,
        found: true as const,
        importStatement: importStatement(other.framework, [target.symbol], target.packageName),
        markup: frameworkUsage(target, content === undefined ? args : { ...args, children: content }, entry.props.map((p) => p.name)),
        ...(warnings.length ? { warnings } : {}),
      };
    }
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

  /** React → undefined (write JSX); another library → its data; null when the server has none. */
  const otherFor = (requested?: DocFramework): { framework: OtherFramework; data: FrameworkData } | undefined | null => {
    const framework = frameworkOf(options, requested);
    if (framework === "react") return undefined;
    const data = options.frameworks?.[framework];
    return data ? { framework, data } : null;
  };

  server.registerTool(
    "search_components",
    {
      title: "Search components",
      // Shared by the repo server and the published one, which has no
      // get_component_context: name only tools both of them register.
      description:
        "Fuzzy-search real code components by name or path. Use it to find a component " +
        "before calling get_component, or when a lookup by name or Figma key found no exact " +
        "match. Every result carries a similarity score — treat low scores as unconfirmed.",
      inputSchema: {
        query: z.string().describe("Name or path fragment to search for"),
        framework: FRAMEWORK_ENUM.optional().describe("Library to search; defaults to this project's"),
        status: z.enum(["active", "deprecated", "draft"]).optional(),
      },
    },
    async ({ query, framework: requested, status }) => {
      const framework = frameworkOf(options, requested);
      if (framework === "react") return json({ results: runSearch(loader, { query, ...(status ? { status } : {}) }) });
      const data = options.frameworks?.[framework];
      return json({ framework, results: data ? searchFramework(loader, framework, data, query, status) : [] });
    },
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
      inputSchema: {
        name: z.string().describe("Exact component name, e.g. Button (or UioButton in Angular)"),
        framework: FRAMEWORK_ENUM.optional().describe("Library to describe; defaults to this project's"),
      },
    },
    async ({ name, framework }) => json(getComponent(options, name, framework)),
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
        "doesn't exist — never use a token this rejects. Also takes a Figma variable name as " +
        "Figma's own MCP writes it (spacing/space-02, var(--content/primary,#030303)) and " +
        "returns the CSS token it binds to.",
      inputSchema: { name: z.string().describe("Token name, e.g. --color-surface-base, or a Figma variable name") },
    },
    async ({ name }) => json(getToken(loadTokens(), name)),
  );

  server.registerTool(
    "get_figma_frame",
    {
      title: "Read a Figma frame as code",
      description:
        "Returns one Figma frame as a compact skeleton in this project's library (JSX, or a " +
        "Svelte, Vue or Angular template) using real components and tokens, without each " +
        "component's internal layers. It works only once the library's components are linked " +
        "to Figma; until then it returns found:false, and the route is Figma's own MCP server " +
        "(get_design_context), then get_component for each component and get_token for each " +
        "Figma variable name. Items in `unmapped` and `unbound` have no verified code " +
        "equivalent: report them, do not invent one. Needs FIGMA_TOKEN in the server's " +
        "environment.",
      inputSchema: {
        url: z.string().optional().describe("Figma URL including node-id"),
        fileKey: z.string().optional().describe("File key, if no URL"),
        nodeId: z.string().optional().describe("Node id such as 1:2, if no URL"),
        framework: FRAMEWORK_ENUM.optional().describe("Library to write; defaults to this project's"),
      },
    },
    async ({ url, fileKey, nodeId, framework: requested }) => {
      const parsed = url ? parseFigmaUrl(url) : null;
      if (url && !parsed) return json({ found: false, warning: "That isn't a Figma design URL." });
      const file = parsed?.fileKey ?? fileKey;
      const node = parsed?.nodeId ?? nodeId;
      if (!file || !node) {
        return json({ found: false, warning: "Provide a Figma URL with a node-id, or fileKey and nodeId." });
      }
      // Without a single linked component, every instance in the frame comes back
      // unmapped and every bound variable unnamed: a larger answer than Figma's own
      // MCP gives, carrying less. Say so before spending a request on it, so agent
      // rules written when this tool was the first stop still land somewhere useful.
      if (!loader.hasFigmaLinks()) {
        return json({
          found: false,
          warning:
            "This library's components aren't linked to Figma yet, so this tool can't match a " +
            "frame's components or variables. Read the frame with Figma's own MCP server " +
            "(get_design_context, with the fileKey and nodeId below), then call get_component " +
            "for each component it shows and pass each Figma variable name it reports to get_token.",
          fileKey: file,
          nodeId: node,
        });
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
        const other = otherFor(requested);
        if (other === null) return json({ found: false, warning: "This server has no data for that library." });
        const skeleton = resolveFrame(doc, resolveContext(loader, loadTokens(), options.figmaVariablesPath, other));
        return json({ found: true, framework: other?.framework ?? "react", ...skeleton });
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
        "Turn Figma component set keys and their property values into real imports and markup " +
        "(JSX, or this project's library), " +
        "for callers already holding node data. An unknown key returns found:false — do NOT " +
        "invent a component.",
      inputSchema: {
        components: z.array(
          z.object({
            key: z.string().describe("Component set key, or component key if it has no set"),
            properties: z.record(z.union([z.string(), z.boolean()])).optional(),
          }),
        ),
        framework: FRAMEWORK_ENUM.optional().describe("Library to write; defaults to this project's"),
      },
    },
    async ({ components, framework: requested }) => {
      const other = otherFor(requested);
      if (other === null) return json({ found: false, warning: "This server has no data for that library." });
      return json({ framework: other?.framework ?? "react", results: resolveFigmaComponents(loader, components, other) });
    },
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
