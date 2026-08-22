import type { HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
interface CardPartProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
    class?: string;
    children?: Snippet;
}
export interface CardProps extends CardPartProps {
    /** Visual style variant. Defaults to 'default'. */
    variant?: "default" | "elevated";
    /** Padding size. Defaults to 'md'. */
    padding?: "none" | "sm" | "md" | "lg";
}
export type CardHeaderProps = CardPartProps;
export type CardBodyProps = CardPartProps;
export type CardFooterProps = CardPartProps;
export {};
//# sourceMappingURL=Card.types.d.ts.map