import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/index.js";
import { mcpVersionFor, planInit, rulesMarkdown, withManagedBlock, withMcpServer } from "../src/init.js";
import { pnpmWorkspaceGlobs } from "../src/project.js";

const START = "<!-- ui-organized:start -->";
const END = "<!-- ui-organized:end -->";
const count = (text: string, marker: string) => text.split(marker).length - 1;

describe("withManagedBlock", () => {
  it("keeps the user's content and replaces only our block on a re-run", () => {
    const once = withManagedBlock("# Mine\n", "one");
    const twice = withManagedBlock(`${once}\nAfter\n`, "two");
    expect(twice).toContain("# Mine");
    expect(twice).toContain("After");
    expect(twice).toContain("two");
    expect(twice).not.toContain("one");
  });

  // An end marker deleted by hand left a start marker that the next run paired
  // with the end of the block it appended, deleting everything in between.
  it("recovers from a start marker with no end, without losing the user's text", () => {
    const orphaned = `# Mine\n\n${START}\nold rules\n\nMy own notes\n`;
    const once = withManagedBlock(orphaned, "new rules");
    const twice = withManagedBlock(once, "newer rules");
    for (const text of [once, twice]) {
      expect(text).toContain("# Mine");
      expect(text).toContain("My own notes");
      expect(count(text, START)).toBe(1);
      expect(count(text, END)).toBe(1);
    }
    expect(twice).toContain("newer rules");
    expect(twice).not.toContain("new rules\n");
  });

  it("replaces the block an end marker closes, past a stray start before it", () => {
    const text = `${START}\nstray\nKeep me\n${START}\nours\n${END}\nAfter\n`;
    const next = withManagedBlock(text, "fresh");
    expect(next).toContain("Keep me");
    expect(next).toContain("After");
    expect(next).toContain("fresh");
    expect(next).not.toContain("ours");
  });
});

