---
"@ui-organized/mcp": patch
---

Specs from `get_component` now spell out the types their props name, so an agent no longer has to guess them:

- After the props table, each named type the table uses is written out: "`SelectOption` is `{ value: string; label: string; disabled?: boolean }`". This covers option and item types (Select, Combobox, Listbox, RadioGroup, Tabs, Accordion, Breadcrumb, Steps, Tour, TreeView and more) and the data table's config, filter and action types. Each library's spec uses that library's own declaration, so Svelte's `TabItem` takes snippets and Angular's `TreeViewNode` is read from the Angular source.
- React props typed with a named union now list its values, as Svelte and Vue already did. Tooltip's `side` reads `"top" | "right" | "bottom" | "left"`, not `TooltipSide`. The same applies to the `side` and `align` props of Menu, Popover and HoverCard, Chip's segment `part`, and props typed from a style recipe (Sheet's `side` and `size`, AlertDialog's and Toggle's `size`, in Svelte and Vue too).
- React specs list `render` on Button and on the overlay triggers and closes that accept it, so they say how to render a Button as a link.
- Prop notes no longer stop at "e.g.". Meter's `format`, for example, used to read "Options to format the displayed value (e.g.".
- The Angular conventions line names every element a directive accepts. UioButton goes on `<button uioButton>` or `<a uioButton>`.
