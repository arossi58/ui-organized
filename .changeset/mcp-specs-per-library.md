---
"@ui-organized/mcp": patch
---

`get_figma_frame` no longer sends agents down a dead end. None of the library's components are linked to Figma yet, so it used to return every component in a frame as unmapped and every variable as unnamed. It now answers `found: false` straight away, before looking for a `FIGMA_TOKEN` or calling Figma, and says what works instead: read the frame with Figma's own MCP server (`get_design_context`), then call `get_component` for each component and `get_token` for each Figma variable name. The server's instructions and the tool descriptions say the same.

Specs from `get_component` for Svelte, Vue and Angular are written for that library:

- The "All components" line links the library's own index (`llms-vue.txt`, not `llms.txt`) and counts 67 components, not the 174 manifest entries it counted before. React specs get the corrected count too.
- The once-per-app imports use `/styles.css` and `-table/styles.css`. The bare `/styles` subpath has no type declarations, so `svelte-check` and `vue-tsc` reject it under TypeScript 6.
- Usage guidance no longer uses React syntax. Button's "pass one to `render`" and Skeleton's `animated={false}` are reworded for every library.
- The `icon` hint uses the library's own binding syntax (`:icon="…"` in Vue, a name string in Angular). Its example names, Lucide's `circle-alert` and Tabler's `alert-circle`, exist in every library's adapters. Heroicons, which has no Svelte adapter, is no longer mentioned.
- Cross-references use the library's own names. An Angular spec now says "Use `UioSwitch` or `UioToggle` instead", not `Switch` and `Toggle`.
