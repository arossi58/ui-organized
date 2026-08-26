import { cva, type VariantProps } from "class-variance-authority";

export const skeletonStyles = cva("skeleton", {
  variants: {
    variant: {
      text:    "skeleton--text",
      circle:  "skeleton--circle",
      rect:    "skeleton--rect",
      rounded: "skeleton--rounded",
    },
    animated: {
      true:  "skeleton--animated",
      false: "",
    },
  },
  defaultVariants: {
    variant:  "text",
    animated: true,
  },
});

export type SkeletonVariants = VariantProps<typeof skeletonStyles>;
