---
"@ui-organized/cli": minor
---

`uiorg init` now works at the root of a monorepo. It reads the workspace packages listed in `pnpm-workspace.yaml` or package.json `workspaces` as well as the root package.json, so a project whose library is declared in `apps/web` or `packages/editor` no longer has to be set up from a stand-in. The files are still written at the root, where your agent starts.

It also pins `@ui-organized/mcp` to the version of the library you have installed, such as `@ui-organized/mcp@6.0.0`. Without a pin, npx ran the newest server, which can describe props your version doesn't have. Re-running init after an upgrade moves the pin. It refuses, and writes nothing, when it can't read a usable version, when workspace packages are on different versions, or when the library is older than 6.0.0, the first release with a matching server.
