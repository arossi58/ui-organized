import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "../../icons/registry.js";
export type { IconComponent };
export interface IconProps {
    /**
     * Either a canonical icon name from the design system's set, or a library
     * icon component supplied directly.
     */
    name: CanonicalIconName | IconComponent;
    /**
     * Icon size in pixels. Applied to both width and height.
     * @default 24
     */
    size?: number;
    /**
     * Accessible label for meaningful (non-decorative) icons.
     * When omitted the icon is treated as decorative and hidden from assistive tech.
     */
    label?: string;
    /** Additional CSS class applied to the outer wrapper span. */
    class?: string;
}
//# sourceMappingURL=Icon.types.d.ts.map