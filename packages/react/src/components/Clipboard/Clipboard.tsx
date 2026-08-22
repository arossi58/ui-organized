import { Clipboard as ArkClipboard } from "@ark-ui/react";
import { clsx } from "clsx";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/Icon.js";
import { CONTROL_ICON_SIZE, type ControlSize } from "../controlSize.js";
import { clipboardStyles } from "./Clipboard.styles.js";
import type { ClipboardProps } from "./Clipboard.types.js";
import "@ui-organized/core/components/Clipboard/Clipboard.css";

export function Clipboard({
  value,
  label,
  helperText,
  variant = "input",
  size = "md",
  copyLabel = "Copy",
  copiedLabel = "Copied",
  timeout,
  onStatusChange,
  className,
}: ClipboardProps) {
  const iconSize = CONTROL_ICON_SIZE[size as ControlSize];

  /* The trigger swaps both its icon and its label on copy. `Indicator` renders
     its `copied` prop in the copied state and its own children otherwise, so
     the swap costs no local state. The icon goes through an Indicator rather
     than the Button's `icon` prop because only the Indicator knows the state. */
  const trigger = (
    <ArkClipboard.Trigger asChild>
      <Button intent="secondary" size={size} type="button">
        <ArkClipboard.Indicator
          className="clipboard__indicator"
          copied={<Icon name="check" size={iconSize} />}
        >
          <Icon name="copy" size={iconSize} />
        </ArkClipboard.Indicator>
        <ArkClipboard.Indicator copied={copiedLabel}>{copyLabel}</ArkClipboard.Indicator>
      </Button>
    </ArkClipboard.Trigger>
  );

  return (
    <ArkClipboard.Root
      className={clsx(clipboardStyles({ size, variant }), className)}
      value={value}
      timeout={timeout}
      onStatusChange={onStatusChange && ((details) => onStatusChange(details.copied))}
    >
      {label && <ArkClipboard.Label className="field__label">{label}</ArkClipboard.Label>}
      <ArkClipboard.Control className="clipboard__control">
        {variant === "input" && <ArkClipboard.Input className="clipboard__input" />}
        {trigger}
      </ArkClipboard.Control>
      {helperText && <span className="field__description">{helperText}</span>}
    </ArkClipboard.Root>
  );
}
