import { cva, type VariantProps } from "class-variance-authority";

export const navItemStyles = cva("nav-item__trigger", {
  variants: {
    selected: {
      true:  "nav-item__trigger--selected",
      false: "",
    },
    expandable: {
      true:  "nav-item__trigger--expandable",
      false: "",
    },
  },
  defaultVariants: {
    selected:   false,
    expandable: false,
  },
});

export const navSubItemStyles = cva("nav-sub-item", {
  variants: {
    selected: {
      true:  "nav-sub-item--selected",
      false: "",
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export type NavItemVariants = VariantProps<typeof navItemStyles>;
export type NavSubItemVariants = VariantProps<typeof navSubItemStyles>;
