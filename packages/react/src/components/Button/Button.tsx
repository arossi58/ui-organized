import { Button as BaseButton } from "@base-ui-components/react/button";
import { clsx } from "clsx";
import { buttonStyles } from "./Button.styles.js";
import { Icon } from "../Icon/index.js";
import type { ButtonProps } from "./Button.types.js";
import "./Button.css";

// Icon size per button size
const ICON_SIZE: Record<NonNullable<ButtonProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function Button({
  intent,
  size = "md",
  icon,
  iconPosition = "left",
  className,
  children,
  ...props
}: ButtonProps) {
  const iconElement = icon ? (
    <Icon name={icon} size={ICON_SIZE[size]} />
  ) : null;

  return (
    <BaseButton
      className={clsx(buttonStyles({ intent, size }), className)}
      {...props}
    >
      {iconPosition === "left" && iconElement}
      {children}
      {iconPosition === "right" && iconElement}
    </BaseButton>
  );
}
