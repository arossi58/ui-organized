/**
 * @ui-organized/react-vite: build a Theme Builder `theme.json` into your app's CSS.
 *
 * Reads the theme.json, writes the theme stylesheet (the same one the builder
 * exports as theme.css), checks it declares every token the installed library
 * reads, and serves it as a CSS module. Editing theme.json in development swaps
 * the stylesheet in place; nothing reloads.
 *
 * Usage (vite.config.ts in a consuming project):
 *
 *   import { themePlugin } from '@ui-organized/react-vite'
 *
 *   export default {
 *     plugins: [themePlugin({ config: './theme.json' })],
 *   }
 *
 *   // src/main.ts, after the library's styles
 *   import 'virtual:@ui-organized/theme.css'
 */

import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { readFileSync } from "node:fs";
import { posix, resolve } from "node:path";
import { themeJsonToVars, themeVarsToCss, type ThemeMode } from "./themeJson.js";
import { loadTokenContract, missingTokens } from "./contract.js";

export { themeJsonToCss, type ThemeJsonToCssOptions, type ThemeMode } from "./themeJson.js";

// ─── Module ids ────────────────────────────────────────────────────────────────

/** The import that puts the theme on the page. */
const CSS_ID = "virtual:@ui-organized/theme.css";
/**
 * What it resolves to. A path ending in `.css` rather than a `\0` id, so Vite's
 * CSS pipeline takes it as a stylesheet: in dev it is a self-accepting CSS
 * module, so an update swaps its <style> in place, and in a build it lands in
 * the bundle's CSS. UnoCSS's `/__uno.css` is the precedent.
 */
const RESOLVED_CSS_ID = "/__ui-organized-theme.css";
/**
 * react-vite 2.x's import, which injected a <style> from JS and full-reloaded
 * on every edit. Kept so existing entries still work; it now just imports the
 * stylesheet.
 */
const LEGACY_ID = "virtual:@ui-organized/theme";
const RESOLVED_LEGACY_ID = "\0" + LEGACY_ID;

// ─── Options ──────────────────────────────────────────────────────────────────

export interface ThemePluginOptions {
  /**
   * Path to the `theme.json` from a Theme Builder export (or re-exported from
   * Figma with the Theme Import plugin), resolved against Vite's `root`.
   * @default "./theme.json"
   */
  config?: string;
  /**
   * Which mode lands on bare `:root`: `"light"`, `"dark"`, or `"system"` (light,
   * switching to dark with the OS). Defaults to the Default mode chosen in the
   * builder, which theme.json records, else `"light"`.
   */
  defaultMode?: ThemeMode;
}

// ─── Plugin ────────────────────────────────────────────────────────────────────

/**
 * Vite's own `normalizePath`, inlined so this package imports nothing from Vite
 * at runtime. Chokidar reports native paths, so on Windows the watcher's
 * `C:\app\theme.json` never equalled a `resolve()`d path compared as-is.
 */
function normalizePath(path: string): string {
  return posix.normalize(process.platform === "win32" ? path.replace(/\\/g, "/") : path);
}

/** `id` → [base, "?query" or ""]. */
function splitQuery(id: string): [string, string] {
  const i = id.indexOf("?");
  return i === -1 ? [id, ""] : [id.slice(0, i), id.slice(i)];
}

const PREFIX = "@ui-organized/react-vite";

export function themePlugin(options: ThemePluginOptions = {}): Plugin {
  const configOption = options.config ?? "./theme.json";
  let root = process.cwd();
  let configPath = normalizePath(resolve(configOption));
  let serving = false;
  let loaded = false;

  /** Read theme.json fresh, build the stylesheet, and hold it to the contract. */
  function generateCss(): string {
    let raw: string;
    try {
      raw = readFileSync(configPath, "utf-8");
    } catch {
      throw new Error(
        `can't read ${configOption} (${configPath}). Export a theme from the Theme Builder ` +
          "and save its theme.json there, or point themePlugin({ config }) at it.",
      );
    }
    let doc: unknown;
    try {
      doc = JSON.parse(raw);
    } catch (err) {
      throw new Error(`${configOption} isn't valid JSON: ${(err as Error).message}`);
    }

    const vars = themeJsonToVars(doc, { defaultMode: options.defaultMode });
    const contract = loadTokenContract(root);
    const missing = missingTokens(
      [...Object.keys(vars.shared), ...Object.keys(vars.light), ...Object.keys(vars.dark)],
      contract,
    );
    if (missing.length) {
      throw new Error(
        `${configOption} is missing ${missing.length} of the ${contract.tokens.length} tokens ` +
          `the components read (checked against ${contract.source}):\n` +
          missing.map((name) => `  ${name}`).join("\n") +
          "\nRe-export the theme from the Theme Builder, which writes all of them.",
      );
    }
    return themeVarsToCss(vars);
  }

  return {
    name: "ui-organized:theme",
    // Claim the virtual ids before vite:resolve tries them as files.
    enforce: "pre",

    configResolved(config: ResolvedConfig) {
      root = config.root;
      configPath = normalizePath(resolve(config.root, configOption));
      serving = config.command === "serve";
    },

    resolveId(id: string) {
      const [base, query] = splitQuery(id);
      // The resolved id comes back through here too: the dev client requests
      // it by URL, with `?t=` stripped but `?inline` and the like kept.
      if (base === CSS_ID || base === RESOLVED_CSS_ID) return RESOLVED_CSS_ID + query;
      if (id === LEGACY_ID) return RESOLVED_LEGACY_ID;
    },

    load(id: string) {
      if (id === RESOLVED_LEGACY_ID) return `import ${JSON.stringify(CSS_ID)};\n`;
      if (splitQuery(id)[0] !== RESOLVED_CSS_ID) return;
      // Rebuild on `vite build --watch`. The dev server watches through
      // configureServer instead, where a change becomes an HMR update.
      if (!serving) this.addWatchFile(configPath);
      loaded = true;
      try {
        // Not cached: it's one small JSON parse, and reading fresh means any
        // path that invalidates this module gets the current theme.
        return generateCss();
      } catch (err) {
        return this.error(`${PREFIX}: ${(err as Error).message}`);
      }
    },

    configureServer(server: ViteDevServer) {
      server.watcher.add(configPath);
      const onChange = (file: string) => {
        if (normalizePath(file) !== configPath) return;
        // A real HMR update, not a reload: the CSS module accepts itself, so the
        // client re-fetches it and swaps the <style> in place. If theme.json is
        // now broken, load() throws and Vite shows the error overlay until the
        // next save fixes it.
        for (const mod of server.moduleGraph.getModulesByFile(RESOLVED_CSS_ID) ?? []) {
          void server.reloadModule(mod);
        }
      };
      server.watcher.on("change", onChange);
      // Editors that save by replacing the file report it as added.
      server.watcher.on("add", onChange);
    },

    buildEnd(error?: Error) {
      if (serving || error || loaded) return;
      this.warn(
        `nothing imports ${CSS_ID}, so the theme isn't in this build. ` +
          "Import it once at your app's entry, after the library's styles.",
      );
    },
  };
}
