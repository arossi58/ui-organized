// Internal. Deliberately absent from the package barrel: Calendar has no public
// DOM contract of its own — it reaches a user only through the date fields.
export { default as Calendar } from "./Calendar.vue";
export type { CalendarProps, CalendarRange } from "./Calendar.types.js";
