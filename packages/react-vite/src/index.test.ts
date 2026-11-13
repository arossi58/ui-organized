import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createServer as createHttpServer } from "node:http";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build, createServer, type ViteDevServer } from "vite";
import contract from "@ui-organized/core/token-contract.json" with { type: "json" };
import { themePlugin, themeJsonToCss } from "./index.js";

const FIXTURE = new URL("./__fixtures__/theme.json", import.meta.url);
const CSS_ID = "virtual:@ui-organized/theme.css";
const RESOLVED = "/__ui-organized-theme.css";

let root: string;
let server: ViteDevServer | undefined;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "react-vite-plugin-"));
  copyFileSync(FIXTURE, join(root, "theme.json"));
});
afterEach(async () => {
  await server?.close();
  server = undefined;
  rmSync(root, { recursive: true, force: true });
});

const fixtureDoc = () => JSON.parse(readFileSync(FIXTURE, "utf-8")) as Record<string, any>;
const writeTheme = (doc: unknown) => writeFileSync(join(root, "theme.json"), JSON.stringify(doc));

/**
 * A dev server with HMR on but no port of its own: the WebSocket attaches to
 * an http server that never listens, so parallel runs can't collide on 24678.
 */
async function devServer(options?: Parameters<typeof themePlugin>[0]) {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "silent",
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, hmr: { server: createHttpServer() } },
    plugins: [themePlugin(options)],
  });
  return server;
}

async function loadCss(s: ViteDevServer): Promise<string> {
  const resolved = await s.pluginContainer.resolveId(CSS_ID);
  const loaded = await s.pluginContainer.load(resolved!.id);
  return typeof loaded === "string" ? loaded : loaded!.code;
}

describe("themePlugin in dev", () => {
  it("resolves the import to a .css module and loads the theme stylesheet", async () => {
    const s = await devServer();
    expect((await s.pluginContainer.resolveId(CSS_ID))?.id).toBe(RESOLVED);
    expect(await loadCss(s)).toBe(themeJsonToCss(fixtureDoc()));
  });

  it("passes the defaultMode option through", async () => {
    const s = await devServer({ defaultMode: "dark" });
    const css = await loadCss(s);
    expect(css).toContain("Default mode: dark.");
    expect(css).not.toContain("@media");
  });

  it("keeps 2.x's import working by importing the stylesheet", async () => {
    const s = await devServer();
    const legacy = await s.pluginContainer.resolveId("virtual:@ui-organized/theme");
    const code = await s.pluginContainer.load(legacy!.id);
    expect(code).toBe(`import "${CSS_ID}";\n`);
  });

  it("fails naming every contract token the theme leaves out", async () => {
    const doc = fixtureDoc();
    delete doc.spacing;
    delete doc.component.button;
    writeTheme(doc);
    const s = await devServer();
    const error = await loadCss(s).then(
      () => undefined,
      (err: Error) => err,
    );
    expect(error?.message).toMatch(/theme\.json is missing \d+ of the \d+ tokens/);
    expect(error?.message).toContain("--spacing-space-04");
    expect(error?.message).toContain("--Button-Large-vertical");
  });

  it("explains a legacy config instead of failing schema validation", async () => {
    writeTheme({ metadata: { name: "Horizon" }, color: { modes: {} } });
    const s = await devServer();
    await expect(loadCss(s)).rejects.toThrow(/legacy theme config/);
  });

  it("hot-updates the stylesheet in place when theme.json changes, without a full reload", async () => {
    const s = await devServer();
    // Put the module in the graph the way a browser import would.
    await s.transformRequest(RESOLVED);
    const [mod] = s.moduleGraph.getModulesByFile(RESOLVED) ?? [];
    expect(mod?.isSelfAccepting).toBe(true);

    const reload = vi.spyOn(s, "reloadModule");
    const sent = vi.spyOn(s.hot, "send");

    const doc = fixtureDoc();
    doc.color.light.surface.primary.$value = "#123456";
    writeTheme(doc);
    s.watcher.emit("change", join(root, "theme.json"));
    await Promise.all(reload.mock.results.map((r) => r.value));

    expect(reload).toHaveBeenCalledWith(mod);
    type Payload = { type: string; updates?: Array<{ path: string }> };
    const payloads = sent.mock.calls.map(([payload]) => payload as unknown as Payload);
    expect(payloads.some((p) => p.type === "full-reload")).toBe(false);
    expect(payloads.find((p) => p.type === "update")?.updates?.[0]?.path).toBe(RESOLVED);
    expect(await loadCss(s)).toContain("--color-surface-primary: #123456;");
  });

  it("ignores changes to other files", async () => {
    const s = await devServer();
    await s.transformRequest(RESOLVED);
    const reload = vi.spyOn(s, "reloadModule");
    s.watcher.emit("change", join(root, "other.json"));
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("themePlugin in a build", () => {
  async function buildEntry(source: string) {
    writeFileSync(join(root, "main.js"), source);
    const warnings: string[] = [];
    const output = await build({
      root,
      configFile: false,
      logLevel: "silent",
      plugins: [themePlugin()],
      build: {
        write: false,
        rollupOptions: {
          input: join(root, "main.js"),
          onwarn: (warning) => void warnings.push(warning.message),
        },
      },
    });
    const chunks = (Array.isArray(output) ? output[0]! : (output as { output: unknown[] })).output as Array<{
      fileName: string;
      type: string;
      source?: string | Uint8Array;
    }>;
    const css = chunks
      .filter((c) => c.type === "asset" && c.fileName.endsWith(".css"))
      .map((c) => String(c.source))
      .join("\n");
    return { css, warnings };
  }

  it("puts the theme into the bundle's CSS, every contract token included", async () => {
    const { css, warnings } = await buildEntry(`import "${CSS_ID}";\n`);
    const missing = contract.tokens.filter((name) => !css.includes(`${name}:`));
    expect(missing).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it("warns when nothing imports the stylesheet", async () => {
    const { css, warnings } = await buildEntry("export const x = 1;\n");
    expect(css).toBe("");
    expect(warnings.join("\n")).toContain(`nothing imports ${CSS_ID}`);
  });
});
