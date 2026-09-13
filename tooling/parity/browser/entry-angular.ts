import "@angular/compiler";
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import "@ui-organized/tokens/variables.css";
import "./harness.css";
import "@angular/cdk/overlay-prebuilt.css";
import "@ui-organized/angular/styles.css";
import "@ui-organized/angular/overlay.css";
// The table ships its stylesheet separately, the way a consumer imports it:
// tokens, then the component library, then the table. Without this the
// DataTable scenarios were compared *unstyled* — which the DOM gate could not
// notice, since it captures `data-` and `aria-` attributes and not `style`,
// and the virtualizer's spacer heights live in inline styles.
import "@ui-organized/angular-table/styles";
import { caseFromUrl, mountPoint, signalReady } from "./harness.js";
import { PARITY_PROPS } from "./fixtures/angular/parity-props.js";
import { angularFixtureFor } from "./fixtures/angular/index.js";

/**
 * `@angular/compiler` is imported for its side effect: it installs the JIT
 * compiler, which is what lets the fixtures below be plain decorated classes
 * with no Angular build step. The library itself is compiled ahead of time by
 * ng-packagr, so what is under test is exactly what ships — the JIT compiler
 * only handles the harness's own fixtures.
 *
 * Zoneless, because the library is: nothing here depends on zone.js patching
 * the DOM, and a change-detection strategy the library does not require has no
 * business being what the gate measures.
 */
const { component, props } = caseFromUrl();
const mount = mountPoint();

// Angular bootstraps into an element matching the component's selector, so the
// fixture is hosted by `#mount` itself. The other three libraries render *into*
// their mount node, and an extra Angular-only wrapper would be a DOM difference
// the harness invented.
mount.setAttribute("data-angular-root", "");

bootstrapApplication(angularFixtureFor(component), {
  providers: [provideZonelessChangeDetection(), { provide: PARITY_PROPS, useValue: props }],
})
  .then(() => {
    // Both are marks left by the framework on the element it took over, not
    // anything a component rendered. Vue's `data-v-app` gets the same treatment
    // in entry-vue.ts.
    mount.removeAttribute("data-angular-root");
    mount.removeAttribute("ng-version");
    signalReady();
  })
  .catch((error) => {
    console.error(`parity harness: Angular failed to bootstrap ${component}`, error);
  });
