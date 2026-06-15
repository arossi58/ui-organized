/**
 * @ui-organized/react-vite — Vite plugin for the design system.
 *
 * Reads a theme config JSON file, validates it against the schema, runs the
 * token pipeline, and injects the resulting CSS custom properties into the
 * Vite build — both at build time and during the dev server with HMR.
 *
 * Usage (vite.config.ts in a consuming project):
 *
 *   import { themePlugin } from '@ui-organized/react-vite'
 *
 *   export default {
 *     plugins: [
 *       themePlugin({ config: './theme.json' })
 *     ]
 *   }
 */

import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";
import { validateConfig } from "@ui-organized/schema";
import { transformConfig, buildCss } from "@ui-organized/tokens";

// ─── Virtual module ────────────────────────────────────────────────────────────

const VIRTUAL_ID = "virtual:@ui-organized/theme";
const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

// ─── Options ──────────────────────────────────────────────────────────────────

export interface ThemePluginOptions {
  /**
   * Path to the theme config JSON file.
   * Resolved relative to Vite's `root` (usually the project root).
   */
  config: string;
}

// ─── CSS generation ────────────────────────────────────────────────────────────

function generateCss(configPath: string): string {
  const raw = readFileSync(configPath, "utf-8");
  const json: unknown = JSON.parse(raw);
  const themeConfig = validateConfig(json);
  const transformed = transformConfig(themeConfig);
  const { css } = buildCss(transformed);
  return css;
}

// ─── Plugin ────────────────────────────────────────────────────────────────────

export function themePlugin(options: ThemePluginOptions): Plugin {
  let resolvedConfigPath: string;
  let cachedCss: string | null = null;

  return {
    name: "ds:theme",

    configResolved(config: ResolvedConfig) {
      resolvedConfigPath = resolve(config.root, options.config);
    },

    buildStart() {
      try {
        cachedCss = generateCss(resolvedConfigPath);
      } catch (err) {
        this.error(
          `@ui-organized/react-vite: failed to build theme tokens from "${options.config}".\n${String(err)}`
        );
      }
    },

    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id: string) {
      if (id !== RESOLVED_VIRTUAL_ID) return;
      const css = cachedCss ?? "";
      return `
const css = ${JSON.stringify(css)};
if (typeof document !== 'undefined') {
  const existing = document.getElementById('__ds_theme__');
  const el = existing ?? document.createElement('style');
  el.id = '__ds_theme__';
  el.textContent = css;
  if (!existing) document.head.appendChild(el);
}
export default css;
`;
    },

    configureServer(server: ViteDevServer) {
      server.watcher.add(resolvedConfigPath);

      server.watcher.on("change", (file: string) => {
        if (file !== resolvedConfigPath) return;

        try {
          cachedCss = generateCss(resolvedConfigPath);
          const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
          }
          server.hot.send({ type: "full-reload" });
          server.config.logger.info(
            `[@ui-organized/react-vite] Theme config changed — tokens regenerated.`,
            { timestamp: true }
          );
        } catch (err) {
          server.config.logger.error(
            `[@ui-organized/react-vite] Token build failed: ${String(err)}`,
            { timestamp: true }
          );
        }
      });
    },

    generateBundle() {
      if (!cachedCss) return;
      this.emitFile({
        type: "asset",
        fileName: "ds-theme.css",
        source: cachedCss,
      });
    },
  };
}
