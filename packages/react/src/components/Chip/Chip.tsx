import { createContext, forwardRef, useContext, type ReactNode } from "react";
import { clsx } from "clsx";
import { chipSegmentStyles, chipStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { warnMissingRemoveLabel } from "./warnMissingRemoveLabel.js";
import type { ChipProps, ChipSegmentProps } from "./Chip.types.js";
import "@ui-organized/core/components/Chip/Chip.css";
import { glyph } from "../../icons/glyph.js";

/** The dismiss icon, at the size `Tag`'s icons render. */
const ICON_SIZE = 16;

/** The chip's `disabled`, reaching segments a consumer composed themselves. */
const ChipDisabledContext = createContext(false);

const present = (node: ReactNode) => node !== undefined && node !== null && node !== false;

/**
 * A compact token standing for something the user added — a filter, a facet, a
 * recipient — which they can then edit or remove.
 *
 * Segmented (Figma 2462:2636): "Name | is greater than | Value" is three
 * controls, each opening the menu for the one parameter it shows. Two
 * structural decisions are load-bearing:
 *
 * 1. **Every segment, and the dismiss control, is a sibling.** A button nested
 *    in a button is invalid HTML and an axe `nested-interactive` violation. The
 *    wrapper `<span role="group">` is what makes several controls look like one
 *    object.
 * 2. **Each segment is its own element**, so an overlay trigger can project
 *    onto exactly the part that opens it —
 *    `<MenuTrigger render={<ChipSegment part="operator">…</ChipSegment>} />` —
 *    and its `id`, `onClick` and `aria-expanded` attach to that segment rather
 *    than to the whole chip.
 */
export function Chip({
  label,
  operator,
  value,
  children,
  selected = false,
  incomplete = false,
  disabled = false,
  onRemove,
  removeLabel,
  className,
  ...props
}: ChipProps) {
  if (onRemove && !removeLabel) warnMissingRemoveLabel();

  return (
    <ChipDisabledContext.Provider value={disabled}>
      <span
        role="group"
        className={clsx(
          chipStyles(),
          selected && "chip--selected",
          incomplete && "chip--incomplete",
          disabled && "chip--disabled",
          className,
        )}
        {...props}
      >
        {present(label) && <ChipSegment part="label">{label}</ChipSegment>}
        {present(operator) && <ChipSegment part="operator">{operator}</ChipSegment>}
        {present(value) && <ChipSegment part="value">{value}</ChipSegment>}
        {children}

        {onRemove && (
          <button
            type="button"
            className="chip__remove"
            aria-label={removeLabel}
            disabled={disabled}
            onClick={onRemove}
          >
            <Icon name={glyph("close")} size={ICON_SIZE} />
          </button>
        )}
      </span>
    </ChipDisabledContext.Provider>
  );
}

/**
 * One part of a chip's sentence. A `<button>` once it has something to do, a
 * `<span>` until then.
 *
 * A segment that opens nothing must not be a button, or every static token in a
 * list puts empty stops in the tab order. `disabled` counts as something to do:
 * a real disabled control is what exempts the dimmed text from axe's contrast
 * rule, which no amount of tuning the opacity would satisfy.
 */
export const ChipSegment = forwardRef<HTMLButtonElement, ChipSegmentProps>(function ChipSegment(
  { part, className, disabled: ownDisabled, children, ...props },
  ref,
) {
  const disabled = useContext(ChipDisabledContext) || ownDisabled === true;
  const classes = clsx(chipSegmentStyles({ part }), className);

  if (props.onClick === undefined && !disabled) {
    return <span className={classes}>{children}</span>;
  }
  return (
    <button ref={ref} type="button" className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
});
