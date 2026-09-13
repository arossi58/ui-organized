import { Directive, input } from "@angular/core";

export type ToolbarOrientation = "horizontal" | "vertical";

/**
 * A container grouping a set of design-system controls.
 *
 * ```html
 * <div uioToolbar>
 *   <div uioToolbarGroup>
 *     <button uioButton intent="ghost" size="sm">Bold</button>
 *     <button uioButton intent="ghost" size="sm">Italic</button>
 *   </div>
 *   <div uioDivider orientation="vertical"></div>
 *   <button uioButton intent="ghost" size="sm">Link</button>
 * </div>
 * ```
 *
 * Compose it with the library's own controls — `UioButton` (use
 * `intent="ghost"`), `UioInput`, and `UioDivider` (use `orientation="vertical"`).
 * Match the control `size` across the children to size the toolbar.
 *
 * ── Why it does not extend `UioPart` ────────────────────────────────────────
 *
 * Ark UI has no Toolbar primitive — none of the four libraries has a machine
 * behind this — so a React toolbar carries no `data-scope`/`data-part`, and
 * neither may this one. Extending the base would stamp an identity on the
 * element that the other three do not render, and the browser parity gate
 * compares every attribute. Same reasoning as `UioButton`; the reason
 * `UioRadioGroup` opts out is a different one (its host is a wrapper *outside*
 * the ARIA role).
 *
 * `data-orientation` is emitted alongside `aria-orientation` because
 * `Toolbar.css` switches the flex direction on the data attribute; dropping it
 * leaves a vertical toolbar laid out horizontally with perfectly correct ARIA.
 * It is bound here rather than inherited from `UioPart` for the reason above.
 *
 * A directive rather than a component, and an attribute rather than an element:
 * there is nothing to project — the caller's own children are already in the
 * right place — so an `<uio-toolbar>` element would be a wrapper the other
 * three libraries do not render.
 */
@Directive({
  selector: "div[uioToolbar]",
  standalone: true,
  host: {
    class: "toolbar",
    role: "toolbar",
    "[attr.aria-orientation]": "orientation()",
    "[attr.data-orientation]": "orientation()",
  },
})
export class UioToolbar {
  readonly orientation = input<ToolbarOrientation>("horizontal");
}

/**
 * Optional wrapper to visually cluster a subset of toolbar controls.
 *
 * `role="group"` rather than nothing: a toolbar's children are announced as one
 * list, and a cluster that is a visual unit has to be one to assistive tech too.
 */
@Directive({
  selector: "div[uioToolbarGroup]",
  standalone: true,
  host: { class: "toolbar__group", role: "group" },
})
export class UioToolbarGroup {}
