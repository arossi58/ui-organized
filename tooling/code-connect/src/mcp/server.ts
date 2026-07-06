#!/usr/bin/env -S npx tsx
/**
 * Code Connect MCP server — stdio transport (Connect.md §6.1).
 *
 * The local/individual entry point. Tool logic lives in `create-server.ts` and is
 * shared verbatim with the HTTP entry (`http-server.ts`); this file is only the
 * stdio wiring.
 *
 * Run locally:  pnpm --filter @ui-organized/code-connect mcp
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./create-server.js";

const server = createMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
// Note: stdout is the JSON-RPC channel — never console.log here; use stderr.
console.error("[code-connect] MCP server ready on stdio");
