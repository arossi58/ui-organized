/**
 * Shared constants with no runtime dependencies — safe to import from both the
 * Node MCP server and the browser (Figma plugin) bundle.
 */

/**
 * The keys the Figma plugin writes onto a mapped node via `setPluginData`
 * (Connect.md §4.1). Only a pointer + timestamp live on the node; the real
 * mapping lives in the manifest, looked up by this component key.
 */
export const PLUGIN_DATA_KEYS = {
  componentKey: "figmaCodeConnect:componentKey",
  mappedAt: "figmaCodeConnect:mappedAt",
} as const;
