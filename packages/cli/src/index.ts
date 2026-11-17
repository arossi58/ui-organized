import { readFileSync } from "node:fs";
import { commit, describeWrite, planApply } from "./apply.js";
import { BundleError, FONTS_TS, loadBundle, parseFonts, readIconSettings, type BundleFont } from "./bundle.js";
import {
  checkCascade,
  checkFontsPresent,
  checkFontWeights,
  checkIconAdapter,
  checkTokenCoverage,
  targetFramework,
  type Finding,
} from "./checks.js";
import { commitInit, describePin, InitError, planInit } from "./init.js";
import { nextSteps } from "./next-steps.js";
import { display, FRAMEWORKS, inspectProject, LABELS, LIBRARIES, type Framework } from "./project.js";

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
  uiorg init                    Set up AI agents: rules plus the MCP server
  uiorg init --check            Report only; write nothing

Options
  --out <dir>     Where to write, relative to the project. Default: beside an
                  existing theme.css, else src/styles/
  --dry-run       Alias for --check
  --force         (theme) Apply despite blocking findings or uncommitted
                  changes. Exits 1 anyway when a check blocked
  --offline       Skip the Google Fonts weight verification (no network)
  --cwd <dir>     Treat <dir> as the project root. Default: the current directory
  --framework <f> react, svelte, vue or angular. Needed only when package.json
                  lists more than one UI Organized library, or (theme) none
  --cursor        (init) Write Cursor's files even without a .cursor/ directory
  -h, --help      Show this
  -v, --version   Show the version

Examples
  npx @ui-organized/cli theme ~/Downloads/my-theme.zip
  npx @ui-organized/cli theme ./my-theme --dry-run
  npx @ui-organized/cli theme ~/Downloads/my-theme.zip --out src/theme
  npx @ui-organized/cli init
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
  framework?: Framework;
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
  if (command === "init") return runInit(rest);
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

/** The value after an option, or a usage error naming the option. */
function valueAfter(args: string[], i: number, name: string): string {
  const value = args[i + 1];
  if (!value) throw new Error(`${name} needs a value.`);
  return value;
}

function parseOptions(args: string[]): Options {
  const options: Options = { check: false, force: false, offline: false, cwd: process.cwd() };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const takeValue = (name: string): string => valueAfter(args, i++, name);

    if (arg === "--check" || arg === "--dry-run") options.check = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--offline") options.offline = true;
    else if (arg === "--out") options.out = takeValue("--out");
    else if (arg === "--cwd") options.cwd = takeValue("--cwd");
    else if (arg === "--framework") options.framework = frameworkOption(takeValue("--framework"));
    else if (arg.startsWith("-")) throw new Error(`Unknown option "${arg}".`);
    else if (options.bundle) throw new Error(`Unexpected extra argument "${arg}".`);
    else options.bundle = arg;
  }

  return options;
}

function frameworkOption(value: string): Framework {
  if (!(FRAMEWORKS as string[]).includes(value)) {
    throw new Error(`Unknown --framework "${value}". Use one of: ${FRAMEWORKS.join(", ")}.`);
  }
  return value as Framework;
}

