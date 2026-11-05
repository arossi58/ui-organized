import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/index.js";
import { rulesMarkdown, withManagedBlock, withMcpServer } from "../src/init.js";

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
    const merged = JSON.parse(withMcpServer("x", `{"a":1,"mcpServers":{"other":{"command":"o"}}}`));
    expect(merged.a).toBe(1);
    expect(Object.keys(merged.mcpServers)).toEqual(["other", "ui-organized"]);
  });

  it("refuses to merge invalid JSON", () => {
    expect(() => withMcpServer(".mcp.json", "{nope")).toThrow(/isn't valid JSON/);
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
  const pkg = (deps: Record<string, string>) =>
    writeFileSync(join(cwd, "package.json"), JSON.stringify({ dependencies: deps }));

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
    pkg({ "@ui-organized/react": "^5.0.0" });
    expect(await run(["init", "--cwd", cwd])).toBe(0);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toContain("@ui-organized/react");
    expect(readFileSync(join(cwd, "CLAUDE.md"), "utf8")).toContain("@AGENTS.md");
    expect(JSON.parse(readFileSync(join(cwd, ".mcp.json"), "utf8")).mcpServers["ui-organized"].args).toContain(
      "@ui-organized/mcp",
    );
    expect(existsSync(join(cwd, ".cursor"))).toBe(false);
  });

  it("is idempotent", async () => {
    pkg({ "@ui-organized/react": "^5.0.0" });
    await run(["init", "--cwd", cwd]);
    const first = readFileSync(join(cwd, "AGENTS.md"), "utf8");
    await run(["init", "--cwd", cwd]);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toBe(first);
  });

  it("writes Cursor's files when the project uses Cursor", async () => {
    pkg({ "@ui-organized/react": "^5.0.0" });
    mkdirSync(join(cwd, ".cursor"));
    await run(["init", "--cwd", cwd]);
    expect(existsSync(join(cwd, ".cursor/mcp.json"))).toBe(true);
    expect(readFileSync(join(cwd, ".cursor/rules/ui-organized.mdc"), "utf8")).toContain("alwaysApply: true");
  });

  it("writes nothing with --check", async () => {
    pkg({ "@ui-organized/react": "^5.0.0" });
    expect(await run(["init", "--check", "--cwd", cwd])).toBe(0);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
  });

  it.each([["@ui-organized/vue"], ["@ui-organized/svelte"], ["@ui-organized/angular"]])(
    "refuses %s rather than teach its agent React",
    async (name) => {
      pkg({ [name]: "^1.0.0" });
      expect(await run(["init", "--cwd", cwd])).toBe(1);
      expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
    },
  );

  it("refuses a project without the library", async () => {
    pkg({});
    expect(await run(["init", "--cwd", cwd])).toBe(1);
  });

  it("writes nothing if any file can't be merged", async () => {
    pkg({ "@ui-organized/react": "^5.0.0" });
    writeFileSync(join(cwd, ".mcp.json"), "{nope");
    expect(await run(["init", "--cwd", cwd])).toBe(1);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
  });
});
