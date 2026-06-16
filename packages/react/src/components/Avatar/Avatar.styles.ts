import { cva, type VariantProps } from "class-variance-authority";

export const avatarStyles = cva("avatar", {
  variants: {
    size: {
      xs: "avatar--xs",
      sm: "avatar--sm",
      md: "avatar--md",
      lg: "avatar--lg",
      xl: "avatar--xl",
    },
    shape: {
      circle:  "avatar--circle",
      rounded: "avatar--rounded",
      square:  "avatar--square",
    },
  },
  defaultVariants: {
    size:  "md",
    shape: "circle",
  },
});

export type AvatarVariants = VariantProps<typeof avatarStyles>;
