import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { projectRules } from "@ui-organized/code-connect/rules";

/**
 * `uiorg init` — point a project's AI agents at the design system.
 *
 * Writes the agent rules and the MCP config. Everything it touches may already
 * hold the user's own content, so rules go in a marked block that a re-run replaces
 * and MCP config is merged one key at a time. Nothing is written until every file
 * has been read successfully: a half-applied init is harder to undo than none.
 */

const PACKAGE = "@ui-organized/react";
const START = "<!-- ui-organized:start -->";
const END = "<!-- ui-organized:end -->";
const MCP_SERVER = { command: "npx", args: ["-y", "@ui-organized/mcp"] };

/** Libraries the specs and MCP server don't describe yet. */
const UNSUPPORTED = ["@ui-organized/svelte", "@ui-organized/vue", "@ui-organized/angular"];

export interface InitOptions {
  cwd: string;
  check: boolean;
  /** Write Cursor's files even without a `.cursor/` directory. */
  cursor: boolean;
}

export interface InitWrite {
  path: string;
  status: "created" | "updated" | "unchanged";
  content: string;
}

export class InitError extends Error {}

export function rulesMarkdown(): string {
  const rules = projectRules(PACKAGE).map((rule, i) => `${i + 1}. ${rule}`);
  return `## UI Organized design system\n\n${rules.join("\n")}\n`;
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
export function withMcpServer(path: string, existing: string | undefined): string {
  let config: Record<string, unknown> = {};
  if (existing) {
    try {
      config = JSON.parse(existing) as Record<string, unknown>;
    } catch {
      throw new InitError(`${path} isn't valid JSON, so it can't be merged safely. Fix it and re-run.`);
    }
  }
  const servers = (config.mcpServers ?? {}) as Record<string, unknown>;
  return `${JSON.stringify({ ...config, mcpServers: { ...servers, "ui-organized": MCP_SERVER } }, null, 2)}\n`;
}

/** Throws unless this project uses a library the AI surface covers. */
function assertSupported(cwd: string): void {
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
  if (deps[PACKAGE]) return;

  const other = UNSUPPORTED.find((name) => deps[name]);
  if (other) {
    throw new InitError(
      `${other} isn't covered yet: the rules and MCP server describe ${PACKAGE} only, and would have ` +
        `your agent write React code. Nothing was written.`,
    );
  }
  throw new InitError(`${PACKAGE} isn't in package.json. Install it first, so the rules describe something real.`);
}

export function planInit(options: InitOptions): InitWrite[] {
  const { cwd } = options;
  assertSupported(cwd);

  const read = (path: string): string | undefined =>
    existsSync(join(cwd, path)) ? readFileSync(join(cwd, path), "utf8") : undefined;

  const write = (path: string, next: (existing: string | undefined) => string): InitWrite => {
    const existing = read(path);
    const content = next(existing);
    const status = existing === undefined ? "created" : existing === content ? "unchanged" : "updated";
    return { path, status, content };
  };

  const writes = [
    write("AGENTS.md", (existing) => withManagedBlock(existing, rulesMarkdown())),
    // Claude Code reads CLAUDE.md rather than AGENTS.md; this imports it.
    write("CLAUDE.md", (existing) => withManagedBlock(existing, "@AGENTS.md")),
    write(".mcp.json", (existing) => withMcpServer(".mcp.json", existing)),
  ];

  if (options.cursor || existsSync(join(cwd, ".cursor"))) {
    writes.push(
      write(".cursor/mcp.json", (existing) => withMcpServer(".cursor/mcp.json", existing)),
      write(
        ".cursor/rules/ui-organized.mdc",
        () => `---\ndescription: UI Organized design system rules\nalwaysApply: true\n---\n\n${rulesMarkdown()}`,
      ),
    );
  }
  return writes;
}

export function commitInit(cwd: string, writes: InitWrite[]): void {
  for (const { path, status, content } of writes) {
    if (status === "unchanged") continue;
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), content);
  }
}
