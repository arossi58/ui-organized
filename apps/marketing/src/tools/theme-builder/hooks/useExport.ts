import JSZip from "jszip";
import { useBuilderStore, type BuilderState } from "../state/themeState";
import { buildThemeCss, CSS_FILENAME } from "../utils/buildCss";
import { buildThemeJson, buildIconsModule, buildReadme } from "../utils/buildConfig";
import { buildFontsModule } from "../utils/buildFonts";
import { BUNDLE_FILES, bundleFileName, type BundleFileName } from "../utils/bundle";

export interface ExportResult {
  ok: boolean;
  errors?: string[];
}

/**
 * One builder per bundle file. Keyed by `BundleFileName`, so the Export panel's
 * list and the zip can only disagree by failing to type-check.
 */
const BUILDERS: Record<BundleFileName, (state: BuilderState) => string> = {
  "theme.json": buildThemeJson,
  [CSS_FILENAME]: buildThemeCss,
  "icons.ts": buildIconsModule,
  "fonts.ts": buildFontsModule,
  "README.md": buildReadme,
};

export function useExport() {
  const state = useBuilderStore();

  const buildCss = (): string => buildThemeCss(state);

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
   * Export the full theme config as a zip of `BUNDLE_FILES`: the canonical DTCG
   * `theme.json` (code + Figma), the derived `theme.css` (web), the `icons.ts`
   * IconProvider snippet, the `fonts.ts` stylesheet links, and a README tying
   * them together.
   *
   * `icons.ts` and `fonts.ts` are the two things CSS can't carry — React context
   * and an efficiently-loadable font request — so they ship as their own
   * artifacts rather than being forced into the stylesheet.
   */
  async function exportBundle(): Promise<ExportResult> {
    try {
      const zip = new JSZip();
      for (const file of BUNDLE_FILES) zip.file(file.name, BUILDERS[file.name](state));
      const blob = await zip.generateAsync({ type: "blob" });
      download(blob, bundleFileName(state.themeName));
      return { ok: true };
    } catch (err) {
      return { ok: false, errors: [String(err)] };
    }
  }

  return { exportConfig, exportBundle, buildCss };
}
