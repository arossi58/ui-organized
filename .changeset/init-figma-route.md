---
"@ui-organized/cli": patch
---

The agent rules and the `ui-organized-figma` skill that `uiorg init` writes now point Figma links at Figma's own MCP server first. They used to send agents to `get_figma_frame` first, which can't match components or variables until the library's components are linked to Figma, and the skill wrongly said it returned them "already resolved". Re-run `uiorg init` to update the files.
