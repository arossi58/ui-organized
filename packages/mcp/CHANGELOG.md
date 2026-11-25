# @ui-organized/mcp

## 6.2.0

### Minor Changes

- 638e77c: Specs from `get_component` now spell out the types their props name, so an agent no longer has to guess them:
  - After the props table, each named type the table uses is written out: "`SelectOption` is `{ value: string; label: string; disabled?: boolean }`". This covers option and item types (Select, Combobox, Listbox, RadioGroup, Tabs, Accordion, Breadcrumb, Steps, Tour, TreeView and more) and the data table's config, filter and action types. Each library's spec uses that library's own declaration, so Svelte's `TabItem` takes snippets and Angular's `TreeViewNode` is read from the Angular source.
  - React props typed with a named union now list its values, as Svelte and Vue already did. Tooltip's `side` reads `"top" | "right" | "bottom" | "left"`, not `TooltipSide`. The same applies to the `side` and `align` props of Menu, Popover and HoverCard, Chip's segment `part`, and props typed from a style recipe (Sheet's `side` and `size`, AlertDialog's and Toggle's `size`, in Svelte and Vue too).
  - React specs list `render` on Button and on the overlay triggers and closes that accept it, so they say how to render a Button as a link.
  - Prop notes no longer stop at "e.g.". Meter's `format`, for example, used to read "Options to format the displayed value (e.g.".
  - The Angular conventions line names every element a directive accepts. UioButton goes on `<button uioButton>` or `<a uioButton>`.

### Patch Changes

- ed4dc70: `get_figma_frame` no longer sends agents down a dead end. None of the library's components are linked to Figma yet, so it used to return every component in a frame as unmapped and every variable as unnamed. It now answers `found: false` straight away, before looking for a `FIGMA_TOKEN` or calling Figma, and says what works instead: read the frame with Figma's own MCP server (`get_design_context`), then call `get_component` for each component and `get_token` for each Figma variable name. The server's instructions and the tool descriptions say the same.

  Specs from `get_component` for Svelte, Vue and Angular are written for that library:
  - The "All components" line links the library's own index (`llms-vue.txt`, not `llms.txt`) and counts 67 components, not the 174 manifest entries it counted before. React specs get the corrected count too.
  - The once-per-app imports use `/styles.css` and `-table/styles.css`. The bare `/styles` subpath has no type declarations, so `svelte-check` and `vue-tsc` reject it under TypeScript 6.
  - Usage guidance no longer uses React syntax. Button's "pass one to `render`" and Skeleton's `animated={false}` are reworded for every library.
  - The `icon` hint uses the library's own binding syntax (`:icon="…"` in Vue, a name string in Angular). Its example names, Lucide's `circle-alert` and Tabler's `alert-circle`, exist in every library's adapters. Heroicons, which has no Svelte adapter, is no longer mentioned.
  - Cross-references use the library's own names. An Angular spec now says "Use `UioSwitch` or `UioToggle` instead", not `Switch` and `Toggle`.

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