function runInit(args: string[]): number {
  const options: { cwd: string; check: boolean; cursor: boolean; framework?: string } = {
    cwd: process.cwd(),
    check: false,
    cursor: false,
  };
  try {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]!;
      if (arg === "--check" || arg === "--dry-run") options.check = true;
      else if (arg === "--cursor") options.cursor = true;
      // A missing value used to fall through to "Unknown option", which names
      // the one option that does exist.
      else if (arg === "--cwd") options.cwd = valueAfter(args, i++, "--cwd");
      else if (arg === "--framework") options.framework = valueAfter(args, i++, "--framework");
      else throw new Error(`Unknown option "${arg}" for init.`);
    }
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n\n${USAGE}`);
    return 2;
  }

  let plan;
  try {
    plan = planInit(options);
  } catch (error) {
    if (error instanceof InitError) {
      process.stderr.write(`✗ ${error.message}\n`);
      return 1;
    }
    throw error;
  }

  const from = plan.packages.some((dir) => dir !== ".") ? ` in ${plan.packages.join(", ")}` : "";
  process.stdout.write(`\n${bold("UI Organized")} — AI agent setup\n\n`);
  process.stdout.write(`  ${dim(`${LIBRARIES[plan.framework]} ${plan.version}${from}; ${describePin(plan)}`)}\n\n`);
  for (const write of plan.writes) process.stdout.write(`  ${write.status.padEnd(9)} ${write.path}\n`);

  if (options.check) {
    process.stdout.write(`\n${dim("Nothing written (--check).")}\n\n`);
    return 0;
  }

  commitInit(options.cwd, plan.writes);
  process.stdout.write(
    `\n✓ Done. Restart your agent so it picks up the MCP server.\n` +
      `${dim("  Building from Figma links: turn on Figma's MCP server; the ui-organized-figma skill combines the two.")}\n\n`,
  );
  return 0;
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
  const target = targetFramework(project, options.framework);
  const { framework } = target;

  const fontsSource = bundle.files.get(FONTS_TS);
  const fonts: BundleFont[] = fontsSource ? parseFonts(fontsSource) : [];
  const icons = readIconSettings(bundle.files);

  // icons.ts is React's; the other libraries get their provider printed instead.
  const plan = planApply(bundle, project, {
    ...(options.out ? { out: options.out } : {}),
    icons: framework === "react",
  });

  // Checks run before anything is written, so `--check` and a real run report
  // identically — and a failing theme is reported before it lands on disk.
  const findings: Finding[] = [
    ...target.findings,
    ...checkTokenCoverage(bundle, project, framework),
    ...checkFontsPresent(bundle, fonts),
    ...(await checkFontWeights(fonts, { offline: options.offline })),
    ...checkCascade(project, plan.themeCssPath, bundle.source),
    ...checkIconAdapter(framework, icons),
  ];

  process.stdout.write(`\n${bold("UI Organized")} — applying ${display(project, options.bundle!)}\n\n`);
  report(findings);

  const blocking = findings.filter((f) => f.severity === "error");
  if (blocking.length > 0) {
    const problems = `${blocking.length} problem${blocking.length > 1 ? "s" : ""} above`;
    // --force used to print "Not applied" here and then apply, so the one
    // line that mattered said the opposite of what happened.
    process.stdout.write(
      options.force && !options.check
        ? `\n${yellow("!")} Applying anyway (--force). The ${problems} will leave the app rendering wrong,\n` +
            `  so this still exits 1.\n\n`
        : `\n✗ Not applied — ${problems} would leave the app rendering wrong.\n` +
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

  const steps = nextSteps({
    project,
    framework,
    themeCssPath: plan.themeCssPath,
    ...(plan.iconsTsPath ? { iconsTsPath: plan.iconsTsPath } : {}),
    ...(icons ? { icons } : {}),
    fonts,
  });
  process.stdout.write(`\n${bold("Next")} ${dim(`(${LABELS[framework]})`)}\n`);
  steps.forEach((step, i) => process.stdout.write(`  ${i + 1}. ${step}\n`));
  process.stdout.write("\n");
  return blocking.length > 0 ? 1 : 0;
}

// ─── Output ──────────────────────────────────────────────────────────────────

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const bold = (s: string): string => (useColor ? `\u001b[1m${s}\u001b[0m` : s);
const dim = (s: string): string => (useColor ? `\u001b[2m${s}\u001b[0m` : s);
const red = (s: string): string => (useColor ? `\u001b[31m${s}\u001b[0m` : s);
const yellow = (s: string): string => (useColor ? `\u001b[33m${s}\u001b[0m` : s);
const green = (s: string): string => (useColor ? `\u001b[32m${s}\u001b[0m` : s);

const MARKS: Record<Finding["severity"], string> = {
  error: red("✗"),
  warning: yellow("!"),
  pass: green("✓"),
  // Context, not a result: only a check that ran and passed wears a tick.
  info: dim("·"),
};

function report(findings: Finding[]): void {
  for (const finding of findings) {
    process.stdout.write(`${MARKS[finding.severity]} ${finding.title}\n`);
    if (finding.detail) {
      for (const line of finding.detail.split("\n")) {
        process.stdout.write(line ? `    ${dim(line)}\n` : "\n");
      }
    }
  }
  if (findings.length > 0) process.stdout.write("\n");
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
