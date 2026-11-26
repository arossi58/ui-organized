import { useEffect, useMemo, useRef, useState } from "react";
import {
  Combobox as ArkCombobox,
  Field,
  Portal,
  createListCollection,
  useComboboxContext,
  useFilter,
  type ComboboxRootProps,
} from "@ark-ui/react";
import { clsx } from "clsx";
import { CONTROL_ICON_SIZE, comboboxFieldStyles, tagStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import type { ComboboxOption, ComboboxProps } from "./Combobox.types.js";
import "@ui-organized/core/components/Combobox/Combobox.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";
import { glyph } from "../../icons/glyph.js";
import { useFocusModality } from "../../utils/useFocusModality.js";
import { useTagOverflow } from "../../utils/useTagOverflow.js";

// Module-level so `useFilter`'s memo key is stable (it keys on the props object
// identity); otherwise `contains` — and the derived collection — would churn
// every render.
const FILTER_OPTIONS = { sensitivity: "base" } as const;

export function Combobox(props: ComboboxProps) {
  // A change of `multiple` is a different component: the value's shape changes.
  return <ComboboxImpl key={props.multiple ? "multiple" : "single"} {...props} />;
}

function ComboboxImpl(props: ComboboxProps) {
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
  disabled,
  name,
  required,
  className,
  emptyMessage = "No results found.",
  portalContainer,
  } = props;
  const multiple = props.multiple === true;
  const controlRef = useRef<HTMLDivElement>(null);
  useFocusModality();
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const portal = useOverlayPortal();
  const containedPositioning = useContainedPositioning();

  // Ark doesn't filter for us (Base UI did): mirror the input text and rebuild
  // the collection from the matching options. Rendering items from
  // `collection.items` keeps the rendered list and the machine's collection in
  // sync.
  const { contains } = useFilter(FILTER_OPTIONS);
  const [query, setQuery] = useState("");
  const collection = useMemo(() => {
    const items = query.trim().length
      ? options.filter((o) => contains(o.label, query))
      : options;
    return createListCollection({
      items,
      itemToValue: (o) => o.value,
      itemToString: (o) => o.label,
      isItemDisabled: (o) => !!o.disabled,
    });
  }, [options, query, contains]);

  const valueProps: Partial<ComboboxRootProps<ComboboxOption>> = props.multiple
    ? {
        multiple: true,
        value: props.value,
        defaultValue: props.defaultValue,
        onValueChange: props.onValueChange && ((details) => props.onValueChange?.(details.value)),
        // Picking clears the query and keeps the list open for the next.
        selectionBehavior: "clear",
        closeOnSelect: false,
        // A click on a tag's remove button is inside the field, not outside the list.
        onInteractOutside: (event) => {
          if (controlRef.current?.contains(event.target as Node)) event.preventDefault();
        },
      }
    : {
        value: props.value != null ? [props.value] : undefined,
        defaultValue: props.defaultValue != null ? [props.defaultValue] : undefined,
        onValueChange: props.onValueChange
          ? (details) => props.onValueChange?.(details.value[0] ?? "")
          : undefined,
      };

  return (
    <Field.Root
      className={clsx(comboboxFieldStyles({ size }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {/* Ark Combobox.Root renders a wrapping <div>; `display:contents` keeps the
          label / control / helper as direct flex children of the field. */}
      <ArkCombobox.Root
        className="combobox-field__root"
        collection={collection}
        {...valueProps}
        onInputValueChange={(details) => setQuery(details.inputValue)}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
        invalid={isInvalid}
        disabled={disabled}
        // With multiple, the input holds the query, not the value: each value is
        // submitted as a hidden input instead (see HiddenValues).
        name={multiple ? undefined : name}
        required={multiple ? undefined : required}
        positioning={{ placement: "bottom-start", gutter: 4, strategy: "fixed", ...containedPositioning }}
      >
        {!multiple && <SelectedLabelSync options={options} />}
        {label && (
          <ArkCombobox.Label className="field__label">
            {label}
            {required && <span className="field__required" aria-hidden="true" />}
          </ArkCombobox.Label>
        )}
        <ArkCombobox.Control className="combobox-field__control" ref={controlRef}>
          {multiple && <ComboboxTags options={options} />}
          {multiple ? (
            <MultiInput placeholder={placeholder} />
          ) : (
            <ArkCombobox.Input className="field__control combobox-field__input" placeholder={placeholder} />
          )}
          {multiple && (
            <ArkCombobox.ClearTrigger
              className="combobox-field__clear"
              aria-label={(props.multiple && props.clearLabel) || "Clear all"}
            >
              <Icon name={glyph("close")} size={CLEAR_ICON_SIZE} />
            </ArkCombobox.ClearTrigger>
          )}
          <ArkCombobox.Trigger className="combobox-field__trigger" aria-label="Toggle options">
            <Icon name={glyph("chevron-down")} size={CONTROL_ICON_SIZE[size ?? "md"]} />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>
        {/* An explicitly-passed container still wins over the preview context. */}
        <Portal {...(portalContainer ? { container: { current: portalContainer } } : portal)}>
          <ArkCombobox.Positioner className="combobox-positioner">
            <ArkCombobox.Content className="combobox-popup">
              <ArkCombobox.Empty className="combobox-popup__empty text-default-body-medium">{emptyMessage}</ArkCombobox.Empty>
              {/* Items sit directly in Content, which is itself the listbox —
                  Combobox.List is a second labelled wrapper for the
                  non-composite mode, and in between it reads as a child of the
                  listbox that isn't an option. */}
              {collection.items.map((item) => (
                <ArkCombobox.Item key={item.value} item={item} className="combobox-popup__item text-default-body-large">
                  <span className="combobox-popup__item-label">{item.label}</span>
                  <ArkCombobox.ItemIndicator className="combobox-popup__item-indicator">
                    <Icon name={glyph("check")} size={CONTROL_ICON_SIZE[size ?? "md"]} />
                  </ArkCombobox.ItemIndicator>
                </ArkCombobox.Item>
              ))}
            </ArkCombobox.Content>
          </ArkCombobox.Positioner>
        </Portal>
        {multiple && name && <HiddenValues name={name} />}
      </ArkCombobox.Root>
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

/** The text box in multiple mode: Backspace in an empty box removes the last value. */
function MultiInput({ placeholder }: { placeholder?: string }) {
  const combobox = useComboboxContext();
  return (
    <ArkCombobox.Input
      className="field__control combobox-field__input"
      placeholder={combobox.value.length ? undefined : placeholder}
      onKeyDown={(event) => {
        if (event.key !== "Backspace" || combobox.inputValue !== "") return;
        const last = combobox.value[combobox.value.length - 1];
        if (last != null) combobox.clearValue(last);
      }}
    />
  );
}

/**
 * The chosen values as tags on one line, with a "+N" for those that do not fit.
 * Every tag renders so it can be measured; the overflow is marked and hidden by
 * CSS. Without layout (the server, jsdom) nothing is measured and all show.
 */
function ComboboxTags({ options }: { options: ComboboxOption[] }) {
  const combobox = useComboboxContext();
  const chosen = combobox.value
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is ComboboxOption => o != null);

  const { rowRef, fits } = useTagOverflow(combobox.value.join("\u0000"));

  if (chosen.length === 0) return null;
  const shown = fits ?? chosen.length;
  const more = chosen.length - shown;
  const tag = tagStyles({ variant: "neutral", size: "sm", appearance: "subtle" });
  return (
    <div className="combobox-field__tags" ref={rowRef}>
      {chosen.map((option, i) => (
        <span key={option.value} className={tag} data-tag="" data-overflowed={i >= shown ? "" : undefined}>
          <span className="tag__label">{option.label}</span>
          <button
            type="button"
            className="tag__remove"
            tabIndex={-1}
            aria-label={`Remove ${option.label}`}
            // Cancelled so focus stays in the text box, as zag does for its clear button.
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => combobox.clearValue(option.value)}
          >
            <Icon name={glyph("close")} size={REMOVE_ICON_SIZE} />
          </button>
        </span>
      ))}
      {more > 0 && (
        <span className={clsx(tag, "combobox-field__tag-more")}>
          <span className="tag__label">+{more}</span>
        </span>
      )}
    </div>
  );
}

/** One hidden input per chosen value, which is what a form submits in multiple mode. */
function HiddenValues({ name }: { name: string }) {
  const combobox = useComboboxContext();
  return (
    <>
      {combobox.value.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
    </>
  );
}

/**
 * Puts the chosen option's label in the box once the options holding it arrive.
 *
 * zag works out the input text once, when the machine starts, as
 * `collection.stringifyMany(value)`. A value set before its options have loaded
 * therefore gives an empty box showing the placeholder over a perfectly good
 * selection. When the options do arrive the machine sends `CHILDREN_CHANGE`,
 * which only its open states handle, and the value has not changed, so its own
 * value watcher stays quiet too. Nothing re-derives the text. `syncSelectedItems`
 * is zag's public way to ask for exactly that.
 *
 * Keyed on the *label*, not on `options`. A list rebuilt on every render, or
 * refetched as the user types, gives a new array each time; re-syncing on that
 * would wipe whatever they were halfway through typing. The label changes once,
 * from `undefined` to the string, and that is the moment worth acting on.
 *
 * And only into an empty, closed box. Open means someone is using it, and text
 * in a closed box was put there by the machine or the user, never by the
 * missing option. Resolved against `options` rather than the machine's
 * collection, which is narrowed by the query. With the box empty the query is
 * too, so the collection zag syncs from is the whole list.
 *
 * Split out because the machine is only reachable below `Combobox.Root`, the
 * same reason `SelectTrigger` is its own component.
 */
function SelectedLabelSync({ options }: { options: ComboboxProps["options"] }) {
  const combobox = useComboboxContext();
  const chosen = combobox.value[0];
  const label = chosen == null ? undefined : options.find((o) => o.value === chosen)?.label;

  // Read through a ref so the effect below depends on the label alone.
  const latest = useRef(combobox);
  latest.current = combobox;

  useEffect(() => {
    const { open, inputValue, syncSelectedItems } = latest.current;
    if (!label || open || inputValue !== "") return;
    syncSelectedItems();
  }, [label]);

  return null;
}
