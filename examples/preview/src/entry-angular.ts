/**
 * The Angular page.
 *
 * Angular is the one that cannot follow the other three's shape, for two
 * reasons that both come from the parity fixtures being reused rather than
 * rewritten.
 *
 * The fixtures all declare the same selector — `[data-angular-root]` — because
 * the gate mounts exactly one of them per page. `bootstrapApplication` finds its
 * host by that selector and takes the first match, so 67 of them on one page
 * would all fight over the first card. `createApplication` plus
 * `createComponent` takes an explicit `hostElement` instead, which is what this
 * page needs and also avoids standing up 67 separate Angular applications.
 *
 * And the props reach a fixture through an injection token rather than an input,
 * because Angular's JIT compiler never registers initializer-based inputs. One
 * element injector per card carries that component's props.
 */
import "@angular/compiler";
import {
  Injector,
  createComponent,
  provideZonelessChangeDetection,
  type ApplicationRef,
} from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import "@ui-organized/tokens/variables.css";
import "@angular/cdk/overlay-prebuilt.css";
import "@ui-organized/angular/styles.css";
import "@ui-organized/angular/overlay.css";
import "./shell.css";
import { registerIconSet } from "@ui-organized/angular";
import { lucideIcons } from "@ui-organized/angular/icons/lucide";
import { ANGULAR_FIXTURES } from "@ui-organized/parity/angular-fixtures";
import { PARITY_PROPS } from "@ui-organized/parity/parity-props";
import {
  CATALOGUE,
  UNPREVIEWABLE,
  card,
  failed,
  missing,
  renderShell,
  unpreviewable,
} from "./shell.js";

/**
 * A real icon library, registered after the fixtures have loaded.
 *
 * Same ordering trap as the other three entries: importing the Angular fixture
 * registry pulls in the parity suite's *stub* icon set, which claims
 * `library: "lucide"`, and `registerIconSet` is last-write-wins. Registering
 * here — after module initialisation rather than by import position — states the
 * order instead of leaving it to whichever import a formatter puts second.
 *
 * Angular's icons are SVG *markup strings* rather than components, because
 * Angular instantiates a component onto an element of its own and `.icon` is a
 * centring flex container: one element deeper and the SVG stops being what is
 * laid out. See the package's icon registry for the full reasoning.
 */
registerIconSet(lucideIcons);

const shipped = CATALOGUE.filter((e) => ANGULAR_FIXTURES[e.name]).length;
const grid = renderShell("angular", shipped);

/**
 * Zoneless, because the library is. A change-detection strategy the library does
 * not require has no business being what the preview renders under.
 */
const app: ApplicationRef = await createApplication({
  providers: [provideZonelessChangeDetection()],
});

for (const entry of CATALOGUE) {
  const fixture = ANGULAR_FIXTURES[entry.name];
  if (!fixture) {
    missing(grid, entry, "angular");
    continue;
  }

  const body = card(grid, entry);
  try {
    /**
     * The card body IS the host, with no wrapper in between.
     *
     * A wrapper looks harmless and is not: `.pv-card__body` is a flex container,
     * so an extra `<div>` becomes the flex item and shrinks to its content —
     * every full-width component came out narrower on this page than on the
     * other three, which reads as a library difference and is purely this
     * file's doing. The parity harness mounts into `#mount` itself for the same
     * reason.
     */
    body.setAttribute("data-angular-root", "");

    const ref = createComponent(fixture, {
      environmentInjector: app.injector,
      hostElement: body,
      elementInjector: Injector.create({
        providers: [{ provide: PARITY_PROPS, useValue: entry.props }],
        parent: app.injector,
      }),
    });
    app.attachView(ref.hostView);

    // Marks Angular leaves on the element it took over, not anything a
    // component rendered — removed for the same reason the gate removes them.
    body.removeAttribute("ng-version");
    body.removeAttribute("data-angular-root");
  } catch (error) {
    failed(body, error);
  }
}

for (const { name, reason } of UNPREVIEWABLE) unpreviewable(grid, name, reason);
