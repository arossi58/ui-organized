import { useMemo, useRef, type ReactNode } from "react";
import {
  Field,
  Select as ArkSelect,
  Portal,
  createListCollection,
  useSelectContext,
  type SelectRootProps,
} from "@ark-ui/react";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, selectFieldStyles, tagStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import { OMIT_ARIA, popupControls } from "@ui-organized/core";
import type { SelectOption, SelectProps } from "./Select.types.js";
import "@ui-organized/core/components/Select/Select.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";
import { glyph } from "../../icons/glyph.js";
import { useTagOverflow } from "../../utils/useTagOverflow.js";

export function Select(props: SelectProps) {
  // A change of `multiple` is a different component, not a prop update: the
  // value's shape changes with it.
  return <SelectImpl key={props.multiple ? "multiple" : "single"} {...props} />;
}

function SelectImpl(props: SelectProps) {
  const {
  options,
  open,
  defaultOpen,
  onOpenChange,
  placeholder,
  label,
  helperText,
  error,
  size,
  variant,
  disabled,
  name,
  required,
  className,
  portalContainer,
  } = props;
  const multiple = props.multiple === true;
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const iconSize = CONTROL_ICON_SIZE[size ?? "md"];
  const portal = useOverlayPortal();
  const containedPositioning = useContainedPositioning();
  // The ghost variant shows no label. It still renders one — visually hidden —
  // because Ark names the trigger, the listbox and the hidden <select> after the
  // Label part, and an `aria-label` on the trigger alone can neither replace a
  // dangling reference nor reach the other two.
  const isGhost = variant === "ghost";
  const boxRef = useRef<HTMLDivElement>(null);

  // Ark drives the dropdown off a collection rather than children; build it from
  // the `options` array (label → display text, value → form value).
  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
        isItemDisabled: (item) => !!item.disabled,
      }),
    [options],
  );

  const valueProps: Partial<SelectRootProps<SelectOption>> = props.multiple
          ? {
              multiple: true,
              value: props.value,
              defaultValue: props.defaultValue,
              onValueChange: props.onValueChange && ((details) => props.onValueChange?.(details.value)),
              // A click on a tag's remove button is inside the field, not
              // outside the list: it must not close what is being chosen from.
              onInteractOutside: (event) => {
                if (boxRef.current?.contains(event.target as Node)) event.preventDefault();
              },
            }
          : {
              value: props.value != null ? [props.value] : undefined,
              defaultValue: props.defaultValue != null ? [props.defaultValue] : undefined,
              onValueChange: props.onValueChange
                ? (details) => {
                    const next = details.value[0];
                    if (next != null) props.onValueChange?.(next);
                  }
                : undefined,
            };

  return (
    <Field.Root
      className={clsx(selectFieldStyles({ size, variant }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {/* Ark Select.Root renders a wrapping <div>; `display:contents` keeps the
          label / trigger / helper as direct flex children of the field. */}
      <ArkSelect.Root
        className="select-field__control"
        collection={collection}
        {...valueProps}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
        invalid={isInvalid}
        disabled={disabled}
        name={name}
        required={required}
        positioning={{ placement: "bottom-start", gutter: 4, strategy: "fixed", ...containedPositioning }}
      >
        {label && (
          <ArkSelect.Label className={isGhost ? "select-field__label--hidden" : "field__label"}>
            {label}
            {required && !isGhost && <span className="field__required" aria-hidden="true" />}
          </ArkSelect.Label>
        )}
        {multiple ? (
          <ArkSelect.Control className="select-field__box" ref={boxRef}>
            <SelectTrigger hasLabel={!!label}>
              <MultiValueText placeholder={placeholder} />
            </SelectTrigger>
            <SelectTags options={options} />
            <ArkSelect.ClearTrigger
              className="select-field__clear"
              aria-label={(props.multiple && props.clearLabel) || "Clear all"}
            >
              <Icon name={glyph("close")} size={CLEAR_ICON_SIZE} />
            </ArkSelect.ClearTrigger>
            <ArkSelect.Indicator className="select-field__icon">
              <Icon name={glyph("chevron-down")} size={iconSize} />
            </ArkSelect.Indicator>
          </ArkSelect.Control>
        ) : (
          <SelectTrigger hasLabel={!!label}>
            <ArkSelect.ValueText className="select-field__value" placeholder={placeholder} />
            <ArkSelect.Indicator className="select-field__icon">
              <Icon name={glyph("chevron-down")} size={iconSize} />
            </ArkSelect.Indicator>
          </SelectTrigger>
        )}
        {/* An explicitly-passed container still wins over the preview context. */}
        <Portal {...(portalContainer ? { container: { current: portalContainer } } : portal)}>
          <ArkSelect.Positioner className="select-positioner">
            <ArkSelect.Content
              className={clsx("select-popup", isGhost && "select-popup--ghost")}
              aria-labelledby={label ? undefined : OMIT_ARIA}
            >
              {/* Items sit directly in Content: with the default composite
                  select, Content *is* the listbox, and Select.List is a second
                  labelled wrapper meant for the non-composite mode. Between the
                  listbox and its options it counts as a child that isn't an
                  option, which a listbox may not have. */}
              {options.map((opt) => (
                <ArkSelect.Item key={opt.value} item={opt} className="select-popup__item text-default-body-large">
                  <ArkSelect.ItemText>{opt.label}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator className="select-popup__item-indicator">
                    <Icon name={glyph("check")} size={iconSize} />
                  </ArkSelect.ItemIndicator>
                </ArkSelect.Item>
              ))}
            </ArkSelect.Content>
          </ArkSelect.Positioner>
        </Portal>
        <ArkSelect.HiddenSelect aria-labelledby={label ? undefined : OMIT_ARIA} />
      </ArkSelect.Root>
      {helperText && !isInvalid && (
        <Field.HelperText className="field__description">{helperText}</Field.HelperText>
      )}
      {isInvalid && errorMessage && (
        <Field.ErrorText asChild>
          <FieldError>{errorMessage}</FieldError>
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}

const CLEAR_ICON_SIZE = 16;
/** The remove glyph is smaller than a content icon, as on Tag. */
const REMOVE_ICON_SIZE = 12;

/**
 * The chosen values as text inside the trigger: the placeholder when there are
 * none, otherwise visually hidden, because it is what names the selection for a
 * screen reader while the tags beside it are aria-hidden.
 */
function MultiValueText({ placeholder }: { placeholder?: string }) {
  const hasValue = useSelectContext().value.length > 0;
  return (
    <ArkSelect.ValueText
      className={clsx("select-field__value", hasValue && "select-field__value--hidden")}
      placeholder={placeholder}
    />
  );
}

/**
 * The chosen values as tags on one line, with a "+N" for those that do not fit.
 * Every tag renders so it can be measured; the overflow is marked and hidden by
 * CSS. Without layout (the server, jsdom) nothing is measured and all show.
 */
function SelectTags({ options }: { options: SelectOption[] }) {
  const api = useSelectContext();
  const chosen = api.value
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is SelectOption => o != null);

  const { rowRef, fits } = useTagOverflow(api.value.join("\u0000"));

  const shown = fits ?? chosen.length;
  const more = chosen.length - shown;
  const tag = tagStyles({ variant: "neutral", size: "sm", appearance: "subtle" });
  return (
    <div className="select-field__tags" aria-hidden="true" ref={rowRef}>
      {chosen.map((option, i) => (
        <span key={option.value} className={tag} data-tag="" data-overflowed={i >= shown ? "" : undefined}>
          <span className="tag__label">{option.label}</span>
          <button
            type="button"
            className="tag__remove"
            tabIndex={-1}
            aria-label={`Remove ${option.label}`}
            // Cancelled so focus stays on the trigger rather than a button about to go.
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => api.clearValue(option.value)}
          >
            <Icon name={glyph("close")} size={REMOVE_ICON_SIZE} />
          </button>
        </span>
      ))}
      {more > 0 && (
        <span className={clsx(tag, "select-field__tag-more")}>
          <span className="tag__label">+{more}</span>
        </span>
      )}
    </div>
  );
}

/**
 * The trigger, split out so it can read the select's open state from context —
 * `Select` itself renders the Root, so it sits above that context.
 */
function SelectTrigger({ hasLabel, children }: { hasLabel: boolean; children: ReactNode }) {
  return (
    <ArkSelect.Trigger
      className="select-field__trigger text-default-body-large"
      {...popupControls(useSelectContext().open)}
      // With no label anywhere there is no Label part to point at, so shed the
      // machine's reference rather than leave it dangling.
      aria-labelledby={hasLabel ? undefined : OMIT_ARIA}
    >
      {children}
    </ArkSelect.Trigger>
  );
}