describe("withMcpServer", () => {
  it("keeps other servers and keys", () => {
    const merged = JSON.parse(withMcpServer("x", `{"a":1,"mcpServers":{"other":{"command":"o"}}}`, "react", "6.1.0"));
    expect(merged.a).toBe(1);
    expect(Object.keys(merged.mcpServers)).toEqual(["other", "ui-organized"]);
  });

  it("refuses to merge invalid JSON", () => {
    expect(() => withMcpServer(".mcp.json", "{nope", "react", "6.1.0")).toThrow(/isn't valid JSON/);
  });

  // A FIGMA_TOKEN reference in our own entry's env was dropped on every re-run.
  it("keeps the user's fields on our entry while moving the pin", () => {
    // `${FIGMA_TOKEN}`, the env-reference syntax .mcp.json expands.
    const reference = "$" + "{FIGMA_TOKEN}";
    const existing = JSON.stringify({
      mcpServers: {
        "ui-organized": {
          type: "stdio",
          command: "npx",
          args: ["-y", "@ui-organized/mcp@0.1.0"],
          env: { FIGMA_TOKEN: reference },
        },
      },
    });
    const entry = JSON.parse(withMcpServer(".mcp.json", existing, "react", "6.1.0")).mcpServers["ui-organized"];
    expect(entry.env).toEqual({ FIGMA_TOKEN: reference });
    expect(entry.type).toBe("stdio");
    expect(entry.args).toEqual(["-y", "@ui-organized/mcp@6.1.0"]);
  });

  it("returns a file that already says it byte for byte, whatever its formatting", () => {
    const tabbed = `{\n\t"mcpServers": {\n\t\t"ui-organized": {\n\t\t\t"command": "npx",\n\t\t\t"args": [\n\t\t\t\t"-y",\n\t\t\t\t"@ui-organized/mcp@6.1.0"\n\t\t\t]\n\t\t}\n\t}\n}`;
    expect(withMcpServer(".mcp.json", tabbed, "react", "6.1.0")).toBe(tabbed);
  });

  it("keeps the file's indentation when it does change something", () => {
    const tabbed = `{\n\t"mcpServers": {\n\t\t"other": {\n\t\t\t"command": "o"\n\t\t}\n\t}\n}\n`;
    const next = withMcpServer(".mcp.json", tabbed, "react", "6.1.0");
    expect(next).toContain('\n\t"mcpServers": {\n\t\t"other"');
    expect(next).not.toMatch(/^ {2}"/m);
  });
});

/**
 * `@ui-organized/mcp@6.0.0` was never published: a hand-edited bump that
 * `changeset version` skipped past. 0.1.0 was built from 6.0.0 and carries its
 * data for all four libraries, so 6.0.x pins that. 6.1.0 would be wrong for
 * Angular 6.0.x, whose components lack 6.1.0's `controlled` inputs.
 */
describe("mcpVersionFor", () => {
  it.each([
    ["6.0.0", "0.1.0"],
    ["~6.0.0", "0.1.0"],
    ["6.0.3", "0.1.0"],
    // A caret range installs the newest 6.x, whose server exists.
    ["^6.0.0", "^6.0.0"],
    ["6.1.0", "6.1.0"],
    ["^6.1.0", "^6.1.0"],
    ["~6.1.2", "~6.1.2"],
    ["7.0.0", "7.0.0"],
  ])("%s → %s", (version, expected) => {
    expect(mcpVersionFor(version)).toBe(expected);
  });
});

describe("rulesMarkdown", () => {
  // An unbundled `--space-*` here would send every consumer's agent to a family
  // that doesn't exist.
  it("names the real spacing family", () => {
    expect(rulesMarkdown()).toContain("--spacing-space-");
  });
});

describe("uiorg init", () => {
  let cwd: string;
  const pkg = (deps: Record<string, string>, dir = ".", extra: Record<string, unknown> = {}) => {
    mkdirSync(join(cwd, dir), { recursive: true });
    writeFileSync(join(cwd, dir, "package.json"), JSON.stringify({ ...extra, dependencies: deps }));
  };
  const installed = (dir: string, name: string, version: string) => {
    mkdirSync(join(cwd, dir, "node_modules", name), { recursive: true });
    writeFileSync(join(cwd, dir, "node_modules", name, "package.json"), JSON.stringify({ name, version }));
  };
  const mcpArgs = (): string[] =>
    JSON.parse(readFileSync(join(cwd, ".mcp.json"), "utf8")).mcpServers["ui-organized"].args;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "uiorg-init-"));
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(cwd, { recursive: true, force: true });
  });

  it("writes rules and MCP config for a React project", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    expect(await run(["init", "--cwd", cwd])).toBe(0);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toContain("@ui-organized/react");
    expect(readFileSync(join(cwd, "CLAUDE.md"), "utf8")).toContain("@AGENTS.md");
    expect(JSON.parse(readFileSync(join(cwd, ".mcp.json"), "utf8")).mcpServers["ui-organized"].args).toContain(
      "@ui-organized/mcp@^6.0.0",
    );
    expect(existsSync(join(cwd, ".cursor"))).toBe(false);
  });

  it("is idempotent", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    await run(["init", "--cwd", cwd]);
    const first = readFileSync(join(cwd, "AGENTS.md"), "utf8");
    await run(["init", "--cwd", cwd]);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toBe(first);
  });

  it("writes Cursor's files when the project uses Cursor", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    mkdirSync(join(cwd, ".cursor"));
    await run(["init", "--cwd", cwd]);
    expect(existsSync(join(cwd, ".cursor/mcp.json"))).toBe(true);
    expect(readFileSync(join(cwd, ".cursor/rules/ui-organized.mdc"), "utf8")).toContain("alwaysApply: true");
  });

  it("installs the Figma skill for the project's library", async () => {
    pkg({ "@ui-organized/vue": "^6.0.0" });
    mkdirSync(join(cwd, ".cursor"));
    await run(["init", "--cwd", cwd]);
    const skill = readFileSync(join(cwd, ".claude/skills/ui-organized-figma/SKILL.md"), "utf8");
    expect(skill).toMatch(/^---\nname: ui-organized-figma\n/);
    expect(skill).toContain("get_design_context");
    expect(skill).toContain("@ui-organized/vue");
    const cursor = readFileSync(join(cwd, ".cursor/rules/ui-organized-figma.mdc"), "utf8");
    expect(cursor).toContain("alwaysApply: false");
    expect(cursor).not.toContain("name: ui-organized-figma");
  });

  it("writes nothing with --check", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    expect(await run(["init", "--check", "--cwd", cwd])).toBe(0);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
  });

  it.each([
    ["vue", "@ui-organized/vue"],
    ["svelte", "@ui-organized/svelte"],
    ["angular", "@ui-organized/angular"],
  ])("writes %s's own rules and MCP entry", async (framework, name) => {
    pkg({ [name]: "^6.0.0" });
    expect(await run(["init", "--cwd", cwd])).toBe(0);
    const agents = readFileSync(join(cwd, "AGENTS.md"), "utf8");
    expect(agents).toContain(`\`${name}\``);
    expect(agents).toContain(`/ai/${framework}/<Component>.md`);
    expect(agents).not.toContain("@ui-organized/react");
    expect(JSON.parse(readFileSync(join(cwd, ".mcp.json"), "utf8")).mcpServers["ui-organized"].args).toEqual([
      "-y",
      "@ui-organized/mcp@^6.0.0",
      "--framework",
      framework,
    ]);
  });

  // The server releases with the libraries and ships their data, so an unpinned
  // npx would describe whatever is newest rather than what is installed.
  it("pins the server to the installed library version, over package.json's range", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    installed(".", "@ui-organized/react", "6.2.1");
    await run(["init", "--cwd", cwd]);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@6.2.1"]);
  });

  it("moves the pin on a re-run after an upgrade", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    installed(".", "@ui-organized/react", "6.0.0");
    await run(["init", "--cwd", cwd]);
    installed(".", "@ui-organized/react", "6.1.0");
    await run(["init", "--cwd", cwd]);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@6.1.0"]);
  });

  it("pins 6.0.0 installs to the server that carries 6.0.0's data, and says so", async () => {
    const stdout = vi.mocked(process.stdout.write);
    pkg({ "@ui-organized/react": "^6.0.0" });
    installed(".", "@ui-organized/react", "6.0.0");
    expect(await run(["init", "--cwd", cwd])).toBe(0);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@0.1.0"]);
    expect(stdout.mock.calls.map(([chunk]) => String(chunk)).join("")).toContain(
      "MCP server pinned to 0.1.0 (6.0.0's data)",
    );
  });

  it.each([["~6.0.0"], ["6.0.0"]])("pins a %s range to 0.1.0 before anything is installed", async (range) => {
    pkg({ "@ui-organized/react": range });
    expect(await run(["init", "--cwd", cwd])).toBe(0);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@0.1.0"]);
  });

  it("pins Angular 6.0.0 to 0.1.0, still answering for Angular", async () => {
    pkg({ "@ui-organized/angular": "^6.0.0", "@ui-organized/react": "^6.0.0" });
    installed(".", "@ui-organized/angular", "6.0.0");
    expect(await run(["init", "--cwd", cwd, "--framework", "angular"])).toBe(0);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@0.1.0", "--framework", "angular"]);
  });

  it("refuses a library older than the first matching server", async () => {
    const stderr = vi.mocked(process.stderr.write);
    pkg({ "@ui-organized/react": "^5.4.0" });
    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
    expect(String(stderr.mock.calls.at(-1)?.[0])).toContain("the first one covers 6.0.0");
  });

  it("names --cwd when it's missing its value, rather than calling it unknown", async () => {
    const stderr = vi.mocked(process.stderr.write);
    expect(await run(["init", "--cwd"])).toBe(2);
    expect(String(stderr.mock.calls.at(-1)?.[0])).toContain("--cwd needs a value");
  });

  it("keeps a .mcp.json that already says it, byte for byte, and reports it unchanged", async () => {
    pkg({ "@ui-organized/react": "^6.1.0" });
    const tabbed = `{\n\t"mcpServers": {\n\t\t"ui-organized": {\n\t\t\t"command": "npx",\n\t\t\t"args": ["-y", "@ui-organized/mcp@^6.1.0"]\n\t\t}\n\t}\n}\n`;
    writeFileSync(join(cwd, ".mcp.json"), tabbed);
    const plan = planInit({ cwd, check: false, cursor: false });
    expect(plan.writes.find((w) => w.path === ".mcp.json")?.status).toBe("unchanged");
    await run(["init", "--cwd", cwd]);
    expect(readFileSync(join(cwd, ".mcp.json"), "utf8")).toBe(tabbed);
  });

  // The skill and the Cursor rules are ours whole, so edits to them don't
  // survive a re-run; "updated" undersold that.
  it("reports an edited skill or Cursor rule as replaced", async () => {
    pkg({ "@ui-organized/react": "^6.1.0" });
    mkdirSync(join(cwd, ".cursor"));
    await run(["init", "--cwd", cwd]);
    const skill = join(cwd, ".claude/skills/ui-organized-figma/SKILL.md");
    writeFileSync(skill, `${readFileSync(skill, "utf8")}\nMy own step.\n`);
    writeFileSync(join(cwd, ".cursor/rules/ui-organized.mdc"), "edited");

    const statuses = Object.fromEntries(
      planInit({ cwd, check: false, cursor: false }).writes.map((w) => [w.path, w.status]),
    );
    expect(statuses[".claude/skills/ui-organized-figma/SKILL.md"]).toBe("replaced");
    expect(statuses[".cursor/rules/ui-organized.mdc"]).toBe("replaced");
    expect(statuses[".cursor/rules/ui-organized-figma.mdc"]).toBe("unchanged");
    expect(statuses["AGENTS.md"]).toBe("unchanged");

    await run(["init", "--cwd", cwd]);
    expect(readFileSync(skill, "utf8")).not.toContain("My own step.");
  });

  it("refuses a version it can't read, rather than leaving the server unpinned", async () => {
    pkg({ "@ui-organized/react": "workspace:*" });
    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(existsSync(join(cwd, ".mcp.json"))).toBe(false);
  });

  it("asks which library when the project installs two, and writes nothing", async () => {
    pkg({ "@ui-organized/react": "^6.0.0", "@ui-organized/vue": "^6.0.0" });
    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
    expect(await run(["init", "--cwd", cwd, "--framework", "vue"])).toBe(0);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toContain("Vue");
  });

  it("refuses --framework for a library that isn't installed", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    expect(await run(["init", "--cwd", cwd, "--framework", "svelte"])).toBe(1);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
  });

  it("refuses a project without the library", async () => {
    pkg({});
    expect(await run(["init", "--cwd", cwd])).toBe(1);
  });

  it("writes nothing if any file can't be merged", async () => {
    pkg({ "@ui-organized/react": "^6.0.0" });
    writeFileSync(join(cwd, ".mcp.json"), "{nope");
    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
  });
});

