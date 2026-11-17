import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { figmaSkillMarkdown, projectRules } from "@ui-organized/code-connect/rules";
import { FRAMEWORKS, LABELS, LIBRARIES, workspacePackages, type Framework } from "./project.js";

/**
 * `uiorg init` — point a project's AI agents at the design system.
 *
 * Writes the agent rules and the MCP config. Everything it touches may already
 * hold the user's own content, so rules go in a marked block that a re-run
 * replaces, and our MCP server entry is merged into the config, leaving the
 * other servers and keys alone. The Figma skill and the Cursor rules are files
 * it owns whole, so those are replaced. Nothing is written until every file has
 * been read successfully: a half-applied init is harder to undo than none.
 */

const START = "<!-- ui-organized:start -->";
const END = "<!-- ui-organized:end -->";

/** The first library major with an MCP server. */
const FIRST_MCP_MAJOR = 6;

/**
 * The MCP server that 6.0.x has, since `@ui-organized/mcp@6.0.0` doesn't exist.
 *
 * The server joined the libraries' version line by a hand-edited bump that
 * `changeset version` then skipped past, so 6.0.0 was never published. 0.1.0
 * was: it was built from the 6.0.0 source, and its data says so
 * (`meta.json` `reactVersion: "6.0.0"`) for all four libraries. 6.1.0 is no
 * substitute: Angular 6.1.0 added `controlled` inputs and a component that
 * 6.0.x doesn't have, and describing them is what the pin exists to prevent.
 */
const MCP_FOR_6_0 = { version: "0.1.0", describes: "6.0.0" } as const;

/**
 * The `@ui-organized/mcp` version that describes a library version or range.
 *
 * From 6.1.0 the server releases with the libraries at the same version, so the
 * pin is the library's own. 6.0.x installed, `~6.0.x` or an exact `6.0.x` pins
 * 0.1.0 (see `MCP_FOR_6_0`). `^6.0.x` stays as written: npx resolves it to the
 * newest 6.x server, which exists and matches what the range installs.
 */
export function mcpVersionFor(version: string): string {
  const [, prefix, major, minor] = /^([\^~]?)(\d+)\.(\d+)\./.exec(version) ?? [];
  if (Number(major) === FIRST_MCP_MAJOR && Number(minor) === 0 && prefix !== "^") return MCP_FOR_6_0.version;
  return version;
}

/**
 * The MCP entry for a project. The server releases with the libraries and ships
 * their data, so it is pinned to the version installed (`mcpVersionFor`):
 * unpinned, npx serves the newest, which can describe props the project doesn't
 * have yet. Re-running init after an upgrade moves the pin. React needs no flag;
 * the others tell the server which library to answer for.
 */
export function mcpServerFor(framework: Framework, mcpVersion: string): { command: string; args: string[] } {
  return {
    command: "npx",
    args: ["-y", `@ui-organized/mcp@${mcpVersion}`, ...(framework === "react" ? [] : ["--framework", framework])],
  };
}

export interface InitOptions {
  cwd: string;
  check: boolean;
  /** Write Cursor's files even without a `.cursor/` directory. */
  cursor: boolean;
  /** Which library to describe, when the project installs more than one. */
  framework?: string;
}

export interface InitWrite {
  path: string;
  /** `replaced` is a file init owns whole, so any edits to it are gone, said plainly. */
  status: "created" | "updated" | "replaced" | "unchanged";
  content: string;
}

export class InitError extends Error {}

export function rulesMarkdown(framework: Framework = "react"): string {
  const rules = projectRules(LIBRARIES[framework], framework).map((rule, i) => `${i + 1}. ${rule}`);
  const title = framework === "react" ? "UI Organized design system" : `UI Organized design system (${LABELS[framework]})`;
  return `## ${title}\n\n${rules.join("\n")}\n`;
}

/**
 * Inserts or replaces the marked block, leaving everything around it alone.
 *
 * The block replaced is the one an end marker closes, from the nearest start
 * marker before it. A start marker with no end after it (the end deleted by
 * hand, or the file cut short) is not a block: where ours stopped can't be
 * known, so the stray marker is dropped and a fresh block appended, leaving
 * the old rules as plain text to delete. Appending beside it used to look
 * harmless, until the next run paired the stray start with the new end and
 * deleted everything the user had written between them.
 */
export function withManagedBlock(existing: string | undefined, block: string): string {
  const managed = `${START}\n${block.trimEnd()}\n${END}\n`;
  if (!existing) return managed;
  const first = existing.indexOf(START);
  const to = first >= 0 ? existing.indexOf(END, first) : -1;
  if (to >= 0) {
    const from = existing.lastIndexOf(START, to);
    return existing.slice(0, from) + managed.trimEnd() + existing.slice(to + END.length);
  }
  const unmarked = existing.split(`${START}\n`).join("").split(START).join("");
  return `${unmarked.trimEnd()}\n\n${managed}`;
}

