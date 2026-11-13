#!/usr/bin/env node
/**
 * Packs the real tarball, installs it in an empty project, and talks to the bin
 * over stdio. Inside the workspace every file resolves whether or not it would be
 * published, so this is the only check that sees what a consumer gets.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
function session(bin, requests, args = []) {
  return new Promise((done, fail) => {
    const { FIGMA_TOKEN: _unset, ...env } = process.env;
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "inherit"], env });
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
  // Until `figma:sync` runs, the shipped manifest has no Figma keys, and the frame
  // tool answers before it would even look for a token: no request, and the route
  // that works today. Read from the installed tarball, so this can't pass by
  // accident once keys ship.
  const shipped = JSON.parse(
    readFileSync(join(work, "node_modules/@ui-organized/mcp/dist/data/components.json"), "utf8"),
  );
  const linked = shipped.components.some((entry) => entry.figmaComponentKey && entry.status !== "deprecated");
  const frame = body(replies.get(8));
  if (linked) {
    check("get_figma_frame explains a missing token without calling out", !frame.found && frame.warning.includes("FIGMA_TOKEN"), JSON.stringify(frame));
  } else {
    check(
      "get_figma_frame routes to Figma's MCP while nothing is linked, without calling out",
      !frame.found && frame.warning.includes("get_design_context") && frame.fileKey === "abc" && frame.nodeId === "1:2",
      JSON.stringify(frame),
    );
  }

  // A Vue project's server: Vue answers by default, any library on request.
  const vue = await session(
    join(work, "node_modules/.bin/ui-organized-mcp"),
    [
      call("get_component", { name: "Button" }),
      call("get_component", { name: "Select" }),
      call("search_components", { query: "Select" }),
      call("get_component", { name: "TableProvider" }),
      call("get_component", { name: "UioButton", framework: "angular" }),
      call("get_component", { name: "Button", framework: "svelte" }),
    ],
    ["--framework", "vue"],
  );
  const vueButton = body(vue.get(1));
  check(
    "--framework vue: get_component answers with Vue's own props and package",
    vueButton.found && vueButton.spec.includes('import { Button } from "@ui-organized/vue"') && vueButton.spec.includes("| `asChild` |"),
    vueButton.spec?.slice(0, 300),
  );
  check("Vue Select lists v-model's modelValue", body(vue.get(2)).spec?.includes("| `modelValue` |"));
  const vueSearch = body(vue.get(3));
  check("search_components searches Vue's own scan", vueSearch.framework === "vue" && vueSearch.results.some((r) => r.name === "Select" && r.codePath.startsWith("packages/vue/")), JSON.stringify(vueSearch).slice(0, 300));
  const reactOnly = body(vue.get(4));
  check("a React-only component is refused, never substituted", !reactOnly.found && reactOnly.warning.includes("@ui-organized/vue"), JSON.stringify(reactOnly));
  check("framework argument overrides the default (Angular)", body(vue.get(5)).spec?.includes("@ui-organized/angular"));
  check("framework argument overrides the default (Svelte)", body(vue.get(6)).spec?.includes('import { Button } from "@ui-organized/svelte"'));
} catch (error) {
  check("the packed server runs", false, error.message);
} finally {
  rmSync(work, { recursive: true, force: true });
}

process.stdout.write(failures ? `\n✗ ${failures} failed\n` : "\n✓ MCP smoke passed\n");
process.exit(failures ? 1 : 0);
