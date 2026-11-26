import { cva, type VariantProps } from "class-variance-authority";
import { formatKey, type KeyLabel, type KeyPlatform } from "../../keys.js";

/**
 * A keyboard key, or a shortcut as a row of keys. Each key is a nested `<kbd>`,
 * which is how HTML writes "these keys pressed together".
 */
export const kbdStyles = cva("kbd", {
  variants: {
    size: {
      sm: "kbd--sm",
      md: "kbd--md",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type KbdVariants = VariantProps<typeof kbdStyles>;

/** `auto` follows the reader's platform once mounted; the server and first render use `other`. */
export type KbdPlatform = KeyPlatform | "auto";

/** Each key of a shortcut as it is drawn and named on `platform`. */
export function kbdLabels(keys: readonly string[], platform: KeyPlatform): KeyLabel[] {
  return keys.map((key) => formatKey(key, platform));
}
