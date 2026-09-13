import { cva, type VariantProps } from "class-variance-authority";

export const toastStyles = cva("toast__root", {
  variants: {
    status: {
      info:    "toast__root--info",
      success: "toast__root--success",
      warning: "toast__root--warning",
      error:   "toast__root--error",
    },
  },
  defaultVariants: {
    status: "info",
  },
});

export type ToastVariants = VariantProps<typeof toastStyles>;
