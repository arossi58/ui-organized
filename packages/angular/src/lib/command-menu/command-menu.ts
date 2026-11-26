import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import {
  createContains,
  detectPlatform,
  filterCommandItems,
  firstCommand,
  groupCommandItems,
  matchesHotkey,
  orderCommandItems,
  type KbdPlatform,
} from "@ui-organized/core";
import { HostPresence } from "../host-presence.js";
import { nextMachineId } from "../part-ids.js";
import { stateFlag } from "../part.js";
import { UioDialog } from "../dialog/dialog.js";
import { UioIcon, type IconName } from "../icons/icon.js";
import { glyph, type IconGlyph } from "../icons/glyph.js";
import { UioKbd } from "../kbd/kbd.js";
import { moveHighlight } from "../overlay/roving.js";

export interface CommandMenuItem {
  /** Emitted by `(select)` when the command runs. Unique within the menu. */
  value: string;
  /** The command's name, and what typing filters against. */
  label: string;
  /** A heading the command is listed under. */
  group?: string;
  /** An icon before the label. */
  icon?: IconName | IconGlyph;
  /** Keys shown at the end of the row, such as `['mod', 's']`. Display only. */
  shortcut?: readonly string[];
  /** Other words that should find the command. */
  keywords?: readonly string[];
  /** Listed but cannot run. */
  disabled?: boolean;
}

/**
 * A search box over a list of commands, in a dialog near the top of the screen.
 *
 * ```html
 * <uio-command-menu [items]="commands" hotkey="mod+k" (select)="run($event)"></uio-command-menu>
 * ```
 *
 * Typing narrows the list and highlights its first command; the arrows move
 * through it, wrapping at the ends; Enter or a click runs one. It is a
 * `uio-dialog` holding the parts of Ark's Listbox, written out here: React,
 * Svelte and Vue get them from Ark, and the markup is theirs, attribute for
 * attribute.
 *
 * Focus never leaves the search box. It is a combobox whose active descendant
 * is the highlighted row, so the rows cancel their own `mousedown`, where zag's
 * focus the list and the other three hand focus straight back.
 *
 * The element itself is taken out of the page, as `uio-dialog` is: everything
 * it renders is in the overlay, and React's leaves nothing where it was written.
 */
