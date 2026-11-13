# @ui-organized/mcp

## 6.1.0

### Patch Changes

- The server knows about `TableReorderToggle` and `TableSelectionFooter`, and reports `DataTable`'s `reorderable` as `ReorderSetting` rather than `boolean`. Ten components removed before 6.0.0 (`Badge`, `Separator`, `TableFilter`, `TableFilterBar`, two `Arrow` parts and four `Toolbar` parts) are no longer listed as deprecated; asking for one now returns not found.

## 6.0.0

Never published. The version was set by hand rather than by `changeset version`, which then moved the whole group on to 6.1.0. For a 6.0.x library, use `@ui-organized/mcp@0.1.0`: it was built from 6.0.0 and carries the same data. `uiorg init` pins it for you.

### Major Changes

- The server now releases with the UI Organized libraries and shares their version: `@ui-organized/mcp@6.0.0` describes `@ui-organized/react`, `svelte`, `vue` and `angular` 6.0.0. Its data is the same as 0.1.0's, which was built from 6.0.0 too. Pin it to your library's version; `uiorg init` does this for you, and re-running it after an upgrade moves the pin.

## 0.1.0

### Minor Changes

- 688d510: Add `uiorg init`, which sets up a project's AI agents with the design system's rules and MCP server, and publish `@ui-organized/mcp`, which serves component specs and design tokens to agents.

  Both cover all four libraries. `init` detects whether the project uses React, Svelte, Vue or Angular (or takes `--framework`) and writes that library's rules; the MCP server answers for that library (`--framework`), with props scanned from its own source, its own imports and markup, and Figma frames rendered as its own templates.

  To build from a Figma link, `init` also installs a `ui-organized-figma` skill for Claude Code (and a matching rule for Cursor). It works with this server's own Figma reader when `FIGMA_TOKEN` is set, and with Figma's own MCP server when it isn't. `get_token` accepts Figma variable names as they appear in a design, such as `spacing/space-02` or `var(--spacing\/space-02,8px)`, and returns the real token.
