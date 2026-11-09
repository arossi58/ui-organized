/**
 * The AI surface eval: does what we publish make agents write correct UI?
 *
 * Runs a fixed prompt set through a headless `claude -p`, working in a temp
 * directory that holds only the surface under test (a `generate-ai-docs` output),
 * so the repo's own source and CLAUDE.md can't help it. Each reply is scored with
 * `verify`, a token check and `tsc`. It does not render the output.
 *
 *   pnpm --filter @ui-organized/code-connect eval <surfaceDir> <label> [--model <id>]
 *
 * Spends model usage on every run, so it is a manual tool and not a CI gate.
 * Results go to `eval/results/<label>.json`, generated files beside them.
 */

import { execFile } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { verifyGeneratedCode } from "../src/flagging/verify.js";
import { ManifestLoader } from "../src/mcp/manifest-loader.js";
import {
  declaredTokens,
  extractCode,
  hardcodedValues,
  totals,
  unknownTokens,
  type RunScore,
} from "./score.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const CONCURRENCY = 3;
const TIMEOUT_MS = 5 * 60_000;

const args = process.argv.slice(2);
const modelFlag = args.indexOf("--model");
const model = modelFlag >= 0 ? args[modelFlag + 1]! : "claude-sonnet-5-5";
const [surfaceArg, label] = args.filter((_, i) => modelFlag < 0 || (i !== modelFlag && i !== modelFlag + 1));

if (!surfaceArg || !label) {
  console.error("usage: eval <surfaceDir> <label> [--model <id>]");
  process.exit(2);
}

const surface = resolve(process.cwd(), surfaceArg);
const outDir = join(HERE, "results", label);
mkdirSync(outDir, { recursive: true });

const prompts = JSON.parse(readFileSync(join(HERE, "prompts.json"), "utf8")) as {
  id: string;
  prompt: string;
}[];

const known = declaredTokens(readFileSync(join(REPO, "packages/tokens/output/variables.css"), "utf8"));

const INSTRUCTIONS =
  "This directory documents the UI Organized design system; start at llms.txt. " +
  "Write one self-contained React TSX file for the UI below, using @ui-organized/react. " +
  "Reply with only one fenced tsx code block. Put any custom CSS inline in that file. " +
  "Do not write files.\n\nThe UI: ";

function ask(prompt: string, cwd: string): Promise<string> {
  // Nested sessions are refused while this variable is set.
  const env = { ...process.env };
  delete env.CLAUDECODE;
  return new Promise((done, fail) => {
    const child = execFile(
      "claude",
      [
        "-p", INSTRUCTIONS + prompt,
        "--model", model,
        "--tools", "Read,Grep,Glob",
        "--allowedTools", "Read,Grep,Glob",
        "--setting-sources", "project",
        "--strict-mcp-config",
        "--no-session-persistence",
      ],
      { cwd, env, timeout: TIMEOUT_MS, maxBuffer: 16 * 1024 * 1024 },
      (error, stdout, stderr) =>
        error
          ? fail(new Error(error.killed ? `timed out after ${TIMEOUT_MS / 1000}s` : stderr || stdout || `exit ${error.code}`))
          : done(stdout),
    );
    // `claude -p` waits on an open stdin pipe until it closes.
    child.stdin?.end();
  });
}

/** Type errors in one file, against the built package a consumer would install. */
function typeErrors(file: string): number {
  const program = ts.createProgram([file], {
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    baseUrl: join(REPO, "packages/react"),
    paths: {
      "@ui-organized/react": ["dist/index.d.ts"],
      "@ui-organized/react/*": ["dist/*"],
      react: ["node_modules/@types/react/index.d.ts"],
      "react/*": ["node_modules/@types/react/*"],
      "*": ["node_modules/*", "node_modules/@types/*"],
    },
    types: [],
  });
  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.category === ts.DiagnosticCategory.Error && d.file?.fileName === file).length;
}

const loader = new ManifestLoader();

async function runOne({ id, prompt }: { id: string; prompt: string }): Promise<RunScore> {
  const empty = { id, hallucinatedImports: 0, unknownProps: 0, unknownTokens: [], hardcoded: 0, typeErrors: 0 };
  const cwd = mkdtempSync(join(tmpdir(), "uiorg-eval-"));
  try {
    cpSync(surface, cwd, { recursive: true });
    const code = extractCode(await ask(prompt, cwd));
    const file = join(outDir, `${id}.tsx`);
    writeFileSync(file, code);
    const findings = verifyGeneratedCode([file], loader, outDir);
    const score: RunScore = {
      ...empty,
      failed: false,
      hallucinatedImports: findings.filter((f) => f.kind === "unresolved-import").length,
      unknownProps: findings.filter((f) => f.kind === "unknown-prop").length,
      unknownTokens: unknownTokens(code, known),
      hardcoded: hardcodedValues(code).length,
      typeErrors: typeErrors(file),
    };
    console.error(`  ${id}: ${JSON.stringify(score)}`);
    return score;
  } catch (error) {
    console.error(`  ${id}: FAILED ${(error as Error).message.slice(0, 300)}`);
    return { ...empty, failed: true };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

const scores: RunScore[] = [];
const queue = [...prompts];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let next = queue.shift(); next; next = queue.shift()) scores.push(await runOne(next));
  }),
);
scores.sort((a, b) => a.id.localeCompare(b.id));

const result = { label, model, surface, totals: totals(scores), scores };
writeFileSync(join(outDir, "..", `${label}.json`), JSON.stringify(result, null, 2) + "\n");
process.stdout.write(`${JSON.stringify(result.totals, null, 2)}\n`);
