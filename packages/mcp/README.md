# @ui-organized/mcp

Gives AI coding agents the real components and design tokens of
[UI Organized](https://uiorganized.com), so generated code uses what exists instead
of inventing it. React only for now.

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
| `get_figma_frame` | Turns a Figma frame into compact JSX using real components and tokens |
| `resolve_figma_components` | Turns Figma component keys and property values into imports and JSX |

When something doesn't exist, the tools return `found: false` with real alternatives.

The data ships inside the package, so answers match the version you installed. Pin
the version to match your `@ui-organized/react`. Only `get_figma_frame` uses the
network or a key.

## Figma

`get_figma_frame` needs a Figma personal access token that can read your file. Set
it in your shell as `FIGMA_TOKEN` rather than in the MCP config, which is often
committed. The token is only sent to Figma.

Anything without a verified code equivalent comes back in `unmapped` or `unbound`
and isn't approximated: detached instances, unpublished components, and values not
bound to a variable.
