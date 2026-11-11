# @ui-organized/mcp

Gives AI coding agents the real components and design tokens of
[UI Organized](https://uiorganized.com), so generated code uses what exists instead
of inventing it. Covers React, Svelte, Vue and Angular, each from its own source.

## Set up

The quickest way is to let the CLI write the config and agent rules:

```sh
npx @ui-organized/cli init
```

Or add the server to your agent's MCP config yourself:

```json
{
  "mcpServers": {
    "ui-organized": {
      "command": "npx",
      "args": ["-y", "@ui-organized/mcp"]
    }
  }
}
```

## Tools

| Tool | What it does |
| --- | --- |
| `search_components` | Finds components by name or path |
| `get_component` | The full spec for one component: import, every prop and its allowed values, usage rules, examples |
| `search_tokens` | Finds design tokens by purpose, such as "padding" or "error text" |
| `get_token` | Checks one token name and rejects any that don't exist |
| `get_figma_frame` | Turns a Figma frame into compact code (JSX, or a Svelte, Vue or Angular template) using real components and tokens |
| `resolve_figma_components` | Turns Figma component keys and property values into imports and markup |

When something doesn't exist, the tools return `found: false` with real alternatives.

The data ships inside the package, so answers match the version you installed. Pin
the version to match your UI Organized library. Only `get_figma_frame` uses the
network or a key.

## Svelte, Vue and Angular

The server answers for one library, set with `--framework` (or the
`UI_ORGANIZED_FRAMEWORK` environment variable); React is the default. `uiorg init`
sets it for you:

```json
{ "command": "npx", "args": ["-y", "@ui-organized/mcp", "--framework", "vue"] }
```

Every answer then describes that library: its own props, scanned from its source
(Vue's `modelValue`, Svelte's snippets, Angular's selectors and inputs), its own
imports and its own markup. A component the library doesn't ship returns
`found: false` with the ones it does — never the React one. Each tool also takes a
`framework` argument to ask about another library.

## Figma

`get_figma_frame` needs a Figma personal access token that can read your file. Set
it in your shell as `FIGMA_TOKEN` rather than in the MCP config, which is often
committed. The token is only sent to Figma.

Anything without a verified code equivalent comes back in `unmapped` or `unbound`
and isn't approximated: detached instances, unpublished components, and values not
bound to a variable.
