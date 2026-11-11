import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { figmaSkillMarkdown, projectRules } from "@ui-organized/code-connect/rules";

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

/**
 * The MCP entry for a project. React's stays exactly as it always was, so
 * re-running init in an existing React project changes nothing; the others tell
 * the server which library to answer for.
 */
export function mcpServerFor(framework: Framework): { command: string; args: string[] } {
  return {
    command: "npx",
    args: ["-y", "@ui-organized/mcp", ...(framework === "react" ? [] : ["--framework", framework])],
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
  framework: Framework = "react",
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
  return `${JSON.stringify({ ...config, mcpServers: { ...servers, "ui-organized": mcpServerFor(framework) } }, null, 2)}\n`;
}

/**
 * Which UI Organized library this project uses, from its package.json. One
 * installed library is used as-is; several need `--framework` to pick, because
 * guessing would have the agent write the wrong library's code.
 */
export function detectFramework(cwd: string, requested?: string): Framework {
  const manifest = join(cwd, "package.json");
  if (!existsSync(manifest)) {
    throw new InitError(`No package.json in ${cwd}. Run this in your project, or pass --cwd.`);
  }
  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  try {
    pkg = JSON.parse(readFileSync(manifest, "utf8")) as typeof pkg;
  } catch {
    throw new InitError(`${manifest} isn't valid JSON.`);
  }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const installed = (Object.keys(LIBRARIES) as Framework[]).filter((fw) => deps[LIBRARIES[fw]]);

  if (requested !== undefined) {
    if (!(requested in LIBRARIES)) {
      throw new InitError(`Unknown --framework "${requested}". Use one of: ${Object.keys(LIBRARIES).join(", ")}.`);
    }
    const fw = requested as Framework;
    if (!installed.includes(fw)) {
      throw new InitError(`${LIBRARIES[fw]} isn't in package.json. Install it first, so the rules describe something real.`);
    }
    return fw;
  }
  if (installed.length === 1) return installed[0]!;
  if (installed.length > 1) {
    throw new InitError(
      `This project installs ${installed.map((fw) => LIBRARIES[fw]).join(" and ")}. ` +
        `Pass --framework ${installed.join("|")} to choose which one your agent should use. Nothing was written.`,
    );
  }
  throw new InitError(
    `No UI Organized library in package.json. Install ${Object.values(LIBRARIES).join(", ")} first, so the rules describe something real.`,
  );
}

export function planInit(options: InitOptions): InitWrite[] {
  const { cwd } = options;
  const framework = detectFramework(cwd, options.framework);

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
    write(".mcp.json", (existing) => withMcpServer(".mcp.json", existing, framework)),
  ];

  if (options.cursor || existsSync(join(cwd, ".cursor"))) {
    writes.push(
      write(".cursor/mcp.json", (existing) => withMcpServer(".cursor/mcp.json", existing, framework)),
      write(
        ".cursor/rules/ui-organized.mdc",
        () => `---\ndescription: UI Organized design system rules\nalwaysApply: true\n---\n\n${rulesMarkdown(framework)}`,
      ),
      // Agent-requested: Cursor pulls it in when a Figma link comes up.
      write(".cursor/rules/ui-organized-figma.mdc", () => cursorFigmaRule(framework)),
    );
  }
  return writes;
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
