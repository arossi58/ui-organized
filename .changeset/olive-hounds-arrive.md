---
"@ui-organized/angular": minor
---

First release of `@ui-organized/angular`: the design system's components for Angular 21, built on the Angular CDK.

**All 68 components** the React, Svelte and Vue packages ship, sharing their stylesheets, variant recipes and token contract through `@ui-organized/core`. Same class names, same `data-*` state attributes, same rendered ARIA — asserted by a gate that mounts every component in all four libraries and diffs the markup on every run.

**Not built on Ark UI, because there is no Angular package.** The other three libraries bind the same Zag state machines; this one is written against the CDK's overlay, portal and a11y primitives instead. That is the single largest engineering difference in the system, and it is invisible from the outside: the rendered DOM is compared against React's like everything else.

**Standalone directives, on your own element.** Most components are attribute directives, so the tag stays yours — `<button uioButton intent="primary">`, `<span uioTag variant="success">`. The overlays own their host instead (`<uio-dialog>`, `<uio-popover>`, `<uio-menu>`), because they project content into a surface they position. There is no NgModule to import.

**Signals throughout**, including where the other libraries use a callback: controllable state is a `model()`, so `[(open)]` and `[(value)]` work, and 22 form controls implement `ControlValueAccessor` so `[formControl]` and `[(ngModel)]` need no wrapper.

**Icons come from `@ng-icons`**, as optional peers — `@ng-icons/lucide`, `@ng-icons/tabler-icons`, `@ng-icons/heroicons`. One import registers a pack; the two you did not choose are never resolved. `provideIconConfig()` accepts a signal, so a theme switcher flipping the icon style re-renders every icon below it.

**Two stylesheets, not one.** `@ui-organized/angular/styles` is the shared component CSS; `@ui-organized/angular/overlay.css` is this library's only addition — the rules that position a CDK overlay pane where the other three libraries put theirs. Skipping it leaves every overlay unpositioned.