@Component({
  selector: "uio-command-menu",
  standalone: true,
  exportAs: "uioCommandMenu",
  imports: [UioDialog, UioIcon, UioKbd, NgTemplateOutlet],
  providers: [HostPresence],
  template: `
    <ng-template #row let-item>
      <div
        class="command-menu__item"
        data-scope="listbox"
        data-part="item"
        dir="ltr"
        role="option"
        aria-selected="false"
        data-layout="list"
        data-state="unchecked"
        data-orientation="vertical"
        [id]="itemId(item.value)"
        [attr.data-value]="item.value"
        [attr.data-highlighted]="flag(highlighted() === item.value)"
        [attr.data-disabled]="flag(!!item.disabled)"
        [attr.aria-disabled]="item.disabled ? 'true' : null"
        (mousedown)="$event.preventDefault()"
        (pointermove)="hover(item)"
        (click)="run(item)"
      >
        @if (item.icon; as icon) {
          <span class="command-menu__item-icon" aria-hidden="true"
            ><span uioIcon [name]="icon" [size]="16"></span
          ></span>
        }
        <div
          class="command-menu__item-text"
          data-scope="listbox"
          data-part="item-text"
          data-state="unchecked"
          [attr.data-highlighted]="flag(highlighted() === item.value)"
          [attr.data-disabled]="flag(!!item.disabled)"
        >
          {{ item.label }}
        </div>
        @if (item.shortcut; as keys) {
          <kbd uioKbd size="sm" [keys]="keys" [platform]="platform()"></kbd>
        }
      </div>
    </ng-template>
    <uio-dialog
      [open]="open()"
      (openChange)="setOpen($event)"
      [showClose]="false"
      [label]="label()"
      contentClass="command-menu"
    >
      <div
        class="command-menu__listbox"
        data-scope="listbox"
        data-part="root"
        dir="ltr"
        data-orientation="vertical"
        [id]="rootId"
      >
        <span
          class="command-menu__label"
          data-scope="listbox"
          data-part="label"
          dir="ltr"
          [id]="partId('label')"
          >{{ label() }}</span
        >
        <div class="command-menu__search">
          <span uioIcon [name]="glyph('search')" [size]="20"></span>
          <input
            #input
            class="command-menu__input"
            data-scope="listbox"
            data-part="input"
            dir="ltr"
            autocomplete="off"
            autocorrect="off"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            spellcheck="false"
            enterkeyhint="go"
            role="combobox"
            aria-expanded="true"
            [attr.aria-controls]="partId('content')"
            [attr.aria-activedescendant]="activeId()"
            [attr.aria-label]="label()"
            [attr.placeholder]="placeholder()"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
          />
        </div>
        <div
          class="command-menu__list"
          data-scope="listbox"
          data-part="content"
          dir="ltr"
          role="listbox"
          tabindex="-1"
          data-orientation="vertical"
          data-layout="list"
          [id]="partId('content')"
          [attr.data-activedescendant]="activeId()"
          [attr.aria-activedescendant]="activeId()"
          [attr.aria-labelledby]="partId('label')"
          [attr.data-empty]="flag(!matches().length)"
        >
          @for (entry of groups(); track entry.key; let g = $index) {
            @if (entry.group === null) {
              @for (item of entry.items; track item.value) {
                <ng-container
                  [ngTemplateOutlet]="row"
                  [ngTemplateOutletContext]="{ $implicit: item }"
                />
              }
            } @else {
              <div
                class="command-menu__group"
                data-scope="listbox"
                data-part="item-group"
                data-orientation="vertical"
                role="group"
                dir="ltr"
                [id]="partId('item-group:' + g)"
                [attr.aria-labelledby]="partId('item-group-label:' + g)"
              >
                <div
                  class="command-menu__group-label"
                  data-scope="listbox"
                  data-part="item-group-label"
                  dir="ltr"
                  role="presentation"
                  [id]="partId('item-group-label:' + g)"
                >
                  {{ entry.group }}
                </div>
                @for (item of entry.items; track item.value) {
                  <ng-container
                    [ngTemplateOutlet]="row"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                }
              </div>
            }
          }
          @if (!matches().length) {
            <div
              role="option"
              aria-disabled="true"
              aria-selected="false"
              class="command-menu__empty"
            >
              {{ emptyMessage() }}
            </div>
          }
        </div>
      </div>
    </uio-dialog>
  `,
})
export class UioCommandMenu implements OnInit, OnDestroy {
  protected readonly glyph = glyph;
  protected readonly flag = stateFlag;

  /** The commands, in order. */
  readonly items = input<readonly CommandMenuItem[]>([]);
  readonly open = model(false);
  /** Whether running a command closes the menu. */
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly placeholder = input("Type a command or search…");
  readonly emptyMessage = input("No results found.");
  /** The menu's accessible name, for the dialog, the search box and the list. */
  readonly label = input("Command menu");
  /** A shortcut that toggles the menu from anywhere, such as `mod+k`. Off unless set. */
  readonly hotkey = input<string | undefined>(undefined);
  /** Whose keys the rows' shortcuts draw. */
  readonly platform = input<KbdPlatform>("auto");
  /** A command's `value`, when it runs. */
  readonly select = output<string>();

  private readonly machine = nextMachineId();
  protected readonly rootId = `listbox:${this.machine}`;
  protected partId(part: string): string {
    return `listbox:${this.machine}:${part}`;
  }
  protected itemId(value: string): string {
    return this.partId(`item:${value}`);
  }

