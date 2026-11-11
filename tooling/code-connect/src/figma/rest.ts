/**
 * Figma REST access for the MCP tools and `figma:sync`. The token is read by the
 * caller from the environment and is only ever sent to Figma.
 */

import type { FigmaDocument } from "./types.js";

const API = "https://api.figma.com/v1";

export class FigmaRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type Fetch = typeof fetch;

export async function figmaGet<T>(path: string, token: string, fetcher: Fetch = fetch): Promise<T> {
  const response = await fetcher(`${API}${path}`, { headers: { "X-Figma-Token": token } });
  if (!response.ok) {
    const hint =
      response.status === 403
        ? "FIGMA_TOKEN was refused, or it can't open this file."
        : response.status === 404
          ? "No such file or node."
          : response.status === 429
            ? "Figma's rate limit was hit; retry shortly."
            : "Figma returned an error.";
    throw new FigmaRequestError(`${hint} (HTTP ${response.status})`, response.status);
  }
  return (await response.json()) as T;
}

/** `{ fileKey, nodeId }` from a Figma URL. A `node-id` of `1-2` means node `1:2`. */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/(^|\.)figma\.com$/.test(parsed.hostname)) return null;
  const match = /^\/(?:design|file)\/([^/]+)(?:\/branch\/([^/]+))?/.exec(parsed.pathname);
  if (!match) return null;
  const nodeId = parsed.searchParams.get("node-id")?.replace(/-/g, ":");
  return { fileKey: match[2] ?? match[1]!, ...(nodeId ? { nodeId } : {}) };
}

interface NodesResponse {
  version?: string;
  nodes: Record<string, FigmaDocument | null>;
}

const cache = new Map<string, { version: string; doc: FigmaDocument }>();

/** One node with its component metadata. Re-downloaded only when the file's version moves. */
export async function fetchFrame(
  fileKey: string,
  nodeId: string,
  token: string,
  fetcher: Fetch = fetch,
): Promise<FigmaDocument> {
  const id = `${fileKey}:${nodeId}`;
  const { version } = await figmaGet<{ version: string }>(`/files/${fileKey}?depth=1`, token, fetcher);
  const hit = cache.get(id);
  if (hit && hit.version === version) return hit.doc;

  const response = await figmaGet<NodesResponse>(
    `/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
    token,
    fetcher,
  );
  const doc = response.nodes[nodeId];
  if (!doc) throw new FigmaRequestError(`Node ${nodeId} isn't in this file.`, 404);
  cache.set(id, { version, doc });
  return doc;
}
