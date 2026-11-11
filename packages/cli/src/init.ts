import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { figmaSkillMarkdown, projectRules } from "@ui-organized/code-connect/rules";
import { workspacePackages } from "./project.js";

/**
 * `uiorg init` — point a project's AI agents at the design system.
 *
 * Writes the agent rules and the MCP config. Everything it touches may already
 * hold the user's own content, so rules go in a marked block that a re-run replaces
 * and MCP config is merged one key at a time. Nothing is written until every file
 * has been read successfully: a half-applied init is harder to undo than none.
 */

const START = "<!-- ui-organized:start -->";
const END = "<!-- ui-organized:end -->";

/** The four libraries, and the package each is installed as. */
export const LIBRARIES = {
  react: "@ui-organized/react",
  svelte: "@ui-organized/svelte",
  vue: "@ui-organized/vue",
  angular: "@ui-organized/angular",
} as const;
export type Framework = keyof typeof LIBRARIES;

const LABELS: Record<Framework, string> = { react: "React", svelte: "Svelte", vue: "Vue", angular: "Angular" };

/** The first library release with a matching `@ui-organized/mcp`; before it the server versioned on its own. */
const FIRST_MCP_MAJOR = 6;

/**
 * The MCP entry for a project. The server releases with the libraries and ships
 * their data, so it is pinned to the version installed: unpinned, npx serves the
 * newest, which can describe props the project doesn't have yet. Re-running init
 * after an upgrade moves the pin. React needs no flag; the others tell the server
 * which library to answer for.
 */
export function mcpServerFor(framework: Framework, version: string): { command: string; args: string[] } {
  return {
    command: "npx",
    args: ["-y", `@ui-organized/mcp@${version}`, ...(framework === "react" ? [] : ["--framework", framework])],
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
  status: "created" | "updated" | "unchanged";
  content: string;
}

export class InitError extends Error {}

export function rulesMarkdown(framework: Framework = "react"): string {
  const rules = projectRules(LIBRARIES[framework], framework).map((rule, i) => `${i + 1}. ${rule}`);
  const title = framework === "react" ? "UI Organized design system" : `UI Organized design system (${LABELS[framework]})`;
  return `## ${title}\n\n${rules.join("\n")}\n`;
}

/** Inserts or replaces the marked block, leaving everything around it alone. */
export function withManagedBlock(existing: string | undefined, block: string): string {
  const managed = `${START}\n${block.trimEnd()}\n${END}\n`;
  if (!existing) return managed;
  const from = existing.indexOf(START);
  const to = existing.indexOf(END);
  if (from >= 0 && to > from) {
    return existing.slice(0, from) + managed.trimEnd() + existing.slice(to + END.length);
  }
  return `${existing.trimEnd()}\n\n${managed}`;
}

/** Adds our server, keeping other servers and top-level keys in place. */
export function withMcpServer(
  path: string,
  existing: string | undefined,
  framework: Framework,
  version: string,
): string {
  let config: Record<string, unknown> = {};
  if (existing) {
    try {
      config = JSON.parse(existing) as Record<string, unknown>;
    } catch {
      throw new InitError(`${path} isn't valid JSON, so it can't be merged safely. Fix it and re-run.`);
    }
  }
  const servers = (config.mcpServers ?? {}) as Record<string, unknown>;
  return `${JSON.stringify({ ...config, mcpServers: { ...servers, "ui-organized": mcpServerFor(framework, version) } }, null, 2)}\n`;
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
  /** The library version — a range when nothing is installed yet. The MCP server is pinned to it. */
  version: string;
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
  for (const fw of Object.keys(LIBRARIES) as Framework[]) {
    const dirs = [...deps].filter(([, d]) => d[LIBRARIES[fw]]).map(([dir]) => dir);
    if (dirs.length) users.set(fw, dirs);
  }
  const installed = [...users.keys()];
  const where = deps.size > 1 ? `package.json or its ${deps.size - 1} workspace packages` : "package.json";
  const detected = (framework: Framework): Detected => {
    const packages = users.get(framework)!;
    return { framework, packages, version: libraryVersion(cwd, LIBRARIES[framework], packages, deps) };
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
      `${name} ${version} is older than the MCP server, which starts at ${FIRST_MCP_MAJOR}.0.0. ` +
        `Upgrade to ${FIRST_MCP_MAJOR} or later, then re-run.`,
    );
  }
  return version;
}

export interface InitPlan extends Detected {
  writes: InitWrite[];
}

export function planInit(options: InitOptions): InitPlan {
  const { cwd } = options;
  const detected = detectFramework(cwd, options.framework);
  const { framework, version } = detected;

  const read = (path: string): string | undefined =>
    existsSync(join(cwd, path)) ? readFileSync(join(cwd, path), "utf8") : undefined;

  const write = (path: string, next: (existing: string | undefined) => string): InitWrite => {
    const existing = read(path);
    const content = next(existing);
    const status = existing === undefined ? "created" : existing === content ? "unchanged" : "updated";
    return { path, status, content };
  };

  const writes = [
    write("AGENTS.md", (existing) => withManagedBlock(existing, rulesMarkdown(framework))),
    // Claude Code reads CLAUDE.md rather than AGENTS.md; this imports it.
    write("CLAUDE.md", (existing) => withManagedBlock(existing, "@AGENTS.md")),
    // Building from a Figma link with Figma's own MCP. The file is ours whole,
    // so a re-run replaces it rather than merging.
    write(".claude/skills/ui-organized-figma/SKILL.md", () => figmaSkillMarkdown(LIBRARIES[framework], framework)),
    write(".mcp.json", (existing) => withMcpServer(".mcp.json", existing, framework, version)),
  ];

  if (options.cursor || existsSync(join(cwd, ".cursor"))) {
    writes.push(
      write(".cursor/mcp.json", (existing) => withMcpServer(".cursor/mcp.json", existing, framework, version)),
      write(
        ".cursor/rules/ui-organized.mdc",
        () => `---\ndescription: UI Organized design system rules\nalwaysApply: true\n---\n\n${rulesMarkdown(framework)}`,
      ),
      // Agent-requested: Cursor pulls it in when a Figma link comes up.
      write(".cursor/rules/ui-organized-figma.mdc", () => cursorFigmaRule(framework)),
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
