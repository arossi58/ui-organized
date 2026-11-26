import { useId, type ComponentProps, type ReactNode } from "react";
import { Field, useFieldContext } from "@ark-ui/react";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, inputFieldStyles } from "@ui-organized/core";
import { FieldError } from "../FieldError/index.js";
import { Icon } from "../Icon/index.js";
import type { InputProps } from "./Input.types.js";
import "@ui-organized/core/components/Input/Input.css";
import { useFocusModality } from "../../utils/useFocusModality.js";

/** Text and numbers are a text add-on; anything else is a control in a slot. */
const isText = (node: ReactNode) => typeof node === "string" || typeof node === "number";

function Addon({ side, id, children }: { side: "start" | "end"; id: string; children: ReactNode }) {
  const text = isText(children);
  return (
    <div
      id={text ? id : undefined}
      className={clsx("field__addon", `field__addon--${side}`, !text && "field__addon--slot")}
    >
      {children}
    </div>
  );
}

/**
 * A text add-on is part of the value (`https://`, `.com`), so it describes the
 * control and is read with it. Ark writes the field's own `aria-describedby`
 * (helper and error text) and a prop would replace it, so the two are joined
 * here, inside the field where its context is readable.
 */
function DescribedInput({ addonIds, ...props }: ComponentProps<typeof Field.Input> & { addonIds: string[] }) {
  const field = useFieldContext();
  const describedBy =
    [...addonIds, field?.ariaDescribedby, props["aria-describedby"]].filter(Boolean).join(" ") || undefined;
  return <Field.Input {...props} aria-describedby={describedBy} />;
}

export function Input({
  label,
  helperText,
  error,
  size,
  required,
  id,
  className,
  startIcon,
  endIcon,
  startAddon,
  endAddon,
  ...inputProps
}: InputProps) {
  useFocusModality();
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const iconSize = CONTROL_ICON_SIZE[size ?? "md"];
  const hasIcons = startIcon != null || endIcon != null;
  const hasAddons = startAddon != null || endAddon != null;
  const uid = useId();
  const startAddonId = `${uid}start-addon`;
  const endAddonId = `${uid}end-addon`;
  const addonIds = [
    isText(startAddon) && startAddonId,
    isText(endAddon) && endAddonId,
  ].filter((v): v is string => !!v);

  const inputClassName = clsx(
    "field__control",
    startIcon != null && "field__control--affix-start",
    endIcon != null && "field__control--affix-end",
  );
  const input = addonIds.length ? (
    <DescribedInput className={inputClassName} required={required} {...inputProps} addonIds={addonIds} />
  ) : (
    <Field.Input className={inputClassName} required={required} {...inputProps} />
  );
  // Icons are overlays inside the control, as on SearchInput.
  const control = hasIcons ? (
    <div className="input-affix">
      {startIcon != null && (
        <span className="input-affix__adornment input-affix__adornment--start" aria-hidden="true">
          <Icon name={startIcon} size={iconSize} />
        </span>
      )}
      {input}
      {endIcon != null && (
        <span className="input-affix__adornment input-affix__adornment--end" aria-hidden="true">
          <Icon name={endIcon} size={iconSize} />
        </span>
      )}
    </div>
  ) : (
    input
  );

  return (
    <Field.Root
      className={clsx(inputFieldStyles({ size }), className)}
      invalid={isInvalid}
    >
      {label && (
        <Field.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      {/* Add-ons sit beside the control inside one shell that takes its border. */}
      {hasAddons ? (
        <div className="field__group">
          {startAddon != null && <Addon side="start" id={startAddonId}>{startAddon}</Addon>}
          {control}
          {endAddon != null && <Addon side="end" id={endAddonId}>{endAddon}</Addon>}
        </div>
      ) : (
        control
      )}
      {helperText && !isInvalid && (
        <Field.HelperText className="field__description">
          {helperText}
        </Field.HelperText>
      )}
      {isInvalid && errorMessage && (
        <Field.ErrorText asChild>
          <FieldError>{errorMessage}</FieldError>
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
