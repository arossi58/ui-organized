import { cva, type VariantProps } from "class-variance-authority";

export const treeViewStyles = cva("tree-view", {
  variants: {
    size: {
      sm: "tree-view--sm",
      md: "tree-view--md",
      lg: "tree-view--lg",
    },
    variant: {
      default: "tree-view--default",
      bordered: "tree-view--bordered",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type TreeViewVariants = VariantProps<typeof treeViewStyles>;
