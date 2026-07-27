import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { commit, describeWrite, planApply } from "./apply.js";
import {
  BundleError,
  FONTS_TS,
  ICONS_TS,
  loadBundle,
  parseFonts,
  parseIconLibrary,
  type BundleFont,
} from "./bundle.js";
import {
  checkCascade,
  checkFontsPresent,
  checkFontWeights,
  checkTokenCoverage,
  type Finding,
} from "./checks.js";
import { display, inspectProject, installCommand, type Project } from "./project.js";

/**
 * `uiorg` — apply a UI Organized theme bundle, and check it actually works.
 *
 * The copying is the trivial part. What earns a command is validating at the
 * moment of application: whether the theme covers what the components read,
 * whether the fonts it names can load, whether the weights it asks for exist,
 * and whether something later in the cascade will quietly override it. Every
 * one of those failed silently before this existed.
 */

const USAGE = `uiorg — UI Organized command line

Usage
  uiorg theme <bundle>          Apply a theme bundle (.zip, or an unzipped folder)
  uiorg theme <bundle> --check  Report only; write nothing

Options
  --out <dir>     Where to write, relative to the project. Default: beside an
                  existing theme.css, else src/styles/
  --dry-run       Alias for --check
  --force         Apply even with uncommitted changes in the working tree
  --offline       Skip the Google Fonts weight verification (no network)
  --cwd <dir>     Treat <dir> as the project root. Default: the current directory
  -h, --help      Show this
  -v, --version   Show the version

Examples
  npx @ui-organized/cli theme ~/Downloads/my-theme.zip
  npx @ui-organized/cli theme ./my-theme --dry-run
  npx @ui-organized/cli theme ~/Downloads/my-theme.zip --out src/theme
`;

/**
 * Read from package.json rather than hardcoded.
 *
 * A literal here drifts the moment Changesets bumps the version: 0.2.0 shipped
 * reporting `0.1.0`, because nothing connects a constant to the file that
 * actually defines the version. Both bundles live in `dist/`, so package.json is
 * one level up, and npm always includes it in the tarball.
 */
