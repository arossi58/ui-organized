#!/usr/bin/env node
/**
 * Packs the real tarball, installs it in an empty project, and talks to the bin
 * over stdio. Inside the workspace every file resolves whether or not it would be
 * published, so this is the only check that sees what a consumer gets.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const work = mkdtempSync(join(tmpdir(), "uio-mcp-smoke-"));
let failures = 0;

function check(label, ok, detail = "") {
  process.stdout.write(`${ok ? "✓" : "✗"} ${label}${!ok && detail ? `\n    ${detail}` : ""}\n`);
  if (!ok) failures++;
}

/** Sends JSON-RPC requests in order and collects the responses. */
function session(bin, requests) {
  return new Promise((done, fail) => {
    const { FIGMA_TOKEN: _unset, ...env } = process.env;
    const child = spawn(bin, [], { stdio: ["pipe", "pipe", "inherit"], env });
    const replies = new Map();
    let buffer = "";
    const timer = setTimeout(() => {
      child.kill();
      fail(new Error(`No reply within 30s. Got ids: ${[...replies.keys()]}`));
    }, 30_000);
    const send = (message) => child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);

    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      for (let at = buffer.indexOf("\n"); at >= 0; at = buffer.indexOf("\n")) {
        const line = buffer.slice(0, at);
        buffer = buffer.slice(at + 1);
        if (!line.trim()) continue;
        const reply = JSON.parse(line);
        replies.set(reply.id, reply);
        if (reply.id === 0) send({ method: "notifications/initialized" });
        if (reply.id === 0) requests.forEach((request, i) => send({ id: i + 1, ...request }));
        if (replies.size === requests.length + 1) {
          clearTimeout(timer);
          child.kill();
          done(replies);
        }
      }
    });

    send({
      id: 0,
      method: "initialize",
      params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "smoke", version: "0" } },
    });
  });
}

const call = (name, args) => ({ method: "tools/call", params: { name, arguments: args } });
const body = (reply) => JSON.parse(reply.result.content[0].text);

try {
  const packed = execFileSync("npm", ["pack", "--pack-destination", work, "--silent"], {
    cwd: pkgRoot,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .pop();
  execFileSync("npm", ["init", "-y"], { cwd: work, stdio: "ignore" });
  execFileSync("npm", ["install", "--silent", "--no-audit", "--no-fund", join(work, packed)], {
    cwd: work,
    stdio: "ignore",
  });

  const replies = await session(join(work, "node_modules/.bin/ui-organized-mcp"), [
    { method: "tools/list" },
    call("get_component", { name: "Button" }),
    call("get_component", { name: "Buton" }),
    call("search_components", { query: "Button" }),
    call("search_tokens", { query: "padding" }),
    call("get_token", { name: "--space-04" }),
    call("resolve_figma_components", { components: [{ key: "not-a-real-key" }] }),
    call("get_figma_frame", { url: "https://www.figma.com/design/abc/x?node-id=1-2" }),
  ]);

  const tools = replies.get(1).result.tools.map((tool) => tool.name).sort();
  check(
    "lists exactly the read tools",
    tools.join() === "get_component,get_figma_frame,get_token,resolve_figma_components,search_components,search_tokens",
    tools.join(),
  );

  const button = body(replies.get(2));
  check("get_component returns a spec with the real import", button.found && button.spec.includes("@ui-organized/react"));

  const typo = body(replies.get(3));
  check("get_component refuses a wrong name and suggests a real one", !typo.found && typo.suggestions.includes("Button"), JSON.stringify(typo));

  check("search_components finds Button", body(replies.get(4)).results.some((result) => result.name === "Button"));

  check(
    "search_tokens finds spacing by purpose",
    body(replies.get(5)).results.some((token) => token.name === "--spacing-space-04"),
  );

  const invented = body(replies.get(6));
  check("get_token rejects an invented token", !invented.found && invented.suggestions.includes("--spacing-space-04"), JSON.stringify(invented));

  check("resolve_figma_components refuses an unknown key", body(replies.get(7)).results[0].found === false);
  const frame = body(replies.get(8));
  check("get_figma_frame explains a missing token without calling out", !frame.found && frame.warning.includes("FIGMA_TOKEN"), JSON.stringify(frame));
} catch (error) {
  check("the packed server runs", false, error.message);
} finally {
  rmSync(work, { recursive: true, force: true });
}

process.stdout.write(failures ? `\n✗ ${failures} failed\n` : "\n✓ MCP smoke passed\n");
process.exit(failures ? 1 : 0);
