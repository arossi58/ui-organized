// The public surface of @ui-organized/svelte.
//
// Component styles are NOT imported here. A Svelte library is not bundled at
// publish time — svelte-package transpiles and copies — so each component's
// `import "@ui-organized/core/components/X/X.css"` is resolved by the consumer's
// bundler, which means an app that uses three components ships three
// stylesheets. Importing them all here would undo that. Consumers who want the
// whole sheet at once take `@ui-organized/svelte/styles`.
export { Icon } from "./components/Icon/index.js";
export { default as IconProvider } from "./context/IconProvider.svelte";
export { getIconConfig, setIconConfig } from "./context/iconContext.svelte.js";
// The registry, not the sets: this entry must not reach any icon library, or the
// optional peers become mandatory again. See ./icons/registry.ts.
export { getIconSet, registeredLibraries, registerIconSet } from "./icons/registry.js";
export { Button } from "./components/Button/index.js";
export { Card, CardHeader, CardBody, CardFooter } from "./components/Card/index.js";
export { Divider } from "./components/Divider/index.js";
export { Skeleton } from "./components/Skeleton/index.js";
export { Tag } from "./components/Tag/index.js";
export { Switch } from "./components/Switch/index.js";
export { Avatar } from "./components/Avatar/index.js";
