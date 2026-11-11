# @ui-organized/mcp

## 0.1.0

### Minor Changes

- 688d510: Add `uiorg init`, which sets up a project's AI agents with the design system's rules and MCP server, and publish `@ui-organized/mcp`, which serves component specs and design tokens to agents.

  Both cover all four libraries. `init` detects whether the project uses React, Svelte, Vue or Angular (or takes `--framework`) and writes that library's rules; the MCP server answers for that library (`--framework`), with props scanned from its own source, its own imports and markup, and Figma frames rendered as its own templates.

  To build from a Figma link, `init` also installs a `ui-organized-figma` skill for Claude Code (and a matching rule for Cursor). It works with this server's own Figma reader when `FIGMA_TOKEN` is set, and with Figma's own MCP server when it isn't. `get_token` accepts Figma variable names as they appear in a design, such as `spacing/space-02` or `var(--spacing\/space-02,8px)`, and returns the real token.
