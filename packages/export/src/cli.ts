import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  filesToProject,
  MANIFEST_PATH,
  PROJECT_PATH,
  type RepoFile,
  type RepoManifest,
} from "@ui-organized/token-io";
import { exportCss } from "./index.js";

/**
 * CLI run by CI (see `templates/tokens-export.yml`): reads a repo's `tokens/`
 * file set, resolves + exports CSS custom properties, and writes them out.
 *
 *   uiorg-export [repoRoot] [outFile]
 *     repoRoot  default: cwd
 *     outFile   default: <repoRoot>/tokens/output/variables.css
 */
function main(): void {
  const root = process.argv[2] ?? process.cwd();
  const outFile = process.argv[3] ?? join(root, "tokens", "output", "variables.css");
  const read = (p: string): string => readFileSync(join(root, p), "utf-8");

  let manifest: RepoManifest;
  const files: RepoFile[] = [];
  try {
    const manifestRaw = read(MANIFEST_PATH);
    manifest = JSON.parse(manifestRaw) as RepoManifest;
    files.push({ path: MANIFEST_PATH, content: manifestRaw });
    files.push({ path: PROJECT_PATH, content: read(PROJECT_PATH) });
    for (const entry of manifest.sets) files.push({ path: entry.file, content: read(entry.file) });
  } catch (error) {
    console.error("✗ Could not read tokens files:", error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const parsed = filesToProject(files);
  if (!parsed.ok) {
    console.error("✗ Invalid project document:", parsed.error.message);
    process.exit(1);
  }

  const css = exportCss(parsed.value);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, css, "utf-8");
  console.log(`✓ Exported CSS custom properties → ${outFile}`);
}

main();