  /** Built once: the collator is the expensive part of a comparison. */
  private readonly contains = createContains();
  protected readonly query = signal("");
  protected readonly matches = computed(() =>
    orderCommandItems(filterCommandItems(this.items(), this.query(), this.contains)),
  );
  protected readonly groups = computed(() =>
    groupCommandItems(this.matches()).map(([group, items]) => ({ key: group ?? "", group, items })),
  );

  /** A row the pointer or the arrows moved to, kept until the query changes. See React's CommandMenu. */
  private readonly moved = signal<{ query: string; value: string } | null>(null);
  protected readonly highlighted = computed(() => {
    const moved = this.moved();
    const matches = this.matches();
    return moved &&
      moved.query === this.query() &&
      matches.some((item) => item.value === moved.value)
      ? moved.value
      : firstCommand(matches);
  });
  protected readonly activeId = computed(() => {
    const value = this.highlighted();
    return value === null ? null : this.itemId(value);
  });

  @ViewChild(UioDialog, { static: true }) private dialog!: UioDialog;
  @ViewChild("input", { static: true }) private input?: ElementRef<HTMLInputElement>;

  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly onDocumentKeydown = (event: KeyboardEvent) => {
    const hotkey = this.hotkey();
    if (!hotkey || event.defaultPrevented || event.repeat) return;
    if (!matchesHotkey(event, hotkey, detectPlatform())) return;
    event.preventDefault();
    this.setOpen(!this.open());
  };

  constructor() {
    // A menu reopened starts from the whole list, not the last search.
    effect(() => {
      if (!this.open()) untracked(() => this.query.set(""));
    });
    effect((onCleanup) => {
      if (!this.hotkey()) return;
      this.document.addEventListener("keydown", this.onDocumentKeydown);
      onCleanup(() => this.document.removeEventListener("keydown", this.onDocumentKeydown));
    });
  }

  ngOnInit(): void {
    this.presence.hide();
  }

  ngOnDestroy(): void {
    this.document.removeEventListener("keydown", this.onDocumentKeydown);
  }

  show(): void {
    this.setOpen(true);
  }
  hide(): void {
    this.setOpen(false);
  }
  toggle(): void {
    this.setOpen(!this.open());
  }

  protected setOpen(next: boolean): void {
    if (next === this.open()) return;
    // Focus goes back where it was on close, as zag's dialog does: there is no
    // trigger to remember when a hotkey opens it.
    if (next) this.dialog.rememberOpener(this.document.activeElement as HTMLElement | null);
    this.open.set(next);
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected hover(item: CommandMenuItem): void {
    if (item.disabled || this.highlighted() === item.value) return;
    this.moved.set({ query: this.query(), value: item.value });
  }

  protected run(item: CommandMenuItem): void {
    if (item.disabled) return;
    this.select.emit(item.value);
    if (this.closeOnSelect()) this.setOpen(false);
    else this.input?.nativeElement.focus({ preventScroll: true });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.matches();
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const current = items.findIndex((item) => item.value === this.highlighted());
        // zag's loopFocus: past either end wraps to the other.
        const next = moveHighlight(
          items.map((item) => ({ disabled: !!item.disabled })),
          current,
          event.key === "ArrowDown" ? 1 : -1,
        );
        const target = items[next];
        if (target) {
          this.moved.set({ query: this.query(), value: target.value });
          this.scrollToHighlighted();
        }
        return;
      }
      case "Enter": {
        const target = items.find((item) => item.value === this.highlighted());
        if (!target) return;
        event.preventDefault();
        return this.run(target);
      }
      default:
        return;
    }
  }

  /** zag scrolls the highlighted row into view; the CDK has nothing that does. */
  private scrollToHighlighted(): void {
    queueMicrotask(() => {
      const id = this.activeId();
      if (id) this.document.getElementById(id)?.scrollIntoView({ block: "nearest" });
    });
  }
}
