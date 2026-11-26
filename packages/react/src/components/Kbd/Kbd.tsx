import { clsx } from "clsx";
import { kbdLabels, kbdStyles } from "@ui-organized/core";
import type { KbdProps } from "./Kbd.types.js";
import "@ui-organized/core/components/Kbd/Kbd.css";
import { useKeyPlatform } from "../../utils/useKeyPlatform.js";

/**
 * A key, or a shortcut as a row of keys. A key drawn as a symbol carries its
 * name as visually hidden text, so a screen reader says "Command K".
 */
export function Kbd({ keys, children, size, platform, className, ...props }: KbdProps) {
  const resolved = useKeyPlatform(platform);
  return (
    <kbd className={clsx(kbdStyles({ size }), className)} {...props}>
      {keys ? (
        kbdLabels(keys, resolved).map((label, i) => (
          <kbd key={i} className="kbd__key">
            {label.glyph === label.name ? (
              label.glyph
            ) : (
              <>
                <span aria-hidden="true">{label.glyph}</span>
                <span className="kbd__name">{label.name}</span>
              </>
            )}
          </kbd>
        ))
      ) : (
        <kbd className="kbd__key">{children}</kbd>
      )}
    </kbd>
  );
}
