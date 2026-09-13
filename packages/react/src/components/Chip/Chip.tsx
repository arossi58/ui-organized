import { clsx } from "clsx";
import { COMPARISON_ICONS, chipStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { warnMissingRemoveLabel } from "./warnMissingRemoveLabel.js";
import type { ChipProps } from "./Chip.types.js";
import "@ui-organized/core/components/Chip/Chip.css";

/** Icons render at 16px across every chip size, exactly as `Tag`'s do. */
const ICON_SIZE = 16;

/**
 * A compact token standing for something the user added — a filter, a facet, a
 * recipient — which they can then edit or remove.
 *
 * Two structural decisions are load-bearing:
 *
 * 1. **The dismiss control is a sibling of the body, not inside it.** A chip
 *    genuinely does two things, and a button nested in a button is invalid HTML
 *    and an axe `nested-interactive` violation. The wrapper `<span>` is what
 *    makes two controls look like one object.
 * 2. **Every prop except `className` lands on the body.** That is what lets an
 *    overlay trigger project itself onto a chip —
 *    `<PopoverTrigger render={<Chip … />} />` — and have its `id`, `onClick`
 *    and `aria-expanded` attach to the element that actually opens the popover,
 *    rather than to a wrapper that does nothing.
 */
export function Chip({
  variant,
  size = "md",
  label,
  detail,
  operator,
  operatorLabel,
  children,
  icon,
  dropdown = false,
  selected = false,
  incomplete = false,
  disabled = false,
  onRemove,
  removeLabel,
  className,
  ...props
}: ChipProps) {
  // A chip that opens something is a button; a chip that is only a token with a
  // dismiss control is not. Rendering a <button> either way would promise an
  // action that isn't there, and put an empty stop in the tab order.
  //
  // `disabled` counts, because there is nothing to disable on a static token —
  // and a real disabled control is also what exempts the dimmed label from
  // axe's contrast rule, which no amount of tuning the opacity would satisfy.
  const interactive = props.onClick !== undefined || dropdown || disabled;

  if (onRemove && !removeLabel) warnMissingRemoveLabel();

  const content = (
    <>
      {icon && <Icon name={icon} size={ICON_SIZE} className="chip__icon" />}
      {label !== undefined && label !== null && label !== false && (
        <span className="chip__label">{label}</span>
      )}
      {/* Drawn or spelled, never both — the six operators that have a glyph use
          it, and the thirteen that do not fall back to words. The markup is
          in-repo and generated from the designer's SVGs; nothing here is
          user-supplied, which is the whole of why this injection is safe. */}
      {operator ? (
        <span
          className="icon chip__operator"
          role={operatorLabel ? "img" : undefined}
          aria-label={operatorLabel}
          aria-hidden={operatorLabel ? undefined : true}
          dangerouslySetInnerHTML={{ __html: COMPARISON_ICONS[operator] }}
        />
      ) : (
        detail !== undefined &&
        detail !== null &&
        detail !== false && <span className="chip__detail">{detail}</span>
      )}
      {children !== undefined && children !== null && children !== false && (
        <span className="chip__value">{children}</span>
      )}
      {dropdown && <Icon name="chevron-down" size={ICON_SIZE} className="chip__caret" />}
    </>
  );

  return (
    <span
      className={clsx(
        chipStyles({ variant, size }),
        selected && "chip--selected",
        incomplete && "chip--incomplete",
        disabled && "chip--disabled",
        className,
      )}
    >
      {interactive ? (
        <button type="button" className="chip__body" disabled={disabled} {...props}>
          {content}
        </button>
      ) : (
        <span className="chip__body">{content}</span>
      )}

      {onRemove && (
        <button
          type="button"
          className="chip__remove"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
        >
          <Icon name="close" size={ICON_SIZE} />
        </button>
      )}
    </span>
  );
}
