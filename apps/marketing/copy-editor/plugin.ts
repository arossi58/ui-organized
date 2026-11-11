import { execFile } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { createStore } from "./store.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const MARKETING = fileURLToPath(new URL("..", import.meta.url));
const MAX_BODY = 256 * 1024;

const isLocalHost = (host: string | undefined): boolean => {
  if (!host) return false;
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
};

/**
 * These endpoints write to the working tree, so a page on another site must not
 * reach them. Requiring a same-host Origin and a JSON body stops cross-site form
 * posts; checking Host stops DNS rebinding.
 */
export function isAllowed(req: IncomingMessage): boolean {
  if (!isLocalHost(req.headers.host)) return false;
  const origin = req.headers.origin;
  if (req.method === "GET") return !origin || origin.endsWith(`//${req.headers.host}`);
  if (!origin || !origin.endsWith(`//${req.headers.host}`)) return false;
  return (req.headers["content-type"] ?? "").startsWith("application/json");
}

export const readJson = (req: IncomingMessage): Promise<Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY) reject(new Error("Body too large"));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body) as Record<string, unknown>);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });

export const send = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

const runChecks = (): Promise<{ ok: boolean; output: string }> =>
  new Promise((resolve) => {
    execFile(
      "pnpm",
      ["exec", "vitest", "run", "src/docs/usage/usage.test.ts"],
      { cwd: MARKETING, timeout: 120_000, maxBuffer: 4 * 1024 * 1024, env: { ...process.env, NO_COLOR: "1" } },
      (error, stdout, stderr) => resolve({ ok: !error, output: `${stdout}${stderr}`.slice(-4000) }),
    );
  });

/** Dev-only: `apply: "serve"` keeps the endpoints and client out of every build. */
export function copyEditor(): Plugin {
  const store = createStore(REPO_ROOT);
  return {
    name: "copy-editor",
    apply: "serve",
    transformIndexHtml: () => [
      { tag: "script", attrs: { type: "module", src: "/copy-editor/client/main.tsx" }, injectTo: "body" },
    ],
    configureServer(server) {
      server.middlewares.use("/__copy", async (req, res) => {
        if (!isAllowed(req)) return send(res, 403, { error: "Local requests only." });
        try {
          const route = `${req.method} ${req.url?.split("?")[0]}`;
          if (route === "GET /index") return send(res, 200, { entries: store.index() });
          if (req.method !== "POST") return send(res, 404, { error: "Not found" });

          if (route === "POST /check") return send(res, 200, await runChecks());
          const body = await readJson(req);
          if (route === "POST /match") {
            return send(res, 200, { entries: store.match(body.candidates as string[]) });
          }
          if (route === "POST /save") {
            const { file, start, end, expected, text } = body as Record<string, never>;
            const result = store.save(file, start, end, expected, text);
            return send(res, result.ok ? 200 : result.status, result);
          }
          if (route === "POST /undo") {
            const { file, currentRaw, previousRaw } = body as Record<string, never>;
            const result = store.undo(file, currentRaw, previousRaw);
            return send(res, result.ok ? 200 : result.status, result);
          }
          return send(res, 404, { error: "Not found" });
        } catch (error) {
          return send(res, 500, { ok: false, error: (error as Error).message });
        }
      });
    },
  };
}