describe("uiorg init in a monorepo", () => {
  let cwd: string;
  const write = (path: string, content: unknown) => {
    mkdirSync(join(cwd, path, ".."), { recursive: true });
    writeFileSync(join(cwd, path), typeof content === "string" ? content : JSON.stringify(content));
  };
  const installed = (dir: string, name: string, version: string) =>
    write(join(dir, "node_modules", name, "package.json"), { name, version });
  const mcpArgs = (): string[] =>
    JSON.parse(readFileSync(join(cwd, ".mcp.json"), "utf8")).mcpServers["ui-organized"].args;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "uiorg-init-mono-"));
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(cwd, { recursive: true, force: true });
  });

  // The root installs nothing; the library is declared where it's used.
  it("finds the library in pnpm workspace packages and writes at the root", async () => {
    write("package.json", { name: "root", private: true });
    write("pnpm-workspace.yaml", "packages:\n  - 'apps/*'\n  - \"packages/*\" # libraries\n");
    write("apps/studio/package.json", { dependencies: { "@ui-organized/react": "^6.0.0" } });
    write("packages/editor/package.json", { dependencies: { "@ui-organized/react": "^6.0.0" } });
    installed("apps/studio", "@ui-organized/react", "6.0.0");
    installed("packages/editor", "@ui-organized/react", "6.0.0");

    expect(await run(["init", "--cwd", cwd])).toBe(0);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toContain("@ui-organized/react");
    // 6.0.0's server is 0.1.0: see the 6.0.x tests above.
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@0.1.0"]);
    expect(existsSync(join(cwd, "apps/studio/AGENTS.md"))).toBe(false);
  });

  it("finds it through package.json workspaces, installed at the root", async () => {
    write("package.json", { name: "root", workspaces: { packages: ["apps/*"] } });
    write("apps/web/package.json", { dependencies: { "@ui-organized/vue": "^6.0.0" } });
    installed(".", "@ui-organized/vue", "6.1.0");

    expect(await run(["init", "--cwd", cwd])).toBe(0);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@6.1.0", "--framework", "vue"]);
  });

  it("ignores packages a negated glob excludes", async () => {
    write("package.json", { name: "root", workspaces: ["apps/*", "!apps/legacy"] });
    write("apps/web/package.json", { dependencies: { "@ui-organized/react": "^6.0.0" } });
    write("apps/legacy/package.json", { dependencies: { "@ui-organized/vue": "^6.0.0" } });

    expect(await run(["init", "--cwd", cwd])).toBe(0);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@^6.0.0"]);
  });

  it("asks which library when workspace packages use different ones", async () => {
    write("package.json", { name: "root", workspaces: ["apps/*"] });
    write("apps/a/package.json", { dependencies: { "@ui-organized/react": "^6.0.0" } });
    write("apps/b/package.json", { dependencies: { "@ui-organized/svelte": "^6.0.0" } });
    const stderr = vi.mocked(process.stderr.write);

    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(String(stderr.mock.calls.at(-1)?.[0])).toContain("@ui-organized/svelte (apps/b)");
    expect(await run(["init", "--cwd", cwd, "--framework", "svelte"])).toBe(0);
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@^6.0.0", "--framework", "svelte"]);
  });

  it("refuses packages on different versions, since one server describes one", async () => {
    write("package.json", { name: "root", workspaces: ["apps/*"] });
    write("apps/a/package.json", { dependencies: { "@ui-organized/react": "^6.0.0" } });
    write("apps/b/package.json", { dependencies: { "@ui-organized/react": "^6.0.0" } });
    installed("apps/a", "@ui-organized/react", "6.0.0");
    installed("apps/b", "@ui-organized/react", "6.1.0");

    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
  });
});

describe("pnpmWorkspaceGlobs", () => {
  it("reads a block list with quotes, comments and exclusions", () => {
    const yaml = [
      "packages:",
      "  - 'packages/*'",
      "  # a comment line",
      '  - "apps/**"',
      "  - '!apps/paused' # trailing comment",
      "catalog:",
      "  react: ^18.0.0",
    ].join("\n");
    expect(pnpmWorkspaceGlobs(yaml)).toEqual(["packages/*", "apps/**", "!apps/paused"]);
  });

  it("reads a flow list", () => {
    expect(pnpmWorkspaceGlobs("packages: ['a/*', \"b\"]\n")).toEqual(["a/*", "b"]);
  });
});