function version(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

interface Options {
  bundle?: string;
  out?: string;
  check: boolean;
  force: boolean;
  offline: boolean;
  cwd: string;
}

export async function run(argv: string[]): Promise<number> {
  // Asking for help is a success; being given nothing to do is not. The two used
  // to share an exit code, which meant a CLI that ran but did nothing was
  // indistinguishable from one working correctly — exactly what made the
  // symlink bug read as caller error for as long as it did.
  if (argv.length === 0) {
    process.stderr.write(`${USAGE}\n`);
    return 2;
  }
  if (argv[0] === "-h" || argv[0] === "--help") {
    process.stdout.write(USAGE);
    return 0;
  }
  if (argv[0] === "-v" || argv[0] === "--version") {
    process.stdout.write(`${version()}\n`);
    return 0;
  }

  const [command, ...rest] = argv;
  if (command !== "theme") {
    process.stderr.write(`Unknown command "${command}".\n\n${USAGE}`);
    return 2;
  }

  let options: Options;
  try {
    options = parseOptions(rest);
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n\n${USAGE}`);
    return 2;
  }

  if (!options.bundle) {
    process.stderr.write(`Which bundle? Pass the zip you exported.\n\n${USAGE}`);
    return 2;
  }

  return applyTheme(options);
}

function parseOptions(args: string[]): Options {
  const options: Options = { check: false, force: false, offline: false, cwd: process.cwd() };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const takeValue = (name: string): string => {
      const value = args[++i];
      if (!value) throw new Error(`${name} needs a value.`);
      return value;
    };

    if (arg === "--check" || arg === "--dry-run") options.check = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--offline") options.offline = true;
    else if (arg === "--out") options.out = takeValue("--out");
    else if (arg === "--cwd") options.cwd = takeValue("--cwd");
    else if (arg.startsWith("-")) throw new Error(`Unknown option "${arg}".`);
    else if (options.bundle) throw new Error(`Unexpected extra argument "${arg}".`);
    else options.bundle = arg;
  }

  return options;
}

async function applyTheme(options: Options): Promise<number> {
  let bundle;
  try {
    bundle = loadBundle(options.bundle!);
  } catch (error) {
    if (error instanceof BundleError) {
      process.stderr.write(`✗ ${error.message}\n`);
      return 1;
    }
    throw error;
  }

  // The bundle is loaded first so detection can be told to ignore it: an
  // unzipped bundle inside the project has a theme.css of its own, and it is
  // usually shallower than the app's.
  const project = inspectProject(options.cwd, { ignore: bundle.source });

  const fontsSource = bundle.files.get(FONTS_TS);
  const fonts: BundleFont[] = fontsSource ? parseFonts(fontsSource) : [];

  const plan = planApply(bundle, project, options.out ? { out: options.out } : {});

  // Checks run before anything is written, so `--check` and a real run report
  // identically — and a failing theme is reported before it lands on disk.
  const findings: Finding[] = [
    ...checkTokenCoverage(bundle, project),
    ...checkFontsPresent(bundle, fonts),
    ...(await checkFontWeights(fonts, { offline: options.offline })),
    ...checkCascade(project, plan.themeCssPath, bundle.source),
  ];

  process.stdout.write(`\n${bold("UI Organized")} — applying ${display(project, options.bundle!)}\n\n`);
  report(findings);

  const blocking = findings.filter((f) => f.severity === "error");
  if (blocking.length > 0) {
    process.stdout.write(
      `\n✗ Not applied — ${blocking.length} problem${blocking.length > 1 ? "s" : ""} above would leave the app rendering wrong.\n` +
        `  Re-run with --force to apply anyway.\n\n`,
    );
    if (!options.force) return 1;
  }

  // A dirty tree means there is no clean `git diff` to inspect afterwards and no
  // easy way to undo — so ask, rather than overwrite someone's work in progress.
  const overwriting = plan.writes.some((w) => w.status === "updated");
  if (overwriting && project.gitClean === false && !options.force && !options.check) {
    process.stdout.write(
      `✗ Not applied — this would overwrite files and the working tree has uncommitted changes.\n` +
        `  Commit or stash first, or re-run with --force.\n\n` +
        plan.writes.filter((w) => w.status === "updated").map((w) => describeWrite(project, w)).join("\n") +
        `\n\n`,
    );
    return 1;
  }

  process.stdout.write(`${bold(options.check ? "Would write" : "Files")}\n`);
  for (const write of plan.writes) process.stdout.write(`${describeWrite(project, write)}\n`);

  if (options.check) {
    process.stdout.write(`\n${dim("Nothing written (--check).")}\n\n`);
    return blocking.length > 0 ? 1 : 0;
  }

  const changed = commit(plan);
  process.stdout.write(
    changed.length === 0
      ? `\n${dim("Everything already up to date.")}\n`
      : `\n✓ Applied ${changed.length} file${changed.length > 1 ? "s" : ""}.\n`,
  );

  nextSteps(project, bundle, fonts, plan.themeCssPath);
  return blocking.length > 0 ? 1 : 0;
}

// ─── Output ──────────────────────────────────────────────────────────────────

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const bold = (s: string): string => (useColor ? `\u001b[1m${s}\u001b[0m` : s);
const dim = (s: string): string => (useColor ? `\u001b[2m${s}\u001b[0m` : s);
const red = (s: string): string => (useColor ? `\u001b[31m${s}\u001b[0m` : s);
const yellow = (s: string): string => (useColor ? `\u001b[33m${s}\u001b[0m` : s);
const green = (s: string): string => (useColor ? `\u001b[32m${s}\u001b[0m` : s);

function report(findings: Finding[]): void {
  for (const finding of findings) {
    const mark =
      finding.severity === "error" ? red("✗") : finding.severity === "warning" ? yellow("!") : green("✓");
    process.stdout.write(`${mark} ${finding.title}\n`);
    if (finding.detail) {
      for (const line of finding.detail.split("\n")) {
        process.stdout.write(line ? `    ${dim(line)}\n` : "\n");
      }
    }
  }
  if (findings.length > 0) process.stdout.write("\n");
}

/**
 * What the CLI can't do for you.
 *
 * Import sites differ by framework and the head is not ours to edit, so this
 * prints the lines rather than guessing where they go.
 */
function nextSteps(
  project: Project,
  bundle: ReturnType<typeof loadBundle>,
  fonts: BundleFont[],
  themeCssPath: string,
): void {
  const steps: string[] = [];
  const cssImport = importSpecifier(project, themeCssPath);

  steps.push(
    `Import the stylesheets at your app entry${project.entry ? ` (${display(project, project.entry)})` : ""}, in this order:\n` +
      `      import '@ui-organized/react/styles'\n` +
      `      import '${cssImport}'\n` +
      `    Order matters: both declare on :root, and that tie goes to whichever loads last.`,
  );

  const iconsSource = bundle.files.get(ICONS_TS);
  const library = iconsSource ? parseIconLibrary(iconsSource) : undefined;
  if (library) {
    const pkg =
      library === "lucide" ? "lucide-react" : library === "tabler" ? "@tabler/icons-react" : "@heroicons/react";
    steps.push(
      `Install and register the icon set — @ui-organized/react imports none itself:\n` +
        `      ${installCommand(project, pkg)}\n` +
        `      import '@ui-organized/react/icons/${library}'`,
    );
  }

  if (fonts.length > 0) {
    steps.push(
      `Add the font links to your document head — a stylesheet can name a\n` +
        `    typeface but not efficiently load one:\n` +
        `      <link rel="preconnect" href="https://fonts.googleapis.com">\n` +
        `      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
        fonts.map((f) => `      <link rel="stylesheet" href="${f.href}">`).join("\n"),
    );
  }

  process.stdout.write(`\n${bold("Next")}\n`);
  steps.forEach((step, i) => process.stdout.write(`  ${i + 1}. ${step}\n`));
  process.stdout.write("\n");
}

/** How the entry module would import the stylesheet we just wrote. */
function importSpecifier(project: Project, themeCssPath: string): string {
  if (!project.entry) return `./${display(project, themeCssPath)}`;
  const rel = relative(project.entry.replace(/[^/\\]+$/, ""), themeCssPath).split(/[\\/]/).join("/");
  return rel.startsWith(".") ? rel : `./${rel}`;
}

/**
 * Run the CLI against `process.argv`, setting the exit code.
 *
 * This module is the *library* half of the package and never executes itself —
 * `src/cli.ts` is the bin, and it calls this unconditionally. Keeping the two
 * apart is deliberate: the previous single-module arrangement needed an
 * entry-point guard to tell "run as a bin" from "imported by a test", and that
 * guard silently disabled the whole CLI when installed. See `src/cli.ts`.
 */
export async function main(): Promise<void> {
  try {
    process.exitCode = await run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `✗ ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
