import JSZip from "jszip";
import { useBuilderStore } from "../state/themeState";
import { buildThemeCss, CSS_FILENAME } from "../utils/buildCss";
import { buildThemeJson, buildIconsModule, buildReadme } from "../utils/buildConfig";
import { buildFontsModule } from "../utils/buildFonts";

export interface ExportResult {
  ok: boolean;
  errors?: string[];
}

export function useExport() {
  const state = useBuilderStore();

  const buildCss = (): string => buildThemeCss(state);

  const slug = (): string =>
    (state.themeName || "theme").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  function download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportConfig(): ExportResult {
    try {
      download(new Blob([buildCss()], { type: "text/css" }), CSS_FILENAME);
      return { ok: true };
    } catch (err) {
      return { ok: false, errors: [String(err)] };
    }
  }

  /**
   * Export the full theme config as a zip: the canonical DTCG `theme.json`
   * (code + Figma), the derived `theme.css` (web), the `icons.ts` IconProvider
   * snippet, the `fonts.ts` stylesheet links, and a README tying them together.
   *
   * `icons.ts` and `fonts.ts` are the two things CSS can't carry — React context
   * and an efficiently-loadable font request — so they ship as their own
   * artifacts rather than being forced into the stylesheet.
   */
  async function exportBundle(): Promise<ExportResult> {
    try {
      const zip = new JSZip();
      zip.file("theme.json", buildThemeJson(state));
      zip.file(CSS_FILENAME, buildCss());
      zip.file("icons.ts", buildIconsModule(state));
      zip.file("fonts.ts", buildFontsModule(state));
      zip.file("README.md", buildReadme(state));
      const blob = await zip.generateAsync({ type: "blob" });
      download(blob, `${slug()}-theme.zip`);
      return { ok: true };
    } catch (err) {
      return { ok: false, errors: [String(err)] };
    }
  }

  return { exportConfig, exportBundle, buildCss };
}
