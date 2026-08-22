import type { Snippet } from "svelte";
import { type IconConfig } from "@ui-organized/core";
import type { IconComponent } from "../icons/registry.js";
interface IconProviderProps extends Partial<IconConfig<IconComponent>> {
    children: Snippet;
}
declare const IconProvider: import("svelte").Component<IconProviderProps, {}, "">;
type IconProvider = ReturnType<typeof IconProvider>;
export default IconProvider;
//# sourceMappingURL=IconProvider.svelte.d.ts.map