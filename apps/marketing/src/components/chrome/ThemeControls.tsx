import { Moon, Sun } from "lucide-react";
import { Toggle, ToggleGroup } from "@ui-organized/react";
import { useTheme } from "../../theme/ThemeProvider";
import { trackEvent } from "../../lib/analytics";

/**
 * The theme controls — a Light/Dark toggle group plus the brand-color list. Shared by
 * the desktop nav's popover (ThemeMenu) and the mobile menu's accordion, so both
 * surfaces drive the site theme identically. Keyed off the `theme-menu__*`
 * classes (theme-menu.css) so the styling stays in one place.
 *
 * theme_change is logged here (the user-driven controls) rather than in the
 * provider, whose effect also runs on the initial localStorage hydration — we
 * only want deliberate light/dark and brand switches.
 */
export function ThemeControls() {
  const { mode, brand, options, setMode, setBrand } = useTheme();

  function handleModeChange(value: string[]) {
    // Single-select, but pressing the active toggle again empties the group;
    // the mode can't be "neither", so ignore that.
    const next = value[0];
    if (next !== "light" && next !== "dark") return;
    setMode(next);
    trackEvent("theme_change", { change: "mode", mode: next });
  }

  function handleBrandChange(name: string) {
    if (name !== brand) trackEvent("theme_change", { change: "brand", brand: name });
    setBrand(name);
  }

  return (
    <>
      <div className="theme-menu__switch-row">
        <ToggleGroup
          aria-label="Color mode"
          className="theme-menu__mode"
          value={[mode]}
          onValueChange={handleModeChange}
        >
          {/* Components, not registered names, so the icons don't depend on
              which icon library the site happens to register. */}
          <Toggle value="light" size="md" icon={Sun}>
            Light
          </Toggle>
          <Toggle value="dark" size="md" icon={Moon}>
            Dark
          </Toggle>
        </ToggleGroup>
      </div>

      <div className="theme-menu__list" role="radiogroup" aria-label="Brand color">
        {options.map((option) => {
          const selected = option.name === brand;
          return (
            <button
              key={option.name}
              type="button"
              role="radio"
              aria-checked={selected}
              className="theme-menu__item"
              onClick={() => handleBrandChange(option.name)}
            >
              <span
                className="theme-menu__swatch"
                style={{ background: option.hex }}
                aria-hidden="true"
              />
              <span className="theme-menu__item-label">{option.label}</span>
              {selected && (
                <svg
                  className="theme-menu__check"
                  viewBox="0 0 20 20"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path
                    d="M5 10.5l3.4 3.4L15 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
