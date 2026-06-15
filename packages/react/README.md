# @ui-organized/react

React component library for the **ui-organized** design system, built on
[Base UI](https://base-ui.com/) and themed entirely through design tokens
(CSS custom properties from [`@ui-organized/tokens`](https://www.npmjs.com/package/@ui-organized/tokens)).

## Install

```sh
npm install @ui-organized/react
```

`react` and `react-dom` (>=18) are peer dependencies. Icon libraries are
**optional** peers — install whichever set you use:

```sh
npm install lucide-react        # or @tabler/icons-react, or @heroicons/react
```

## Usage

```tsx
import { Button } from "@ui-organized/react";
import "@ui-organized/react/styles";        // component styles
import "@ui-organized/tokens/variables.css"; // theme tokens (or generate your own)

export function Example() {
  return <Button intent="primary">Save</Button>;
}
```

Theming is done by overriding the design-token CSS variables — see
[`@ui-organized/tokens`](https://www.npmjs.com/package/@ui-organized/tokens)
and [`@ui-organized/react-vite`](https://www.npmjs.com/package/@ui-organized/react-vite)
for generating tokens from a theme config.

## License

Apache-2.0
