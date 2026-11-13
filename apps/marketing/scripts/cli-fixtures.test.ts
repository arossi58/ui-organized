/**
 * The CLI's theme-bundle fixtures, built by the Theme Builder's own code.
 *
 * `packages/cli/test/fixtures/` holds real exports, which the CLI's zip and
 * theme tests read. The first was exported by hand in July and kept by hand:
 * by November its `--z-index-popover` was 1000, under dialog's 1100, and
 * nothing noticed, because nothing compared it with the tokens. So this file
 * does both jobs:
 *
 * - Always: each fixture's layout constants must equal `globalConstantVars()`.
 *   A token change the fixtures predate fails here, rather than leaving the CLI
 *   tested against a theme no current export could produce.
 * - With `REGENERATE_CLI_FIXTURES=1` (`pnpm --filter @ui-organized/marketing
 *   fixtures:cli`): rebuild both zips from the fixture's own theme.json, with
 *   the Export tab's own builders and file list (`BUILDERS` in `useExport.ts`,
 *   `BUNDLE_FILES` in `bundle.ts`), so a file the tab adds reaches them too.
 *
 * Two archives, because the CLI's zip reader has two paths. JSZip's default,
 * STORE with the sizes in each local header, is what the Export tab downloads.
 * DEFLATE with data descriptors, where the sizes live only in the central
 * directory, is what streaming archivers (macOS's Compress among them) write
 * when someone re-zips the folder.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { globalConstantVars } from "@ui-organized/tokens";
import { BUILDERS } from "../src/tools/theme-builder/hooks/useExport";
import { useBuilderStore } from "../src/tools/theme-builder/state/themeState";
import { BUNDLE_FILES } from "../src/tools/theme-builder/utils/bundle";

const FIXTURES = fileURLToPath(new URL("../../../packages/cli/test/fixtures/", import.meta.url));
const STORED = `${FIXTURES}kitchen-sink-teal-theme.zip`;
const DEFLATED = `${FIXTURES}kitchen-sink-teal-theme-deflate.zip`;

/**
 * Fixed, so regenerating unchanged content leaves the bytes unchanged. UTC
 * because JSZip writes the DOS timestamp from the UTC fields: a local date
 * would give each timezone different bytes.
 */
const DATE = new Date(Date.UTC(2026, 0, 1));

async function regenerate(): Promise<void> {
  const source = await JSZip.loadAsync(readFileSync(STORED));
  const themeJson = await source.file("theme.json")!.async("string");
  useBuilderStore.getState().loadFromThemeJson(JSON.parse(themeJson));
  const state = useBuilderStore.getState();

  const zip = new JSZip();
  for (const { name } of BUNDLE_FILES) zip.file(name, BUILDERS[name](state), { date: DATE });

  writeFileSync(STORED, await zip.generateAsync({ type: "nodebuffer" }));
  writeFileSync(
    DEFLATED,
    await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", streamFiles: true }),
  );
}

/** The `--z-index-*` and `--dimension-*` declarations a theme.css carries. */
function layoutConstants(css: string): Record<string, string> {
  return Object.fromEntries(
    [...css.matchAll(/(--(?:z-index|dimension)-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [
      m[1]!,
      m[2]!.trim(),
    ]),
  );
}

describe("CLI theme fixtures", () => {
  // Declared first: vitest runs a file's tests in order, so a regeneration run
  // checks what it just wrote.
  it.runIf(process.env.REGENERATE_CLI_FIXTURES)(
    "regenerate from the fixture's theme.json",
    async () => {
      await regenerate();
    },
  );

  it.each([
    ["kitchen-sink-teal-theme.zip", STORED],
    ["kitchen-sink-teal-theme-deflate.zip", DEFLATED],
  ])("%s carries the current layout constants", async (_name, path) => {
    const zip = await JSZip.loadAsync(readFileSync(path));
    const css = await zip.file("theme.css")!.async("string");
    expect(
      layoutConstants(css),
      "Stale fixture: run `pnpm --filter @ui-organized/marketing fixtures:cli`",
    ).toEqual(globalConstantVars());
  });
});
