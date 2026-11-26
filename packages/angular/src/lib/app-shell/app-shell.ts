import {
  Component,
  DestroyRef,
  Directive,
  Injector,
  TemplateRef,
  ViewChild,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import {
  APP_HEADER_CLASS,
  APP_HEADER_MENU_ICON_SIZE,
  APP_SHELL_BREAKPOINT,
  APP_SHELL_CLASS,
  appShellDataLayout,
  appShellNarrowQuery,
  appShellStyles,
  resolveAppShellLayout,
  type AppShellLayout,
  type AppShellResolvedLayout,
  type AppShellScroll,
} from "@ui-organized/core";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { glyph } from "../icons/glyph.js";
import { UioSheet, UioSheetTitle, UioSheetTrigger } from "../sheet/sheet.js";
import { UIO_SIDEBAR_HOST, type SidebarHost } from "../navigation/nav-context.js";

export type { AppShellLayout, AppShellResolvedLayout, AppShellScroll };

/**
 * The sidebar, as a template: AppShell renders it in the rail or in the sheet,
 * whichever the layout is, and never both.
 *
 * ```html
 * <ng-template uioAppShellSidebar><div uioSidebar>…</div></ng-template>
 * ```
 */
@Directive({ selector: "ng-template[uioAppShellSidebar]", standalone: true })
export class UioAppShellSidebar {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * An application's frame: a header across the top, a sidebar down the side,
 * and the page in a `<main>` beside it, after a skip link to it.
 *
 * ```html
 * <div uioAppShell>
 *   <header uioAppHeader><div uioAppHeaderLogo>Acme</div></header>
 *   <ng-template uioAppShellSidebar><div uioSidebar>…</div></ng-template>
 *   <div uioPageHeader title="Reports"></div>
 * </div>
 * ```
 *
 * Below `breakpoint` the sidebar moves into a sheet from the left, which the
 * header's menu button opens and a click that goes to a page closes. The sheet
 * is always in the template, closed in the rail layout, so crossing the
 * breakpoint closes it in the same change that drops its contents.
 *
 * ── Why the output is not `layoutChange` ────────────────────────────────────
 *
 * `layout` is an input and the layout in use is something else: `auto`
 * resolves to `rail` or `sheet`. An output called `layoutChange` would make
 * `[(layout)]` legal, and the first measurement would then write `sheet` back
 * into the binding and pin the shell there for good. `resolvedLayoutChange`
 * names what it reports.
 */
@Component({
  selector: "div[uioAppShell]",
  standalone: true,
  exportAs: "uioAppShell",
  imports: [NgTemplateOutlet, UioSheet, UioSheetTitle],
  template: `
    <a [class]="classes.skip" [href]="'#' + main()">{{ skipLinkLabel() }}</a>
    <ng-content select="[uioAppHeader]" />
    <div [class]="classes.body">
      @if (resolved() === "rail" && sidebar(); as slot) {
        <div [class]="classes.sidebar"><ng-container [ngTemplateOutlet]="slot.template" /></div>
      }
      <main [id]="main()" [class]="classes.main" tabindex="-1"><ng-content /></main>
    </div>
    <uio-sheet
      #sheet="uioSheet"
      side="left"
      size="sm"
      [panelClass]="classes.sheet"
      [open]="sheetOpen()"
      (openChange)="setOpen($event)"
    >
      @if (resolved() === "sheet" && sidebar(); as slot) {
        <h2 uioSheetTitle [class]="classes.sheetTitle">{{ navTitle() }}</h2>
        <ng-container
          [ngTemplateOutlet]="slot.template"
          [ngTemplateOutletInjector]="hostInjector"
        />
      }
    </uio-sheet>
  `,
  host: {
    "[class]": "hostClass()",
    "[attr.data-layout]": "dataLayout() ?? null",
  },
})
export class UioAppShell {
  /** `auto` (the default) is a rail, and a sheet below `breakpoint`. `rail` and `sheet` force one. */
  readonly layout = input<AppShellLayout>("auto");
  /** With `layout="auto"`: the viewport width, in px, at or below which the sidebar moves into a sheet. */
  readonly breakpoint = input(APP_SHELL_BREAKPOINT);
  /** Whether the sheet is open, in the sheet layout. Two-way: `[(navOpen)]`. */
  readonly navOpen = model(false);
  /** The sheet's accessible name. */
  readonly navTitle = input("Menu");
  /** `page` (the default) scrolls the document under a sticky header; `main` scrolls only the main area. */
  readonly scroll = input<AppShellScroll>("page");
  /** The skip link's text. */
  readonly skipLinkLabel = input("Skip to content");
  /** The `<main>`'s id, which the skip link targets. Generated when omitted. */
  readonly mainId = input<string | undefined>(undefined);
  /** The layout in use, when it is first known and whenever it changes. See the class note on the name. */
  readonly resolvedLayoutChange = output<AppShellResolvedLayout>();

  /** @internal The header's menu button opens this. */
  @ViewChild("sheet", { static: true }) sheet!: UioSheet;

  protected readonly classes = APP_SHELL_CLASS;
  protected readonly sidebar = contentChild(UioAppShellSidebar);

  /** Unknown until the page has rendered, so the server and the first render are a rail. */
  private readonly narrow = signal<boolean | undefined>(undefined);
  readonly resolved = computed(() => resolveAppShellLayout(this.layout(), this.narrow()));
  protected readonly dataLayout = computed(() => appShellDataLayout(this.layout(), this.narrow()));
  readonly hasSidebar = computed(() => this.sidebar() != null);

  private readonly generatedId = `app-shell-main-${nextMachineId()}`;
  protected readonly main = computed(() => this.mainId() ?? this.generatedId);
  protected readonly hostClass = computed(() => appShellStyles({ scroll: this.scroll() }));
  /** Shut whenever the layout is a rail, so it is never left open with nothing in it. */
  protected readonly sheetOpen = computed(() => this.resolved() === "sheet" && this.navOpen());

  /** Given only to the copy of the sidebar in the sheet. */
  protected readonly hostInjector = Injector.create({
    providers: [
      {
        provide: UIO_SIDEBAR_HOST,
        useValue: { inSheet: true, onNavigate: () => this.setOpen(false) } satisfies SidebarHost,
      },
    ],
    parent: inject(Injector),
  });

  private list?: MediaQueryList;
  private rendered = false;
  private readonly onChange = () => this.narrow.set(this.list?.matches);

  constructor() {
    afterNextRender(() => {
      this.rendered = true;
      this.listen(this.layout(), this.breakpoint());
    });
    effect(() => {
      const layout = this.layout();
      const breakpoint = this.breakpoint();
      if (this.rendered) untracked(() => this.listen(layout, breakpoint));
    });
    inject(DestroyRef).onDestroy(() => this.list?.removeEventListener("change", this.onChange));

    // Only a change from sheet to rail closes it: the first render of `auto`
    // is a rail before it has measured.
    let previous: AppShellResolvedLayout | undefined;
    effect(() => {
      const now = this.resolved();
      const was = previous;
      previous = now;
      if (was === "sheet" && now === "rail" && untracked(this.navOpen))
        untracked(() => this.setOpen(false));
    });

    let reported: AppShellResolvedLayout | undefined;
    effect(() => {
      const now = this.dataLayout();
      if (!now || now === reported) return;
      reported = now;
      untracked(() => this.resolvedLayoutChange.emit(now));
    });
  }

  /** @internal */
  setOpen(open: boolean): void {
    if (this.navOpen() !== open) this.navOpen.set(open);
  }

  private listen(layout: AppShellLayout, breakpoint: number): void {
    this.list?.removeEventListener("change", this.onChange);
    this.list = undefined;
    if (
      layout !== "auto" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      this.narrow.set(undefined);
      return;
    }
    this.list = window.matchMedia(appShellNarrowQuery(breakpoint));
    this.list.addEventListener("change", this.onChange);
    this.onChange();
  }
}

/** The product's mark, at the start of the header. The element is the slot itself. */
@Directive({
  selector: "[uioAppHeaderLogo]",
  standalone: true,
  host: { class: "app-header__logo" },
})
export class UioAppHeaderLogo {}

/** Navigation across the header, such as a NavigationMenu. Shown in the rail layout only. */
@Directive({
  selector: "[uioAppHeaderNav]",
  standalone: true,
  host: { class: "app-header__nav" },
})
export class UioAppHeaderNav {}

/** Controls at the end of the header. */
@Directive({
  selector: "[uioAppHeaderActions]",
  standalone: true,
  host: { class: "app-header__actions" },
})
export class UioAppHeaderActions {}

/**
 * The bar across the top of an AppShell: the product's mark, navigation and
 * controls. In the sheet layout it leads with the menu button that opens the
 * sidebar and leaves out its nav, which has no room on a narrow screen.
 *
 * ```html
 * <header uioAppHeader>
 *   <div uioAppHeaderLogo>Acme</div>
 *   <nav uioAppHeaderNav uioNavigationMenu aria-label="Main">…</nav>
 *   <div uioAppHeaderActions><button uioButton>Sign in</button></div>
 * </header>
 * ```
 */
@Component({
  selector: "header[uioAppHeader]",
  standalone: true,
  imports: [UioSheetTrigger, UioIcon],
  template: `
    @if (showMenu() || logo()) {
      <div [class]="classes.start">
        @if (showMenu()) {
          <button
            uioSheetTrigger
            [sheet]="shell?.sheet"
            [class]="classes.menu"
            [attr.aria-label]="menuLabel()"
          >
            <span uioIcon [name]="menuGlyph" [size]="menuIconSize"></span>
          </button>
        }
        <ng-content select="[uioAppHeaderLogo]" />
      </div>
    }
    @if (!inSheet()) {
      <ng-content select="[uioAppHeaderNav]" />
    }
    <ng-content select="[uioAppHeaderActions]" />
  `,
  host: { class: "app-header" },
})
export class UioAppHeader {
  /** The menu button's accessible name, in the sheet layout. */
  readonly menuLabel = input("Open navigation");

  protected readonly shell = inject(UioAppShell, { optional: true });
  protected readonly classes = APP_HEADER_CLASS;
  protected readonly menuGlyph = glyph("menu");
  protected readonly menuIconSize = APP_HEADER_MENU_ICON_SIZE;
  protected readonly logo = contentChild(UioAppHeaderLogo);

  protected readonly inSheet = computed(() => this.shell?.resolved() === "sheet");
  protected readonly showMenu = computed(() => this.inSheet() && !!this.shell?.hasSidebar());
}
