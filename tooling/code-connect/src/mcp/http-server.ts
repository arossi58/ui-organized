#!/usr/bin/env -S npx tsx
/**
 * Code Connect MCP server — HTTP (Streamable HTTP) transport (Connect.md §6.1, §9).
 *
 * The remote/team entry point: one endpoint the whole team points at, deployed on
 * TheVoid behind a Cloudflare Tunnel (e.g. mcp.uiorganized.com). It is a thin
 * transport wrapper around the SAME `createMcpServer` used by stdio — no forked
 * tool logic (§6.1). Runs statelessly (a fresh server + transport per request), so
 * it scales horizontally behind the tunnel with no shared session state.
 *
 * Env:
 *   PORT                     listen port (default 3333)
 *   HOST                     bind address (default 0.0.0.0)
 *   CODE_CONNECT_HTTP_TOKEN  if set, require `Authorization: Bearer <token>`
 *   CODE_CONNECT_MANIFEST_DIR  manifest location (see manifest-loader.ts)
 *
 * Run:  pnpm --filter @ui-organized/code-connect mcp:http
 */

import http from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ManifestLoader } from "./manifest-loader.js";
import { createMcpServer } from "./create-server.js";

const PORT = Number(process.env.PORT ?? 3333);
const HOST = process.env.HOST ?? "0.0.0.0";
const TOKEN = process.env.CODE_CONNECT_HTTP_TOKEN;
const MCP_PATH = "/mcp";

// One shared loader → its mtime-aware cache is reused across requests (§10.6).
const loader = new ManifestLoader();

function send(res: http.ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(text);
}

/** JSON-RPC-shaped error so MCP clients surface it cleanly. */
function rpcError(res: http.ServerResponse, status: number, message: string): void {
  send(res, status, { jsonrpc: "2.0", error: { code: -32000, message }, id: null });
}

function authorized(req: http.IncomingMessage): boolean {
  if (!TOKEN) return true;
  return req.headers.authorization === `Bearer ${TOKEN}`;
}

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

const httpServer = http.createServer(async (req, res) => {
  const path = (req.url ?? "").split("?")[0];

  if (path === "/health") {
    send(res, 200, { status: "ok", components: loader.all().length });
    return;
  }

  if (path !== MCP_PATH) {
    rpcError(res, 404, `Not found. POST JSON-RPC to ${MCP_PATH}.`);
    return;
  }

  if (!authorized(req)) {
    rpcError(res, 401, "Unauthorized: missing or invalid bearer token.");
    return;
  }

  // Stateless: a fresh server + transport per request, torn down when it closes.
  const server = createMcpServer(loader);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, await readJson(req));
  } catch (err) {
    console.error("[code-connect] request error:", err);
    if (!res.headersSent) rpcError(res, 500, "Internal server error.");
  }
});

httpServer.listen(PORT, HOST, () => {
  console.error(
    `[code-connect] HTTP MCP server on http://${HOST}:${PORT}${MCP_PATH}` +
      (TOKEN ? " (bearer auth on)" : " (no auth — set CODE_CONNECT_HTTP_TOKEN)"),
  );
});
