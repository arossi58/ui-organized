import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/index.js";
import { rulesMarkdown, withManagedBlock, withMcpServer } from "../src/init.js";
import { pnpmWorkspaceGlobs } from "../src/project.js";

describe("withManagedBlock", () => {
  it("keeps the user's content and replaces only our block on a re-run", () => {
    const once = withManagedBlock("# Mine\n", "one");
    const twice = withManagedBlock(`${once}\nAfter\n`, "two");
    expect(twice).toContain("# Mine");
    expect(twice).toContain("After");
    expect(twice).toContain("two");
    expect(twice).not.toContain("one");
  });
});

describe("withMcpServer", () => {
  it("keeps other servers and keys", () => {
    const merged = JSON.parse(withMcpServer("x", `{"a":1,"mcpServers":{"other":{"command":"o"}}}`, "react", "6.0.0"));
    expect(merged.a).toBe(1);
    expect(Object.keys(merged.mcpServers)).toEqual(["other", "ui-organized"]);
  });

  it("refuses to merge invalid JSON", () => {
    expect(() => withMcpServer(".mcp.json", "{nope", "react", "6.0.0")).toThrow(/isn't valid JSON/);
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

  it("refuses a library older than the first matching server", async () => {
    pkg({ "@ui-organized/react": "^5.4.0" });
    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
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
    expect(mcpArgs()).toEqual(["-y", "@ui-organized/mcp@6.0.0"]);
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
