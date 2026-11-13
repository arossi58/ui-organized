import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import Module from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadTokenContract, missingTokens } from "./contract.js";

// pnpm's bin shims export NODE_PATH=<workspace>/node_modules/.pnpm/node_modules,
// which makes the workspace's own core resolvable from any temp directory and
// hides which lookup found the contract. Node reads NODE_PATH once at startup,
// so re-initialise its global paths without it.
delete process.env.NODE_PATH;
(Module as unknown as { _initPaths(): void })._initPaths();

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "react-vite-contract-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

/** A package with a token-contract.json, exported the way core exports it. */
function fakePackage(at: string, name: string, tokens: string[]) {
  mkdirSync(at, { recursive: true });
  writeFileSync(
    join(at, "package.json"),
    JSON.stringify({ name, exports: { "./token-contract.json": "./token-contract.json" } }),
  );
  writeFileSync(join(at, "token-contract.json"), JSON.stringify({ tokens }));
}

describe("loadTokenContract", () => {
  it("uses the project's own @ui-organized/core when it resolves (npm, Yarn)", () => {
    fakePackage(join(dir, "node_modules/@ui-organized/core"), "@ui-organized/core", ["--from-core"]);
    const contract = loadTokenContract(dir);
    expect(contract.tokens).toEqual(["--from-core"]);
    expect(contract.source).toBe("@ui-organized/core/token-contract.json");
  });

  it("finds core next to the installed library when pnpm keeps it out of the project", () => {
    // pnpm's layout: the project sees only a symlink to the library, and core
    // sits beside the library's real directory in the store.
    const store = join(dir, "store/node_modules/@ui-organized");
    fakePackage(join(store, "core"), "@ui-organized/core", ["--via-pnpm"]);
    mkdirSync(join(store, "svelte"), { recursive: true });
    writeFileSync(join(store, "svelte/package.json"), JSON.stringify({ name: "@ui-organized/svelte" }));
    const app = join(dir, "app");
    mkdirSync(join(app, "node_modules/@ui-organized"), { recursive: true });
    symlinkSync(join(store, "svelte"), join(app, "node_modules/@ui-organized/svelte"), "dir");

    const contract = loadTokenContract(app);
    expect(contract.tokens).toEqual(["--via-pnpm"]);
    expect(contract.source).toContain("via @ui-organized/svelte");
  });

  it("reads React 5.x's own contract, which predates core", () => {
    fakePackage(join(dir, "node_modules/@ui-organized/react"), "@ui-organized/react", ["--react-5"]);
    const contract = loadTokenContract(dir);
    expect(contract.tokens).toEqual(["--react-5"]);
    expect(contract.source).toBe("@ui-organized/react/token-contract.json");
  });

  it("falls back to the contract bundled at build time", () => {
    const contract = loadTokenContract(dir);
    expect(contract.tokens).toContain("--Button-Large-vertical");
    expect(contract.source).toMatch(/bundled with @ui-organized\/react-vite/);
  });
});

describe("missingTokens", () => {
  it("lists what the declared names don't cover, in contract order", () => {
    const contract = { tokens: ["--a", "--b", "--c"], source: "test" };
    expect(missingTokens(["--b", "--extra"], contract)).toEqual(["--a", "--c"]);
  });
});
