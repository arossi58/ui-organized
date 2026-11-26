import { cva, type VariantProps } from "class-variance-authority";

/**
 * The public Calendar's frame: the grid, an optional column of presets before
 * it and an optional footer under it. `card` puts it on a bordered surface;
 * `plain` leaves it on whatever it sits on, as inside a popover.
 */
export const calendarPanelStyles = cva("calendar-panel", {
  variants: {
    variant: {
      plain: "calendar-panel--plain",
      card: "calendar-panel--card",
    },
  },
  defaultVariants: {
    variant: "plain",
  },
});

export type CalendarPanelVariants = VariantProps<typeof calendarPanelStyles>;
