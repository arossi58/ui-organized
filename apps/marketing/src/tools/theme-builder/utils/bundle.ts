/**
 * What the export bundle contains, and what the zip is called.
 *
 * Shared by `useExport`, which writes the files, and the Export panel, which
 * lists them. The two used to be written separately and drifted: the panel
 * promised "one config in three shapes" and listed three files while the zip
 * carried five. `useExport` keys its builders by these names, so a file added
 * here without a builder is a type error rather than a quietly short zip.
 *
 * Deliberately free of the builders themselves: `buildReadme` quotes
 * `bundleFileName`, so importing it here would make a cycle.
 */

import { CSS_FILENAME } from "./buildCss";

export const BUNDLE_FILES = [
  { name: "theme.json", description: "DTCG design tokens, the canonical config (code and Figma)." },
  { name: CSS_FILENAME, description: "Ready-to-use CSS custom properties for both modes (web)." },
  { name: "icons.ts", description: "IconProvider config: library, style, size and stroke." },
  {
    name: "fonts.ts",
    description: "The typefaces the theme names, with the stylesheet URL for each.",
  },
  { name: "README.md", description: "Setup steps for code and Figma." },
] as const;

export type BundleFileName = (typeof BUNDLE_FILES)[number]["name"];

/**
 * The zip's file name: the theme name as a slug, with `-theme` added unless the
 * slug already ends in it.
 *
 * The default theme, "My Theme", downloads as `my-theme.zip`, the name the docs
 * and the CLI's help use. It used to append `-theme` unconditionally and arrive
 * as `my-theme-theme.zip`. "Kitchen Sink Teal" gives `kitchen-sink-teal-theme.zip`,
 * so a theme named after its brand still says what it is in Downloads. A name
 * with nothing sluggable in it falls back to the default.
 *
 * The bundle README quotes this name in its CLI command, so both read it here.
 */
export function bundleFileName(themeName: string): string {
  const slug =
    themeName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "my-theme";
  return `${/(^|-)theme$/.test(slug) ? slug : `${slug}-theme`}.zip`;
}