/**
 * Adds our server, keeping other servers and top-level keys in place.
 *
 * Our entry is merged too, not replaced: a user's `env` (a `FIGMA_TOKEN`
 * reference, say), `type` or `cwd` survives, while `command` and `args` are
 * ours to update, since that's how the pin moves. The file keeps its own
 * indentation, and one that already says what we would write comes back
 * byte for byte, so a re-run neither reformats it nor reports it as updated.
 */
export function withMcpServer(
  path: string,
  existing: string | undefined,
  framework: Framework,
  mcpVersion: string,
): string {
  let config: Record<string, unknown> = {};
  if (existing) {
    try {
      config = JSON.parse(existing) as Record<string, unknown>;
    } catch {
      throw new InitError(`${path} isn't valid JSON, so it can't be merged safely. Fix it and re-run.`);
    }
    if (!isRecord(config)) {
      throw new InitError(`${path} isn't a JSON object, so it can't be merged safely. Fix it and re-run.`);
    }
  }
  const servers = isRecord(config.mcpServers) ? config.mcpServers : {};
  const prev = servers["ui-organized"];
  const ours = mcpServerFor(framework, mcpVersion);
  const entry = isRecord(prev) ? { ...prev, ...ours } : ours;
  const next = { ...config, mcpServers: { ...servers, "ui-organized": entry } };
  if (existing && isDeepStrictEqual(config, next)) return existing;
  const indent = /^[ \t]+(?=")/m.exec(existing ?? "")?.[0] ?? 2;
  return `${JSON.stringify(next, null, indent)}\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type Deps = Record<string, string>;

function readDeps(manifest: string): Deps {
  let pkg: { dependencies?: Deps; devDependencies?: Deps };
  try {
    pkg = JSON.parse(readFileSync(manifest, "utf8")) as typeof pkg;
  } catch {
    throw new InitError(`${manifest} isn't valid JSON.`);
  }
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

export interface Detected {
  framework: Framework;
  /** The library version — a range when nothing is installed yet. */
  version: string;
  /** The `@ui-organized/mcp` version the server is pinned to: `version`, except on 6.0.x. */
  mcpVersion: string;
  /** Where the library is declared: `.` for the root, else workspace package paths. */
  packages: string[];
}

/**
 * Which UI Organized library this project uses, from its package.json and, in a
 * monorepo, its workspace packages'. One library is used as-is; several need
 * `--framework` to pick, because guessing would have the agent write the wrong
 * library's code.
 */
export function detectFramework(cwd: string, requested?: string): Detected {
  if (!existsSync(join(cwd, "package.json"))) {
    throw new InitError(`No package.json in ${cwd}. Run this in your project, or pass --cwd.`);
  }
  const deps = new Map<string, Deps>();
  for (const dir of [".", ...workspacePackages(cwd)]) deps.set(dir, readDeps(join(cwd, dir, "package.json")));

  const users = new Map<Framework, string[]>();
  for (const fw of FRAMEWORKS) {
    const dirs = [...deps].filter(([, d]) => d[LIBRARIES[fw]]).map(([dir]) => dir);
    if (dirs.length) users.set(fw, dirs);
  }
  const installed = [...users.keys()];
  const where = deps.size > 1 ? `package.json or its ${deps.size - 1} workspace packages` : "package.json";
  const detected = (framework: Framework): Detected => {
    const packages = users.get(framework)!;
    const version = libraryVersion(cwd, LIBRARIES[framework], packages, deps);
    return { framework, packages, version, mcpVersion: mcpVersionFor(version) };
  };

  if (requested !== undefined) {
    if (!(requested in LIBRARIES)) {
      throw new InitError(`Unknown --framework "${requested}". Use one of: ${Object.keys(LIBRARIES).join(", ")}.`);
    }
    const fw = requested as Framework;
    if (!installed.includes(fw)) {
      throw new InitError(`${LIBRARIES[fw]} isn't in ${where}. Install it first, so the rules describe something real.`);
    }
    return detected(fw);
  }
  if (installed.length === 1) return detected(installed[0]!);
  if (installed.length > 1) {
    const named = (fw: Framework) =>
      deps.size > 1 ? `${LIBRARIES[fw]} (${users.get(fw)!.join(", ")})` : LIBRARIES[fw];
    throw new InitError(
      `This project installs ${installed.map(named).join(" and ")}. ` +
        `Pass --framework ${installed.join("|")} to choose which one your agent should use. Nothing was written.`,
    );
  }
  throw new InitError(
    `No UI Organized library in ${where}. Install ${Object.values(LIBRARIES).join(", ")} first, so the rules describe something real.`,
  );
}

/**
 * The version of `name` the project uses: what's installed, or before an install
 * what package.json asks for. Several packages on different versions can't share
 * one server, so that's refused rather than averaged.
 */
function libraryVersion(cwd: string, name: string, packages: string[], deps: Map<string, Deps>): string {
  const installed = (dir: string): string | undefined => {
    const manifest = join(cwd, dir, "node_modules", name, "package.json");
    if (!existsSync(manifest)) return undefined;
    try {
      return (JSON.parse(readFileSync(manifest, "utf8")) as { version?: string }).version;
    } catch {
      return undefined;
    }
  };
  const byVersion = new Map<string, string[]>();
  for (const dir of packages) {
    // A hoisted install (npm, Yarn, Bun workspaces) lives at the root instead.
    const version = installed(dir) ?? installed(".") ?? deps.get(dir)![name]!;
    byVersion.set(version, [...(byVersion.get(version) ?? []), dir]);
  }
  if (byVersion.size > 1) {
    const list = [...byVersion].map(([version, dirs]) => `${dirs.join(", ")}: ${version}`).join("; ");
    throw new InitError(
      `This project uses more than one version of ${name} (${list}). The MCP server describes one, ` +
        `so bring them to the same version, or run init in one package with --cwd. Nothing was written.`,
    );
  }
  const [version] = byVersion.keys();
  if (!version || !/^[\^~]?\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
    throw new InitError(
      `Can't pin the MCP server to ${name} "${version}". Install your dependencies so the installed version can be read, then re-run.`,
    );
  }
  if (Number(/\d+/.exec(version)![0]) < FIRST_MCP_MAJOR) {
    throw new InitError(
      `No MCP server describes ${name} ${version}: the first one covers ${MCP_FOR_6_0.describes}. ` +
        `Upgrade to ${MCP_FOR_6_0.describes} or later, then re-run.`,
    );
  }
  return version;
}

/** How the output names the pin: "pinned to match", unless it's 6.0.x's stand-in. */
export function describePin({ version, mcpVersion }: Pick<Detected, "version" | "mcpVersion">): string {
  return mcpVersion === version
    ? "MCP server pinned to match"
    : `MCP server pinned to ${mcpVersion} (${MCP_FOR_6_0.describes}'s data)`;
}

export interface InitPlan extends Detected {
  writes: InitWrite[];
}

export function planInit(options: InitOptions): InitPlan {
  const { cwd } = options;
  const detected = detectFramework(cwd, options.framework);
  const { framework, mcpVersion } = detected;

  const read = (path: string): string | undefined =>
    existsSync(join(cwd, path)) ? readFileSync(join(cwd, path), "utf8") : undefined;

  const write = (path: string, next: (existing: string | undefined) => string): InitWrite => {
    const existing = read(path);
    const content = next(existing);
    const status = existing === undefined ? "created" : existing === content ? "unchanged" : "updated";
    return { path, status, content };
  };
  // A file that is ours whole: a re-run replaces it rather than merging, and
  // says "replaced", so whoever edited it isn't told it was merely updated.
  const own = (path: string, content: string): InitWrite => {
    const planned = write(path, () => content);
    return planned.status === "updated" ? { ...planned, status: "replaced" } : planned;
  };

  const writes = [
    write("AGENTS.md", (existing) => withManagedBlock(existing, rulesMarkdown(framework))),
    // Claude Code reads CLAUDE.md rather than AGENTS.md; this imports it.
    write("CLAUDE.md", (existing) => withManagedBlock(existing, "@AGENTS.md")),
    // Building from a Figma link with Figma's own MCP.
    own(".claude/skills/ui-organized-figma/SKILL.md", figmaSkillMarkdown(LIBRARIES[framework], framework)),
    write(".mcp.json", (existing) => withMcpServer(".mcp.json", existing, framework, mcpVersion)),
  ];

  if (options.cursor || existsSync(join(cwd, ".cursor"))) {
    writes.push(
      write(".cursor/mcp.json", (existing) => withMcpServer(".cursor/mcp.json", existing, framework, mcpVersion)),
      own(
        ".cursor/rules/ui-organized.mdc",
        `---\ndescription: UI Organized design system rules\nalwaysApply: true\n---\n\n${rulesMarkdown(framework)}`,
      ),
      // Agent-requested: Cursor pulls it in when a Figma link comes up.
      own(".cursor/rules/ui-organized-figma.mdc", cursorFigmaRule(framework)),
    );
  }
  return { ...detected, writes };
}

/** The Figma skill as a Cursor rule: same body, Cursor's frontmatter. */
function cursorFigmaRule(framework: Framework): string {
  const body = figmaSkillMarkdown(LIBRARIES[framework], framework).replace(/^---[\s\S]*?---\n/, "");
  return (
    "---\ndescription: Build a Figma design or component with the UI Organized library — use for any figma.com link\n" +
    `alwaysApply: false\n---\n${body}`
  );
}

export function commitInit(cwd: string, writes: InitWrite[]): void {
  for (const { path, status, content } of writes) {
    if (status === "unchanged") continue;
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), content);
  }
}
