import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

// On GitHub Pages the app is served from https://<user>.github.io/<repo>/,
// so the build needs a matching base path. Locally `base` stays "/".
// React Router reads the same value via import.meta.env.BASE_URL.
const base = process.env.BASE_PATH ?? "/";

// ── Storybook under /storybook/ ─────────────────────────────────────────────
// In production the deploy workflow copies Storybook's static build into
// _site/storybook/. Locally there is no such server: the marketing dev server
// would hand "/storybook/" to the SPA, React Router finds no route, and the page
// renders blank. So we serve Storybook's static build straight from the Vite
// dev AND preview servers, matching the deployed sub-path. Build it first with
//   pnpm --filter @ui-organized/storybook build
const STORYBOOK_DIR = fileURLToPath(new URL("../storybook/storybook-static", import.meta.url));
const MOUNT = "/storybook";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function storybookMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
): void {
  const url = req.url ?? "";
  if (url !== MOUNT && !url.startsWith(`${MOUNT}/`) && !url.startsWith(`${MOUNT}?`)) {
    return next();
  }

  // "/storybook" → "/storybook/" so the page's relative asset URLs resolve.
  if (url === MOUNT || url.startsWith(`${MOUNT}?`)) {
    res.statusCode = 301;
    res.setHeader("Location", `${MOUNT}/${url.slice(MOUNT.length)}`);
    res.end();
    return;
  }

  if (!existsSync(STORYBOOK_DIR)) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(
      "<h1>Storybook isn't built yet</h1><p>Run <code>pnpm --filter " +
        "@ui-organized/storybook build</code>, then reload.</p>",
    );
    return;
  }

  let rel = url.slice(MOUNT.length).split("?")[0];
  if (rel === "" || rel === "/") rel = "/index.html";

  // Resolve and confine to the Storybook output (no path traversal out of it).
  const root = resolve(STORYBOOK_DIR);
  let filePath = resolve(root, `.${decodeURIComponent(rel)}`);
  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream");
  createReadStream(filePath).pipe(res);
}

/** Serve apps/storybook's static build at /storybook/ in dev and preview. */
function serveStorybook(): PluginOption {
  return {
    name: "serve-storybook-static",
    // Added in the hook body so it runs before Vite's SPA-fallback middleware,
    // intercepting /storybook/* before React Router ever sees it.
    configureServer(server) {
      server.middlewares.use(storybookMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(storybookMiddleware);
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), serveStorybook()],
});
